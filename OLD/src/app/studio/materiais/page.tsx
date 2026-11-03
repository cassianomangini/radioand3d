import { StudioBreadcrumbs } from "@/components/studio/studio-content";
import { StudioConversionLinks } from "@/components/studio/studio-conversion-links";
import { studioMaterials } from "@/features/studio/materials";
import { buildPublicMetadata } from "@/lib/site-config";
import styles from "@/components/studio/studio-editorial.module.css";

export const metadata = buildPublicMetadata({
  title: "Materiais de impressão 3D | CM 3D & Radio",
  description: "Entenda as diferenças entre PLA, PETG e TPU e escolha o material junto com a análise do seu projeto.",
  pathname: "/studio/materiais"
});

export default function StudioMaterialsPage() {
  return (
    <article className={styles.page}>
      <StudioBreadcrumbs currentLabel="Materiais" pathname="/studio/materiais" />

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>MATERIAIS · O ESTÚDIO</p>
          <h1>O material muda <span>a peça.</span></h1>
          <p className={styles.heroLead}>
            Rigidez, flexibilidade, acabamento e uso fazem parte da mesma decisão.
            Conheça os três filamentos com que trabalhamos e conte o que sua peça precisa fazer.
          </p>
          <StudioConversionLinks />
        </div>
        <figure className={styles.materialVisual}>
          <div className={styles.materialGraphic} aria-hidden="true">
            <span>PLA</span><span>PETG</span><span>TPU</span>
          </div>
          <figcaption className={styles.mockCaption}>MOCK VISUAL <span>Esquema de materiais; não representa cor ou acabamento disponível</span></figcaption>
        </figure>
      </header>

      <section className={styles.section} aria-labelledby="materials-differences-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>O QUE MUDA</p>
          <h2 id="materials-differences-title">Três materiais, comportamentos diferentes.</h2>
          <p>Não existe um filamento certo para tudo. O uso da peça orienta a escolha.</p>
        </div>
        <div className={styles.materialDetails}>
          {studioMaterials.map((material, index) => (
            <article className={styles.materialDetail} key={material.code}>
              <div className={styles.materialDetailLabel}>
                <span>0{index + 1} / {material.role}</span>
                <h3>{material.code}</h3>
              </div>
              <div className={styles.materialDetailCopy}>
                <strong>{material.summary}</strong>
                <p>{material.detail}</p>
                <p className={styles.consideration}>{material.consideration}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.decisionBand} aria-labelledby="materials-decision-title">
        <p className={styles.eyebrow}>ESCOLHA REAL</p>
        <h2 id="materials-decision-title">A decisão final acontece com o projeto em mãos.</h2>
        <p>
          Medidas, forma, local de uso, cor e acabamento entram na análise. A disponibilidade
          de cada combinação é confirmada antes da produção.
        </p>
      </section>

      <footer className={styles.closing}>
        <div>
          <p className={styles.eyebrow}>PRÓXIMO PASSO</p>
          <h2>Peça sob medida ou produto pronto?</h2>
        </div>
        <StudioConversionLinks />
      </footer>
    </article>
  );
}
