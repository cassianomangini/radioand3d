/**
 * Imports Cassiano's approved local portfolio media into public web assets.
 *
 * Source (gitignored): output/Fotos Impressoes
 * Run: pnpm studio:media
 * Optional source: node scripts/sync-studio-prints.mjs "/path/to/photos"
 *
 * Each immediate subfolder becomes a project. Loose files are individual entries.
 * The importer does not invent dimensions, materials, descriptions, or product names.
 */
import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(repository, process.argv[2] ?? "output/Fotos Impressoes");
const destination = path.join(repository, "public", "images", "studio", "impressoes");
const manifestPath = path.join(repository, "src", "features", "studio", "prints-media.json");
const imageTypes = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const videoTypes = new Set([".mp4", ".webm"]);
const allowedTypes = new Set([...imageTypes, ...videoTypes]);
const MAX_MEDIA_FILES = 80;
const MAX_FILE_BYTES = 120 * 1024 * 1024;
const MAX_TOTAL_BYTES = 650 * 1024 * 1024;

function readableName(input) {
  return input
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "peca";
}

async function collectFiles(directory, parentName = null) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }));

  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory() && parentName === null) {
      result.push(...await collectFiles(fullPath, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (allowedTypes.has(extension)) {
      result.push({ fullPath, fileName: entry.name, extension, parentName });
    }
  }
  return result;
}

let candidates;
try {
  candidates = await collectFiles(source);
} catch (error) {
  if (error?.code === "ENOENT") {
    console.error(`Pasta de origem não encontrada: ${source}`);
    console.error("Copie suas fotos para output/Fotos Impressoes e execute pnpm studio:media.");
    process.exitCode = 1;
  } else {
    throw error;
  }
}

if (candidates) {
  if (candidates.length === 0) {
    console.error(`Nenhuma foto ou vídeo compatível foi encontrado em ${source}`);
    process.exitCode = 1;
  } else if (candidates.length > MAX_MEDIA_FILES) {
    console.error(`Limite de ${MAX_MEDIA_FILES} arquivos por importação excedido: ${candidates.length}.`);
    process.exitCode = 1;
  } else {
    const entries = [];
    const usedNames = new Map();
    let totalBytes = 0;
    for (const candidate of candidates) {
      const size = (await stat(candidate.fullPath)).size;
      totalBytes += size;
      if (size > MAX_FILE_BYTES || totalBytes > MAX_TOTAL_BYTES) {
        throw new Error("Mídia acima do limite de segurança. Reduza o tamanho antes da importação.");
      }
      const project = slug(candidate.parentName ?? readableName(candidate.fileName));
      const title = readableName(candidate.parentName ?? candidate.fileName) || "Impressão";
      const basename = slug(readableName(candidate.fileName));
      const candidateKey = `${project}/${basename}`;
      const sequence = (usedNames.get(candidateKey) ?? 0) + 1;
      usedNames.set(candidateKey, sequence);
      const file = `${basename}${sequence > 1 ? `-${sequence}` : ""}${candidate.extension}`;
      const relative = path.posix.join(project, file);
      const kind = videoTypes.has(candidate.extension) ? "video" : "image";
      entries.push({
        ...candidate,
        project,
        id: `${project}-${basename}${sequence > 1 ? `-${sequence}` : ""}`,
        kind,
        src: `/images/studio/impressoes/${relative}`,
        title,
        alt: `${kind === "video" ? "Vídeo" : "Foto"} de ${title}`,
        relative
      });
    }

    const tempDestination = `${destination}.tmp-${process.pid}`;
    await rm(tempDestination, { force: true, recursive: true });
    try {
      for (const entry of entries) {
        const target = path.join(tempDestination, entry.relative);
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(entry.fullPath, target);
      }
      await rm(destination, { force: true, recursive: true });
      await mkdir(path.dirname(destination), { recursive: true });
      await rename(tempDestination, destination);
    } finally {
      await rm(tempDestination, { force: true, recursive: true });
    }

    const items = entries.map(({ id, project, kind, src, title, alt }) => ({
      id, project, kind, src, title, alt
    }));
    await writeFile(manifestPath, JSON.stringify({ items }, null, 2) + "\n");
    console.log(`Importados ${items.length} arquivos de ${source}.`);
    console.log("Confira a apresentação antes de publicar: títulos e enquadramentos vêm dos nomes dos arquivos.");
  }
}
