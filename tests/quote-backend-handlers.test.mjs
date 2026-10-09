import assert from "node:assert/strict";
import test, { after } from "node:test";
import { handleQuoteSession, handleQuoteAttachmentInit } from "../src/server/quote/handlers.ts";
import { createQuoteGateway } from "../src/server/quote/supabase-gateway.ts";

const keys = ["CM_QUOTE_INTAKE_ENABLED", "CM_QUOTE_SESSION_SECRET", "CM_QUOTE_RATE_LIMIT_SECRET",
  "NODE_ENV", "VERCEL", "CM_SUPABASE_URL", "CM_SUPABASE_SECRET_KEY"];
const oldEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
process.env.CM_QUOTE_INTAKE_ENABLED = "true";
process.env.CM_QUOTE_SESSION_SECRET = "S".repeat(48);
process.env.CM_QUOTE_RATE_LIMIT_SECRET = "R".repeat(48);
process.env.VERCEL = "1";
process.env.NODE_ENV = "production";
after(() => {
  for (const [key, value] of Object.entries(oldEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const requestId = "21a9b45c-37ad-4fc9-87c4-540a08d3fdde";
const attachmentId = "f8dabaf9-0a1c-49fb-b426-8420993c4612";
const uploadKey = "11111111-1111-4111-8111-111111111111";
const storagePath = `${requestId}/${attachmentId}.stl`;

function request(route, body, headers = {}) {
  return new Request(`https://studio.example${route}`, {
    method: "POST",
    headers: {
      origin: "https://studio.example",
      "content-type": "application/json",
      "x-vercel-forwarded-for": "203.0.113.19",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

const calls = [];
const gateway = {
  async consumeRate(action, key) {
    calls.push({ method: "rate", action, key });
    return true;
  },
  async createDraft(hash, projectType) {
    calls.push({ method: "create", hash, projectType });
    return { id: requestId, expires_at: "2026-10-10T10:00:00Z" };
  },
  async reserveAttachment(input) {
    calls.push({ method: "reserve", ...input });
    return {
      attachment_id: attachmentId,
      object_path: storagePath,
      reservation_expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    };
  },
  async signUpload(objectPath) {
    calls.push({ method: "sign", objectPath });
    return {
      token: "signed-token-for-tests-only",
      endpoint: "https://studio.storage.supabase.co/storage/v1/upload/resumable"
    };
  }
};

test("disabled intake never reaches a backend, even with valid body", async () => {
  calls.length = 0;
  process.env.CM_QUOTE_INTAKE_ENABLED = "false";
  const response = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }), gateway);
  process.env.CM_QUOTE_INTAKE_ENABLED = "true";
  assert.equal(response.status, 503);
  assert.equal(calls.length, 0);
});

test("session creates only HMAC ownership, secure host-only cookie, no-store", async () => {
  calls.length = 0;
  const response = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }), gateway);
  assert.equal(response.status, 201);
  assert.equal((await response.json()).requestId, requestId);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /__Host-cm-quote-session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\//);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(calls[0].key, /^[a-f0-9]{64}$/);
  assert.match(calls[1].hash, /^[a-f0-9]{64}$/);
  assert.equal(cookie.includes(calls[1].hash), false);
});

test("cross-origin and unexpected browser requests fail before using data service", async () => {
  for (const headers of [
    { origin: "https://attacker.example" },
    { "sec-fetch-site": "cross-site" },
    { "content-type": "text/plain" }
  ]) {
    calls.length = 0;
    const response = await handleQuoteSession(request("/api/quote/session",
      { projectType: "impressao" }, headers), gateway);
    assert.ok([403, 415].includes(response.status));
    assert.equal(calls.length, 0);
  }
  calls.length = 0;
  const unexpected = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao", admin: true }), gateway);
  assert.equal(unexpected.status, 400);
  assert.equal(calls.length, 0);
  const huge = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }, { "content-length": "999999" }), gateway);
  assert.equal(huge.status, 413);
});

test("invalid proxy identity and anonymous/multiple session cookies fail closed", async () => {
  calls.length = 0;
  const invalid = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }, { "x-vercel-forwarded-for": "not-an-ip" }), gateway);
  assert.equal(invalid.status, 503);
  assert.equal(calls.length, 0);
  const missing = await handleQuoteAttachmentInit(request("/api/quote/attachments/init",
    { requestId, uploadKey, name: "modelo.stl", size: 1234 }), gateway);
  assert.equal(missing.status, 403);
  const duplicate = await handleQuoteAttachmentInit(request("/api/quote/attachments/init",
    { requestId, uploadKey, name: "modelo.stl", size: 1234 },
    { cookie: "__Host-cm-quote-session=a; __Host-cm-quote-session=b" }), gateway);
  assert.equal(duplicate.status, 403);
});

test("attachment init validates file and ownership, then signs only the reserved path", async () => {
  const response = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }), gateway);
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  calls.length = 0;
  const valid = await handleQuoteAttachmentInit(request("/api/quote/attachments/init",
    { requestId, uploadKey, name: "modelo.stl", size: 50_000_000, type: "application/octet-stream" },
    { cookie }), gateway);
  assert.equal(valid.status, 200);
  const result = await valid.json();
  assert.equal(result.attachmentId, attachmentId);
  assert.equal(result.uploadPath, storagePath);
  assert.equal(result.tokenHeader, "x-signature");
  assert.equal(result.uploadToken, "signed-token-for-tests-only");
  assert.ok(Date.parse(result.uploadTokenExpiresAt) > Date.now());
  assert.ok(Date.parse(result.uploadTokenExpiresAt) <= Date.parse(result.reservationExpiresAt));
  assert.equal(calls[0].action, "upload");
  assert.equal(calls[1].sizeBytes, 50_000_000);
  assert.equal(calls[2].objectPath, storagePath);

  for (const file of [
    { name: "modelo.zip", size: 123 },
    { name: "modelo.stl", size: 50_000_001 }
  ]) {
    calls.length = 0;
    const invalid = await handleQuoteAttachmentInit(request("/api/quote/attachments/init",
      { requestId, uploadKey, ...file }, { cookie }), gateway);
    assert.equal(invalid.status, 400);
    assert.equal(calls.length, 0);
  }
});

test("old reservation never mints a fresh 2-hour TUS token", async () => {
  const response = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }), gateway);
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  calls.length = 0;
  const result = await handleQuoteAttachmentInit(request("/api/quote/attachments/init",
    { requestId, uploadKey, name: "modelo.stl", size: 1234 }, { cookie }),
    { ...gateway, async reserveAttachment(input) {
      return {
        attachment_id: attachmentId,
        object_path: storagePath,
        reservation_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
    } });
  assert.equal(result.status, 409);
  assert.equal(calls.some(call => call.method === "sign"), false);
});

test("rate limiter responds 429, upstream errors never expose sensitive messages", async () => {
  const limited = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }), { ...gateway, async consumeRate() { return false; } });
  assert.equal(limited.status, 429);
  const failed = await handleQuoteSession(request("/api/quote/session",
    { projectType: "impressao" }),
    { ...gateway, async createDraft() { throw new Error("secret-database-message"); } });
  assert.equal(failed.status, 503);
  assert.equal((await failed.text()).includes("secret-database"), false);
});

test("native gateway sends sb_secret only as apikey, with no auth Bearer header", async () => {
  process.env.CM_SUPABASE_URL = "https://example-project.supabase.co";
  process.env.CM_SUPABASE_SECRET_KEY = "sb_secret_" + "A".repeat(32);
  const sent = [];
  const mockFetch = async (url, opts) => {
    sent.push({ url, opts });
    if (url.includes("quote_consume_rate_limit")) return Response.json(true);
    if (url.includes("quote_reserve_attachment")) {
      return Response.json([{
        attachment_id: attachmentId, object_path: storagePath,
        reservation_expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      }]);
    }
    if (url.includes("/storage/v1/object/upload/sign/")) {
      return Response.json({ url: `/object/upload/sign/quote-intake/${storagePath}?token=${"s".repeat(48)}` });
    }
    return Response.json([{ id: requestId, expires_at: "2026-10-10T10:00:00Z" }]);
  };
  const db = createQuoteGateway(mockFetch);
  assert.equal(await db.consumeRate("create", "a".repeat(64)), true);
  await db.createDraft("a".repeat(64), "impressao");
  const reserved = await db.reserveAttachment({
    requestId, ownerHash: "a".repeat(64), uploadKey,
    originalName: "modelo.stl", extension: ".stl",
    reportedMime: "application/octet-stream", sizeBytes: 1000
  });
  assert.equal(reserved.object_path, storagePath);
  const signed = await db.signUpload(storagePath);
  assert.equal(signed.token.length, 48);
  assert.match(signed.endpoint, /^https:\/\/example-project\.storage\.supabase\.co/);
  for (const sentRequest of sent) {
    assert.match(sentRequest.opts.headers.apikey, /^sb_secret_/);
    assert.equal(sentRequest.opts.headers.Authorization, undefined);
    assert.equal(sentRequest.opts.cache, "no-store");
    assert.equal(sentRequest.opts.redirect, "error");
  }
  delete process.env.CM_SUPABASE_URL;
  assert.throws(() => createQuoteGateway(mockFetch));
});
