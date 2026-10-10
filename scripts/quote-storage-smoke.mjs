/**
 * Explicit synthetic TUS/Storage smoke test. Never part of normal CI or
 * production requests. Uses a random private temporary bucket, not quote-intake.
 * No quote records or customer data are created.
 */
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export class StorageSmokeError extends Error {
  constructor(stage, status) {
    super('storage_smoke_' + stage + (status === undefined ? '' : '_' + status));
    this.stage = stage;
  }
}

const SIX_MIB = 6 * 1024 * 1024;
const CONFIRMATION = 'RUN_ISOLATED_SUPABASE_STORAGE_SMOKE';

function checkConfig(origin, serviceKey, expectedRef) {
  let url;
  try { url = new URL(origin); } catch { throw new StorageSmokeError('invalid_origin'); }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash ||
      !/^[a-z0-9]{20}$/.test(expectedRef) ||
      url.hostname !== expectedRef + '.supabase.co') {
    throw new StorageSmokeError('wrong_project');
  }
  if (typeof serviceKey !== 'string' || !serviceKey.startsWith('sb_secret_') ||
      serviceKey.length < 40) throw new StorageSmokeError('invalid_service_key');
  return url.origin;
}

function fixture(resumable) {
  // A real binary STL: 80-byte header, uint32 triangles, 50 bytes per facet.
  // 125830 triangles = exactly 6MiB + 128 bytes, enabling a genuine resume.
  const facets = resumable ? 125830 : 1;
  const bytes = Buffer.alloc(84 + 50 * facets);
  bytes.write('CM isolated synthetic storage verification',0,'ascii');
  bytes.writeUInt32LE(facets,80);
  return bytes;
}

async function http(fetcher, url, options, stage, statuses) {
  let response;
  try {
    response = await fetcher(url, { ...options,
      redirect:'error', cache:'no-store', signal:AbortSignal.timeout(30000) });
  } catch { throw new StorageSmokeError(stage + '_network'); }
  if (!statuses.includes(response.status)) {
    throw new StorageSmokeError(stage,response.status);
  }
  return response;
}

async function json(response, stage) {
  try { return await response.json(); }
  catch { throw new StorageSmokeError(stage + '_json'); }
}

async function head(fetcher, uploadUrl, signature, target, stage) {
  const response = await http(fetcher,uploadUrl,{method:'HEAD',
    headers:{'Tus-Resumable':'1.0.0','x-signature':signature}},
    stage,[200,204]);
  if (Number(response.headers.get('upload-offset')) !== target) {
    throw new StorageSmokeError(stage + '_offset');
  }
}

async function range(fetcher, base, key, bucket, path, bytes, first, last) {
  const res = await http(fetcher,
    base + '/storage/v1/object/' + bucket + '/' + path, {
      method:'GET',headers:{apikey:key,Range:'bytes=' + first + '-' + last},
    },'range',[206]);
  if (res.headers.get('content-range') !==
      'bytes ' + first + '-' + last + '/' + bytes.length) {
    throw new StorageSmokeError('range_content_header');
  }
  const actual = Buffer.from(await res.arrayBuffer());
  if (!actual.equals(bytes.subarray(first,last+1))) {
    throw new StorageSmokeError('range_content_bytes');
  }
}

async function teardown(fetcher, base, key, bucket, path) {
  const headers={apikey:key,'content-type':'application/json'};
  try {
    await http(fetcher,base + '/storage/v1/object/' + bucket, {
      method:'DELETE',headers,body:JSON.stringify({prefixes:[path]}),
    },'teardown_object',[200,201,204,404]);
  } catch { /* empty bucket still clears leftover objects */ }
  await http(fetcher,base + '/storage/v1/bucket/' + bucket + '/empty',
    {method:'POST',headers},'teardown_empty',[200,201,204]);
  await http(fetcher,base + '/storage/v1/bucket/' + bucket,
    {method:'DELETE',headers},'teardown_bucket',[200,201,204]);
  // Supabase Storage responds HTTP 400 with code NoSuchBucket after a
  // successful DELETE (the internal status is 404). Require the exact
  // Storage error code: a generic 400/404 is NOT sufficient evidence.
  const absent = await http(fetcher,base + '/storage/v1/bucket/' + bucket,
    {method:'GET',headers:{apikey:key}},'confirm_bucket_absent',[400,404]);
  const absence = await json(absent,'confirm_bucket_absent');
  if (absence?.code !== 'NoSuchBucket') {
    throw new StorageSmokeError('bucket_absence_unconfirmed');
  }
}

/** Only synthetic data. Never copies a file or reveals secrets or upload URLs. */
export async function runStorageSmoke({
  origin, serviceKey, expectedProjectRef, resumable = true,
  fetcher = fetch, uuid = randomUUID,
}) {
  const base = checkConfig(origin,serviceKey,expectedProjectRef);
  const bucket = 'cm-storage-qa-' + uuid().replace(/-/g,'').slice(0,20);
  const path = uuid() + '/' + uuid() + '.stl';
  if (!/^cm-storage-qa-[a-f0-9]{20}$/.test(bucket) ||
      !/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.stl$/.test(path)) {
    throw new StorageSmokeError('invalid_synthetic_path');
  }
  const file = fixture(resumable);
  const auth = {apikey:serviceKey,'content-type':'application/json'};
  const uploadOrigin = 'https://' + expectedProjectRef + '.storage.supabase.co';
  let created = false;
  let primaryFailure = null;
  try {
    // Fail BEFORE any write if this is not the isolated CM schema/bucket.
    // A matching URL/ref alone cannot prove that an operator selected CM.
    const serviceReady = await http(fetcher,
      base + '/rest/v1/rpc/quote_retention_active', {
        method:'POST',headers:auth,body:JSON.stringify({p_token:uuid()}),
      },'verify_cm_schema',[200]);
    if (await json(serviceReady,'verify_cm_schema') !== false) {
      throw new StorageSmokeError('unexpected_lease_proof');
    }
    const coreBucket = await http(fetcher,
      base + '/storage/v1/bucket/quote-intake', {
        method:'GET',headers:{apikey:serviceKey},
      },'verify_cm_private_bucket',[200]);
    const core = await json(coreBucket,'verify_cm_private_bucket');
    if (core?.id !== 'quote-intake' || core.public !== false) {
      throw new StorageSmokeError('wrong_cm_storage_boundary');
    }

    const bucketResponse = await http(fetcher,base + '/storage/v1/bucket',{
      method:'POST',headers:auth,body:JSON.stringify({id:bucket,name:bucket,
        public:false,file_size_limit:10000000,
        allowed_mime_types:['application/octet-stream']}),
    },'create_bucket',[200,201]);
    await json(bucketResponse,'create_bucket');
    created = true;

    const signatureRes = await http(fetcher,
      base + '/storage/v1/object/upload/sign/' + bucket + '/' + path, {
        method:'POST',headers:auth,body:'{}',
      },'sign_upload',[200,201]);
    const signed = await json(signatureRes,'sign_upload');
    if (typeof signed?.url !== 'string' ||
        !signed.url.startsWith('/object/upload/sign/' + bucket + '/' + path + '?')) {
      throw new StorageSmokeError('invalid_signed_url');
    }
    const token = new URL(signed.url,base + '/storage/v1/').searchParams.get('token');
    if (!token || token.length > 4096 ||
        !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
      // The x-signature contract requires a compact JWS; report its shape
      // only. Never print token bytes or a signed URL to the job log.
      throw new StorageSmokeError('signed_token_not_compact_jws');
    }

    const tusEndpoint = uploadOrigin + '/storage/v1/upload/resumable';
    const tusHeaders = {'Tus-Resumable':'1.0.0','x-signature':token};
    const metadata = [
      ['bucketName',bucket],['objectName',path],
      ['contentType','application/octet-stream'],['cacheControl','0'],
    ].map(([k,v])=>k + ' ' + Buffer.from(v).toString('base64')).join(',');
    const post = await http(fetcher,tusEndpoint,{
      method:'POST',headers:{...tusHeaders,'Upload-Length':String(file.length),
        'Upload-Metadata':metadata},
    },'tus_create',[201]);
    const location = post.headers.get('location');
    if (!location) throw new StorageSmokeError('missing_upload_location');
    const uploadUrl = new URL(location,tusEndpoint);
    if (![base,uploadOrigin].includes(uploadUrl.origin) ||
        !uploadUrl.pathname.startsWith('/storage/v1/upload/resumable/') ||
        uploadUrl.username || uploadUrl.password) {
      throw new StorageSmokeError('unsafe_upload_location');
    }

    await head(fetcher,uploadUrl.href,token,0,'tus_initial_head');
    async function patch(first,last,stage) {
      const res = await http(fetcher,uploadUrl.href,{
        method:'PATCH',
        headers:{...tusHeaders,'Upload-Offset':String(first),
          'Content-Type':'application/offset+octet-stream'},
        body:file.subarray(first,last),
      },stage,[204]);
      if (Number(res.headers.get('upload-offset')) !== last) {
        throw new StorageSmokeError(stage + '_offset');
      }
    }
    const firstEnd = resumable ? SIX_MIB : file.length;
    await patch(0,firstEnd,'tus_first_chunk');
    await head(fetcher,uploadUrl.href,token,firstEnd,'tus_resume_head');
    if (resumable) {
      await patch(firstEnd,file.length,'tus_final_chunk');
      await head(fetcher,uploadUrl.href,token,file.length,'tus_final_head');
    }

    const infoRes = await http(fetcher,
      base + '/storage/v1/object/info/' + bucket + '/' + path,
      {method:'GET',headers:{apikey:serviceKey}},
      'object_info',[200]);
    const info = await json(infoRes,'object_info');
    if (info?.size !== file.length) throw new StorageSmokeError('object_size');

    await range(fetcher,base,serviceKey,bucket,path,file,0,83);
    await range(fetcher,base,serviceKey,bucket,path,file,file.length-50,file.length-1);

    // In a private bucket, unauthenticated download must never succeed.
    const denied = await http(fetcher,
      base + '/storage/v1/object/' + bucket + '/' + path, {
        method:'GET',headers:{},
      },'anonymous_download',[400,401,403,404]);
    if (denied.ok) throw new StorageSmokeError('public_read');

    return { result:'PASS', mode:resumable?'resumed-6MiB':'small',
      bytes:file.length, signedTus:true, offsetResume:true, ranges:true,
      anonymousDenied:true, isolatedTestBucket:true };
  } catch (error) {
    primaryFailure = error;
    throw error;
  } finally {
    if (created) {
      try { await teardown(fetcher,base,serviceKey,bucket,path); }
      catch {
        // Never replace the upload error with an ambiguous cleanup error.
        // The only surfaced identifier is our random synthetic bucket.
        const reason = primaryFailure instanceof StorageSmokeError
          ? primaryFailure.message.replace(/^storage_smoke_/, '')
          : primaryFailure ? 'unexpected' : null;
        throw new StorageSmokeError(
          'cleanup_required_' + bucket + (reason ? '_after_' + reason : '')
        );
      }
    }
  }
}

const invokedAsCli = Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsCli) {
  if (process.env.CM_STORAGE_SMOKE_CONFIRM !== CONFIRMATION) {
    console.error('Refusing Storage writes: missing explicit confirmation.');
    process.exitCode = 2;
  } else {
    try {
      const result = await runStorageSmoke({
        origin:process.env.CM_SUPABASE_URL,
        serviceKey:process.env.CM_SUPABASE_SECRET_KEY,
        expectedProjectRef:process.env.CM_STORAGE_SMOKE_PROJECT_REF,
        resumable:process.env.CM_STORAGE_SMOKE_MODE !== 'small',
      });
      process.stdout.write(JSON.stringify(result) + '\n');
    } catch (error) {
      console.error(error instanceof StorageSmokeError ? error.message : 'storage_smoke_failed');
      process.exitCode = 1;
    }
  }
}
