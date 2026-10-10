import assert from 'node:assert/strict';
import test from 'node:test';
import { runStorageSmoke, StorageSmokeError } from '../scripts/quote-storage-smoke.mjs';

const REF = 'aaaaaaaaaaaaaaaaaaaa';
const BASE = 'https://' + REF + '.supabase.co';
const KEY = 'sb_secret_' + 'K'.repeat(48);
const TOKEN = 't'.repeat(48);

function mockStorage({mode='normal'}={}) {
  const calls=[], objects = new Map();
  let bucket, object, tusOffset=0, data=Buffer.alloc(0), ended=false;
  const fake = async (url,opts) => {
    const u=new URL(url);
    const path=u.pathname, method=opts.method;
    calls.push({method,path,headers:opts.headers,body:opts.body});
    const answer=(value, status=200, headers={}) =>
      new Response(value==null?null:JSON.stringify(value),{
        status,headers:{...headers,...(value==null?{}:{'content-type':'application/json'})},
      });
    if(path==='/rest/v1/rpc/quote_retention_active' && method==='POST'){
      assert.match(opts.headers.apikey,/^sb_secret_/);
      return answer(false);
    }
    if(path==='/storage/v1/bucket/quote-intake' && method==='GET'){
      return answer({id:mode==='wrong-boundary'?'something-else':'quote-intake',public:false});
    }
    if(path==='/storage/v1/bucket' && method==='POST'){
      bucket=JSON.parse(opts.body).id;
      assert.equal(JSON.parse(opts.body).public,false);
      return answer({name:bucket},201);
    }
    if(path==='/storage/v1/bucket/'+bucket+'/empty' && method==='POST'){
      objects.clear();return answer({message:'Successfully emptied bucket'});
    }
    if(path==='/storage/v1/bucket/'+bucket && method==='DELETE'){
      ended=true;return answer({message:'Successfully deleted'});
    }
    if(path==='/storage/v1/bucket/'+bucket && method==='GET'){
      return answer({code:'NoSuchBucket'},ended?404:200);
    }
    if(path.startsWith('/storage/v1/object/upload/sign/') && method==='POST'){
      object=path.slice(('/storage/v1/object/upload/sign/'+bucket+'/').length);
      return answer({url:'/object/upload/sign/'+bucket+'/'+object+'?token='+TOKEN});
    }
    if(path==='/storage/v1/upload/resumable' && method==='POST'){
      assert.equal(opts.headers['x-signature'],TOKEN);
      data=Buffer.alloc(Number(opts.headers['Upload-Length']));
      assert.ok(Buffer.byteLength(opts.headers['Upload-Metadata'])>0);
      return new Response(null,{status:201,
        headers:{location:'https://'+REF+'.storage.supabase.co/storage/v1/upload/resumable/upload-fixture'}});
    }
    if(path==='/storage/v1/upload/resumable/upload-fixture'){
      if(method==='HEAD')return new Response(null,{status:200,headers:{'upload-offset':String(tusOffset)}});
      if(method==='PATCH'){
        const offset=Number(opts.headers['Upload-Offset']);
        assert.equal(offset,tusOffset);
        const chunk=Buffer.from(opts.body);
        if(mode==='patch-failure')return answer({error:'synthetic'},503);
        chunk.copy(data,tusOffset);
        tusOffset+=chunk.length;
        if(tusOffset===data.length)objects.set(object,data);
        return new Response(null,{status:204,headers:{'upload-offset':String(tusOffset)}});
      }
    }
    if(path==='/storage/v1/object/info/'+bucket+'/'+object && method==='GET'){
      return objects.has(object)?answer({size:objects.get(object).length})
        :answer({message:'not found'},404);
    }
    if(path==='/storage/v1/object/'+bucket && method==='DELETE'){
      objects.delete(JSON.parse(opts.body).prefixes[0]);return answer([]);
    }
    if(path==='/storage/v1/object/'+bucket+'/'+object && method==='GET'){
      if(!opts.headers.apikey){
        return mode==='public-leak'?new Response('wrong',{status:200})
          :answer({message:'unauthorized'},401);
      }
      const match=/^bytes=(\d+)-(\d+)$/.exec(opts.headers.Range||'');
      assert.ok(match);
      const start=Number(match[1]),last=Number(match[2]);
      const original=objects.get(object);
      if(!original) return answer({message:'not found'},404);
      const bytes=original.subarray(start,last+1);
      return new Response(bytes,{status:206,headers:{
        'content-range':mode==='wrong-range'?'bytes invalid':'bytes '+start+'-'+last+'/'+original.length}});
    }
    throw Error('Unexpected mocked Storage request '+method+' '+path);
  };
  return {fetcher:fake,calls,clean:()=>ended && objects.size===0};
}
function input(mock,resumable=false,expectedProjectRef=REF) {
  return { origin:BASE,serviceKey:KEY,expectedProjectRef,resumable,
    fetcher:mock.fetcher,
    uuid:(()=>{
      let n=0;
      const ids=[
        '5c837d8a-f66b-4d36-9206-19b78dd003a1',
        '681d6a9c-2cf7-4ca5-a5a3-186522c249fa',
        'd217829b-b3a4-4a6a-a842-3181118a3a4c',
      ];
      return ()=>ids[n++%ids.length];
    })(),
  };
}
test('signed TUS -> authenticated byte-range -> anonymous deny -> physical cleanup (small)',async()=>{
  const mock=mockStorage();
  const outcome=await runStorageSmoke(input(mock));
  assert.equal(outcome.result,'PASS');
  assert.equal(outcome.bytes,134);
  assert.equal(outcome.anonymousDenied,true);
  assert.equal(mock.clean(),true);
  const steps=mock.calls.map(x=>x.method);
  assert.deepEqual(steps.slice(0,2),['POST','GET']);
  assert.equal(steps.filter(x=>x==='PATCH').length,1);
  assert.equal(steps.filter(x=>x==='HEAD').length,2);
  assert.deepEqual(steps.slice(-4),['DELETE','POST','DELETE','GET']);
  for(const row of mock.calls){
    if(row.path.includes('/upload/resumable')){
      assert.equal(row.headers.Authorization,undefined);
      assert.equal(row.headers.apikey,undefined);
    }
  }
});
test('full 6 MiB + 128 byte binary STL resumes via HEAD and second PATCH',async()=>{
  const mock=mockStorage();
  const result=await runStorageSmoke(input(mock,true));
  assert.equal(result.mode,'resumed-6MiB');
  assert.equal(result.bytes,6*1024*1024+128);
  assert.equal(mock.calls.filter(x=>x.method==='PATCH').length,2);
  assert.equal(mock.calls.filter(x=>x.method==='HEAD').length,3);
  assert.equal(mock.clean(),true);
});
test('cannot contact any project except the explicitly confirmed project',async()=>{
  const mock=mockStorage();
  await assert.rejects(runStorageSmoke(input(mock,false,'bbbbbbbbbbbbbbbbbbbb')),
    err=>err instanceof StorageSmokeError && err.stage==='wrong_project');
  assert.deepEqual(mock.calls,[]);
});
test('a wrong private-bucket boundary is rejected before any Storage mutation',async()=>{
  const mock=mockStorage({mode:'wrong-boundary'});
  await assert.rejects(runStorageSmoke(input(mock)),
    err=>err instanceof StorageSmokeError && err.stage==='wrong_cm_storage_boundary');
  assert.deepEqual(mock.calls.map(x=>x.method),['POST','GET']);
  assert.equal(mock.calls.some(x=>x.path==='/storage/v1/bucket' && x.method==='POST'),false);
});
test('invalid range and public leak both fail closed, still deleting isolated bucket',async()=>{
  for(const mode of ['wrong-range','public-leak']){
    const mock=mockStorage({mode});
    await assert.rejects(runStorageSmoke(input(mock)));
    assert.equal(mock.clean(),true);
  }
});
test('TUS chunk failure attempts cleanup without leaving an unclaimed bucket',async()=>{
  const mock=mockStorage({mode:'patch-failure'});
  await assert.rejects(runStorageSmoke(input(mock,true)),/tus_first_chunk_503/);
  assert.equal(mock.clean(),true);
});
