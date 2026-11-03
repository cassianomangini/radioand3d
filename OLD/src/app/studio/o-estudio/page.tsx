import Image from "next/image";
import Link from "next/link";
import { StudioBreadcrumbs } from "@/components/studio/studio-content";
import { StudioConversionLinks } from "@/components/studio/studio-conversion-links";
import { studioMaterials } from "@/features/studio/materials";
import { buildPublicMetadata } from "@/lib/site-config";
import styles from "@/components/studio/studio-editorial.module.css";

export const metadata = buildPublicMetadata({
  title: "O Estúdio | CM 3D & Radio",
  description: "Conheça como o Estúdio CM transforma arquivos e necessidades reais em peças impressas em 3D, ou encontre produtos para comprar na Shopee.",
  pathname: "/studio/o-estudio"
});

export default function AboutStudioPage() {
  return (
    <article className={styles.page}>
      <StudioBreadcrumbs currentLabel="O Estúdio" pathname="/studio/o-estudio" />

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>CM 3D · O ESTÚDIO</p>
          <h1>Da ideia à peça que <span>faz sentido.</span></h1>
          <p className={styles.heroLead}>
            Um arquivo pronto, uma medida específica ou uma ideia ainda em aberto: começamos
            pela função da peça e encontramos um caminho para produzir.
          </p>
          <StudioConversionLinks />
        </div>
        <figure className={styles.heroVisual}>
          <Image
            src="/images/studio/fundo-pagina-estudio.png"
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            loading="eager"
            className={styles.heroImage}
          />
          <figcaption className={styles.mockCaption}>MOCK VISUAL <span>Arte de composição do Estúdio</span></figcaption>
        </figure>
      </header>

      <section className={styles.section} aria-labelledby="studio-paths-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>DOIS CAMINHOS</p>
          <h2 id="studio-paths-title">O próximo passo depende do que você precisa.</h2>
        </div>
        <div className={styles.pathGrid}>
          <div className={`${styles.pathPanel} ${styles.pathQuote}`}>
            <span className={styles.pathNumber}>01 / SOB MEDIDA</span>
            <h3>Tem um arquivo ou precisa criar uma peça?</h3>
            <p>Conte o uso, as medidas e o que já sabe. A análise do projeto orienta material, formato e produção.</p>
            <Link href="/studio/orcamento">Pedir orçamento <span aria-hidden="true">→</span></Link>
          </div>
          <div className={`${styles.pathPanel} ${styles.pathProducts}`}>
            <span className={styles.pathNumber}>02 / PRODUTO PRONTO</span>
            <h3>Prefere escolher algo que já criamos?</h3>
            <p>Veja as peças do catálogo, confira fotos e detalhes, e finalize a compra do produto na Shopee.</p>
            <Link href="/studio/produtos">Ver produtos <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="studio-process-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>COMO TRABALHAMOS</p>
          <h2 id="studio-process-title">Do pedido à peça.</h2>
          <p>O processo é guiado pela necessidade, não por uma lista pronta de combinações.</p>
        </div>
        <ol className={styles.processList}>
          <li><span>01</span><div><h3>Entender</h3><p>Você descreve a peça ou envia o arquivo para avaliação.</p></div></li>
          <li><span>02</span><div><h3>Definir</h3><p>Conferimos função, medidas, material e acabamento possíveis.</p></div></li>
          <li><span>03</span><div><h3>Produzir</h3><p>Com o projeto aprovado, imprimimos e conferimos o resultado.</p></div></li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="studio-materials-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>MATERIAIS</p>
          <h2 id="studio-materials-title">A função escolhe o filamento.</h2>
          <p>Trabalhamos com PLA, PETG e TPU. Cada um muda a rigidez, o comportamento e as possibilidades da peça.</p>
        </div>
        <div className={styles.materialSummary}>
          {studioMaterials.map((material) => (
            <div className={styles.materialSummaryRow} key={material.code}>
              <strong>{material.code}</strong>
              <span>{material.role}</span>
              <p>{material.summary}</p>
            </div>
          ))}
        </div>
        <p className={styles.materialNote}>Material, cor e acabamento são confirmados conforme o projeto e a disponibilidade.</p>
        <Link className={styles.textLink} href="/studio/materiais">Entender as diferenças entre os materiais <span aria-hidden="true">→</span></Link>
      </section>

      <footer className={styles.closing}>
        <div>
          <p className={styles.eyebrow}>COMECE POR AQUI</p>
          <h2>Uma peça personalizada ou um produto pronto.</h2>
        </div>
        <StudioConversionLinks />
      </footer>
    </article>
  );
}
