import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve(process.argv[2] ?? "test-results/visual-lab");
const studies = [
  { id: "editorial", name: "01 — Editorial" },
  { id: "mostruario", name: "02 — Mostruário" },
  { id: "detalhe", name: "03 — Detalhe" }
];
const viewports = [
  { id: "desktop-1440", name: "Desktop · 1440 × 900" },
  { id: "desktop-1024", name: "Notebook · 1024 × 768" },
  { id: "mobile-390", name: "Mobile · 390 × 844" },
  { id: "mobile-360", name: "Mobile estreito · 360 × 800" }
];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await filesBelow(absolute));
    } else if (entry.isFile()) {
      files.push(absolute);
    }
  }
  return files;
}

const files = await filesBelow(outputDirectory);
const sections = viewports.map((viewport) => {
  const figures = studies.map((study) => {
    const file = files.find((candidate) =>
      candidate.includes(viewport.id) &&
      path.basename(candidate) === "lab-" + study.id + ".png"
    );
    if (!file) {
      throw new Error("Missing visual lab capture: " + viewport.id + " / " + study.id);
    }
    const relative = path.relative(outputDirectory, file).split(path.sep).join("/");
    return '<figure><figcaption><b>' + study.name + '</b><span>' +
      viewport.name + '</span></figcaption><img src="' + relative +
      '" alt="Estudo ' + study.name + ' em ' + viewport.name + '"></figure>';
  }).join("\n");
  return '<section><h2>' + viewport.name + '</h2><div class="grid">' + figures + '</div></section>';
}).join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CM — Comparativo Visual Lab 08V</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #080d11; color: #eaf0ee; font: 15px/1.5 system-ui,sans-serif; }
  main { width: min(100%,1500px); margin: auto; padding: clamp(18px,3vw,48px); }
  .kicker { color: #86c7d5; font: 700 12px/1.5 monospace; letter-spacing: .1em; }
  h1 { font-size: clamp(28px,4.5vw,64px); letter-spacing: -.055em; margin: 8px 0 12px; }
  .intro { color: #a9b8be; max-width: 65ch; margin: 0 0 35px; }
  h2 { color: #dae4e5; margin: 24px 0 16px; font-size: 21px; }
  section { border-top: 1px solid #34434a; padding-top: 10px; margin-top: 30px; }
  .grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); align-items: start; gap: 16px; }
  figure { margin: 0; min-width: 0; background: #101719; border: 1px solid #2b3d43; }
  figcaption { padding: 13px 15px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  figcaption span { color: #9dacb3; font-size: 12px; }
  img { display: block; width: 100%; height: auto; }
  footer { color: #87989e; margin-top: 28px; font-size: 13px; }
  @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body><main>
<p class="kicker">CM 3D & RADIO / 08V / NÃO PUBLICAR</p>
<h1>Comparativo de composição.</h1>
<p class="intro">Três estudos do mesmo conteúdo de Impressões. Capturas de navegador, não mocks aprovados.
A fotografia real ainda não foi selecionada. Avalie hierarquia, ritmo, proporção e espaço de mídia.</p>
${sections}
<footer>Registro exploratório, sem aprovação de Cassiano. Nenhuma destas imagens pode se tornar baseline automaticamente.</footer>
</main></body></html>`;

await writeFile(path.join(outputDirectory, "comparativo.html"), html, "utf8");
process.stdout.write("Visual comparison generated: " + path.join(outputDirectory, "comparativo.html") + "\n");
