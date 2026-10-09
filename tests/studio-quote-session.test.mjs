import assert from "node:assert/strict";
import test from "node:test";
import {
  QUOTE_SESSION_COOKIE_NAME,
  QUOTE_SESSION_COOKIE_POLICY,
  QUOTE_SESSION_TTL_SECONDS,
  issueQuoteSessionToken,
  quoteSessionOwnerHash,
  quoteSessionOwnsHash
} from "../src/server/quote/session-token.ts";

const SECRET_A = "A".repeat(32);
const SECRET_B = "B".repeat(32);

test("server generates opaque, unique, canonical 256-bit session credentials", () => {
  const a = issueQuoteSessionToken();
  const b = issueQuoteSessionToken();

  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(Buffer.from(a, "base64url").length, 32);
});

test("only the owner's token resolves to its bound hash", () => {
  const owner = issueQuoteSessionToken();
  const other = issueQuoteSessionToken();
  const hash = quoteSessionOwnerHash(owner, SECRET_A);

  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(quoteSessionOwnsHash(owner, hash, SECRET_A), true);
  assert.equal(quoteSessionOwnsHash(other, hash, SECRET_A), false);
  assert.equal(quoteSessionOwnsHash(owner, hash, SECRET_B), false);
});

test("malformed tokens and attacker-supplied hashes are rejected", () => {
  const token = issueQuoteSessionToken();
  const ownerHash = quoteSessionOwnerHash(token, SECRET_A);

  for (const candidate of [null, undefined, "", "0".repeat(43), token + "=", "../../tmp"]) {
    assert.equal(quoteSessionOwnsHash(candidate, ownerHash, SECRET_A), false);
  }

  for (const hash of [null, "", "abc", "0".repeat(63), "G".repeat(64)]) {
    assert.equal(quoteSessionOwnsHash(token, hash, SECRET_A), false);
  }
});

test("configuration without a strong-enough secret fails closed", () => {
  const token = issueQuoteSessionToken();
  assert.throws(() => quoteSessionOwnerHash(token, ""), /CM_QUOTE_SESSION_SECRET/);
  assert.throws(() => quoteSessionOwnsHash(token, "", "short"), /CM_QUOTE_SESSION_SECRET/);
});

test("cookie contract is host-only, HttpOnly, Secure and expires with draft", () => {
  assert.equal(QUOTE_SESSION_COOKIE_NAME, "__Host-cm-quote-session");
  assert.equal(QUOTE_SESSION_COOKIE_POLICY.httpOnly, true);
  assert.equal(QUOTE_SESSION_COOKIE_POLICY.secure, true);
  assert.equal(QUOTE_SESSION_COOKIE_POLICY.sameSite, "strict");
  assert.equal(QUOTE_SESSION_COOKIE_POLICY.path, "/");
  assert.equal(QUOTE_SESSION_COOKIE_POLICY.maxAge, QUOTE_SESSION_TTL_SECONDS);
  assert.equal(QUOTE_SESSION_TTL_SECONDS, 24 * 60 * 60);
});
