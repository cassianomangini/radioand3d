export const QUOTE_FILE_POLICY = {
  maxFiles: 5,
  maxBytesPerFile: 50 * 1024 * 1024,
  maxTotalBytes: 100 * 1024 * 1024,
  allowedExtensions: [
    ".stl",
    ".3mf",
    ".obj",
    ".step",
    ".stp",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
  ]
} as const;

export const QUOTE_FILE_ACCEPT = QUOTE_FILE_POLICY.allowedExtensions.join(",");

export type QuoteFileLike = {
  name: string;
  size: number;
  type?: string;
};

export type QuoteFileValidationCode =
  | "too-many-files"
  | "empty-file"
  | "unsupported-extension"
  | "file-too-large"
  | "total-too-large";

export type QuoteFileValidationResult =
  | { ok: true }
  | {
      ok: false;
      code: QuoteFileValidationCode;
      message: string;
      fileName?: string;
    };

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function formatQuoteFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "tamanho desconhecido";
  if (bytes < 1024) return `${bytes} B`;

  const kib = bytes / 1024;
  if (kib < 1024) return `${kib.toFixed(kib >= 10 ? 0 : 1)} KB`;

  const mib = kib / 1024;
  return `${mib.toFixed(mib >= 10 ? 0 : 1)} MB`;
}

export function validateQuoteFiles(
  files: readonly QuoteFileLike[]
): QuoteFileValidationResult {
  if (files.length > QUOTE_FILE_POLICY.maxFiles) {
    return {
      ok: false,
      code: "too-many-files",
      message: `Envie no máximo ${QUOTE_FILE_POLICY.maxFiles} arquivos por solicitação.`
    };
  }

  let totalBytes = 0;

  for (const file of files) {
    if (!Number.isFinite(file.size) || file.size <= 0) {
      return {
        ok: false,
        code: "empty-file",
        fileName: file.name,
        message: `O arquivo “${file.name}” está vazio ou não pôde ter o tamanho verificado.`
      };
    }

    const extension = fileExtension(file.name);
    if (
      !QUOTE_FILE_POLICY.allowedExtensions.includes(
        extension as (typeof QUOTE_FILE_POLICY.allowedExtensions)[number]
      )
    ) {
      return {
        ok: false,
        code: "unsupported-extension",
        fileName: file.name,
        message:
          `O formato de “${file.name}” não é aceito. Use STL, 3MF, OBJ, STEP/STP, PDF, PNG, JPG ou WebP.`
      };
    }

    if (file.size > QUOTE_FILE_POLICY.maxBytesPerFile) {
      return {
        ok: false,
        code: "file-too-large",
        fileName: file.name,
        message: `O arquivo “${file.name}” ultrapassa o limite de 50 MB.`
      };
    }

    totalBytes += file.size;
  }

  if (totalBytes > QUOTE_FILE_POLICY.maxTotalBytes) {
    return {
      ok: false,
      code: "total-too-large",
      message: "O conjunto de arquivos ultrapassa o limite total de 100 MB."
    };
  }

  return { ok: true };
}

/**
 * Client-side checks are an early UX filter only.
 *
 * A future persistence adapter must run the same policy on the server and add
 * content-level validation before writing to private storage. File names and
 * browser-provided MIME types are never trusted as authorization or proof of format.
 */
export function quoteFilePolicyLabel() {
  return "STL, 3MF, OBJ, STEP/STP, PDF e imagens PNG/JPG/WebP · até 50 MB por arquivo · até 5 arquivos";
}
