import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import {
  handleQuoteSession, handleQuoteAttachmentComplete, handleQuoteSubmit,
} from '../src/server/quote/handlers.ts';
import { detectQuoteFile } from '../src/server/quote/file-sniffer.ts';

const envKeys = ['CM_QUOTE_INTAKE_ENABLED','CM_QUOTE_SESSION_SECRET',
  'CM_QUOTE_RATE_LIMIT_SECRET','VERCEL','NODE_ENV'];
const previousEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
process.env.CM_QUOTE_INTAKE_ENABLED = 'true';
process.env.CM_QUOTE_SESSION_SECRET = 'S'.repeat(48);
process.env.CM_QUOTE_RATE_LIMIT_SECRET = 'R'.repeat(48);
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';
after(() => { for (const [key,value] of Object.entries(previousEnv)) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
} });

const requestId = '21a9b45c-37ad-4fc9-87c4-540a08d3fdde';
const attachmentId = 'f8dabaf9-0a1c-49fb-b426-8420993c4612';
const submissionKey = '11111111-1111-4111-8111-111111111111';
const pdf = new TextEncoder().encode('%PDF-1.7\n1 0 obj\n');
const calls = [];

function request(route, data, cookie) {
  return new Request(`https://studio.example${route}`, {
    method:'POST',
    headers:{
      origin:'https://studio.example','content-type':'application/json',
      'x-vercel-forwarded-for':'203.0.113.42',
      ...(cookie ? { cookie } : {}),
    },
    body:JSON.stringify(data),
  });
}

const gateway = {
  async consumeRate() { return true; },
  async createDraft() { return {id:requestId,expires_at:'2026-10-10T10:00:00Z'}; },
  async reserveAttachment() { throw new Error('not called'); },
  async signUpload() { throw new Error('not called'); },
  async ownedAttachment() {
    calls.push('owned');
    return {attachment_id:attachmentId,
      storage_path:`${requestId}/${attachmentId}.pdf`,
      original_name:'ref.pdf',extension:'.pdf',
      reported_size_bytes:pdf.length,validation_status:'pending-upload',
      validated_size_bytes:null};
  },
  async storageFileSize() {calls.push('info');return pdf.length;},
  async readStorageRange(path,first,last) {
    calls.push('range');
    assert.equal(first,0);
    assert.equal(last,pdf.length-1);
    return pdf;
  },
  async validateAttachment(id,ownerHash,aId,size,detected) {
    calls.push('validated');
    assert.equal(id,requestId);
    assert.match(ownerHash,/^[a-f0-9]{64}$/);
    assert.equal(aId,attachmentId);
    assert.equal(size,pdf.length);
    assert.equal(detected,'pdf');
  },
  async submitQuote(data) {
    calls.push('submit');
    assert.equal(data.requestId,requestId);
    assert.match(data.ownerHash,/^[a-f0-9]{64}$/);
    assert.equal(data.triageStatus,'needs-information');
    assert.deepEqual(data.attachmentIds,[]);
    return {request_id:requestId,submission_time:'2026-10-09T14:00:00Z'};
  }
};

async function cookie() {
  const r = await handleQuoteSession(request('/api/quote/session',{projectType:'placa'}), gateway);
  assert.equal(r.status,201);
  return r.headers.get('set-cookie')?.split(';')[0];
}

function draft() {
  return {
    schemaVersion:1,projectType:'placa',source:{},startingPoints:['Tenho logo'],
    noFile:true,attachments:[],
    production:{quantity:'1',sizeScale:'',material:'nao-sei',
      materialPreference:'',color:'',deadline:''},
    project:{kind:'placa',use:'balcao',contents:['Logo'],size:'',lighting:'nao-sei'},
    contact:{method:'email',name:'Pessoa Exemplo',value:'person@example.invalid'}
  };
}

test('content signatures reject renamed files and generic ZIP masquerading as 3MF', () => {
  assert.equal(detectQuoteFile('.pdf',pdf,pdf.length),'pdf');
  assert.equal(detectQuoteFile('.stl',pdf,pdf.length),null);
  const zip = new Uint8Array([80,75,3,4,...new Uint8Array(12)]);
  assert.equal(detectQuoteFile('.3mf',zip,zip.length),null);
  assert.equal(detectQuoteFile('.png',new Uint8Array([137,80,78,71,13,10,26,10]),8),'png');
  const binStl=new Uint8Array(134);
  new DataView(binStl.buffer).setUint32(80,1,true);
  assert.equal(detectQuoteFile('.stl',binStl,binStl.length),'stl-binary');
});

test('complete checks cookie+owner, object size, bounded signature, then DB transition', async () => {
  const session = await cookie();
  calls.length = 0;
  const r = await handleQuoteAttachmentComplete(request('/api/quote/attachments/complete',
    {requestId,attachmentId},session),gateway);
  assert.equal(r.status,200);
  assert.deepEqual(calls,['owned','info','range','validated']);
  assert.equal((await r.json()).validated,true);
});

test('complete denies missing session before any fetch and rejects false file signature', async () => {
  calls.length=0;
  const missing=await handleQuoteAttachmentComplete(request('/api/quote/attachments/complete',
    {requestId,attachmentId}),gateway);
  assert.equal(missing.status,403);
  assert.deepEqual(calls,[]);
  const session=await cookie();
  calls.length=0;
  const wrong=await handleQuoteAttachmentComplete(request('/api/quote/attachments/complete',
    {requestId,attachmentId},session),{
      ...gateway,async readStorageRange(){return new Uint8Array(16);},
      async validateAttachment(){throw new Error('must not validate');}
    });
  assert.equal(wrong.status,409);
  assert.deepEqual(calls,['owned','info']);
});

test('submit validates canonical draft, classifies on server, and returns private-free receipt', async () => {
  const session=await cookie();
  calls.length=0;
  const response=await handleQuoteSubmit(request('/api/quote/submit',
    {requestId,submissionKey,draft:draft(),attachmentIds:[]},session),gateway);
  assert.equal(response.status,201);
  assert.deepEqual(calls,['submit']);
  assert.deepEqual(await response.json(),
    {requestId,submittedAt:'2026-10-09T14:00:00Z'});
});

test('submit rejects forged attachment ids, inconsistent draft, wrong session', async () => {
  const session=await cookie();
  const cases=[
    {requestId,submissionKey,draft:draft(),attachmentIds:[attachmentId]},
    {requestId,submissionKey,draft:{...draft(),noFile:false},attachmentIds:[]},
    {requestId,submissionKey,draft:draft(),attachmentIds:[attachmentId,attachmentId]},
  ];
  for(const body of cases){
    calls.length=0;
    const response=await handleQuoteSubmit(request('/api/quote/submit',body,session),gateway);
    assert.equal(response.status,400);
    assert.deepEqual(calls,[]);
  }
  const missing=await handleQuoteSubmit(request('/api/quote/submit',
    {requestId,submissionKey,draft:draft(),attachmentIds:[]}),gateway);
  assert.equal(missing.status,403);
});

test('flag stays a hard gate for complete and submit', async () => {
  const session=await cookie();
  process.env.CM_QUOTE_INTAKE_ENABLED='false';
  try {
    const requests=[
      await handleQuoteAttachmentComplete(request('/api/quote/attachments/complete',
        {requestId,attachmentId},session),gateway),
      await handleQuoteSubmit(request('/api/quote/submit',
        {requestId,submissionKey,draft:draft(),attachmentIds:[]},session),gateway)
    ];
    assert.deepEqual(requests.map(r=>r.status),[503,503]);
  } finally {process.env.CM_QUOTE_INTAKE_ENABLED='true';}
});
