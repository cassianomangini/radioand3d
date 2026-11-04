import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Identidade temporaria e anonima exclusiva do Orçamento.
 *
 * Este arquivo e apenas a primitiva criptografica. A Route Handler ainda deve:
 * - definir o cookie host-only, HttpOnly e Secure;
 * - conferir Origin/CSRF e limites de uso;
 * - verificar id do draft E ownerSessionHash no banco antes de qualquer write;
 * - rejeitar sessao expirada, revogada ou ligada a outro draft.
 */
export const QUOTE_SESSION_COOKIE_NAME = "__Host-cm-quote-session";
export const QUOTE_SESSION_TTL_SECONDS = 24 * 60 * 60;

export const QUOTE_SESSION_COOKIE_POLICY = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: QUOTE_SESSION_TTL_SECONDS
} as const;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const OWNER_HASH_PATTERN = /^[a-f0-9]{64}$/;
const TOKEN_BYTES = 32;
const HMAC_CONTEXT = "cm-quote-owner:v1\0";

function getValidHmacKey(secret: string): string {
  // A configuracao deve conter pelo menos 32 bytes gerados aleatoriamente.
  // Nao usar o segredo de rate limit ou qualquer chave publica.
  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("CM_QUOTE_SESSION_SECRET must be a private random secret of at least 32 bytes.");
  }
  return secret;
}

function parseTokenBytes(token: unknown): Buffer | null {
  if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) return null;

  const bytes = Buffer.from(token, "base64url");
  // Round-trip canonical evita formatos alternativos de uma mesma credencial.
  if (bytes.length !== TOKEN_BYTES || bytes.toString("base64url") !== token) {
    return null;
  }
  return bytes;
}

/** 256 bits de entropia. Nunca registrar o valor em logs ou banco. */
export function issueQuoteSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * Retorna o identificador de posse persistivel, nunca a credencial em claro.
 * O prefixo de dominio impede reutilizacao acidental do HMAC em outro fluxo.
 */
export function quoteSessionOwnerHash(
  token: unknown,
  secret: string
): string | null {
  const key = getValidHmacKey(secret);
  const bytes = parseTokenBytes(token);
  if (!bytes) return null;

  return createHmac("sha256", key)
    .update(HMAC_CONTEXT, "utf8")
    .update(bytes)
    .digest("hex");
}

/**
 * Checagem de posse em tempo constante para hashes de formato valido.
 * Esta comparacao NAO substitui verificar draft ID, lifecycle e TTL no banco.
 */
export function quoteSessionOwnsHash(
  token: unknown,
  expectedHash: unknown,
  secret: string
): boolean {
  const actual = quoteSessionOwnerHash(token, secret);
  if (
    !actual ||
    typeof expectedHash !== "string" ||
    !OWNER_HASH_PATTERN.test(expectedHash)
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(actual, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}
