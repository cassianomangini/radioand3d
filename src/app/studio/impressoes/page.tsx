import Image from "next/image";
import Link from "next/link";
import {
  MediaPlaceholder,
  PrimaryLink,
  StudioPageShell,
  StudioSection
} from "@/components/studio/studio-content";
import catalogStyles from "@/components/studio/studio-catalog.module.css";
import { studioPrints } from "@/features/studio/catalog";
import { buildPublicMetadata } from "@/lib/site-config";

const statusLabels = {
  produzido: "Produzido",
  conceito: "Conceito",
  produto: "Produto",
  cliente: "Projeto de cliente"
} as const;

export const metadata = buildPublicMetadata({
  title: "Impressões 3D | CM 3D & Radio",
  description:
    "Peças que já saíram das impressoras do Estúdio, apresentadas com contexto real de produção.",
  pathname: "/studio/impressoes"
});

export default function StudioPrintsPage() {
  const publishedPrints = studioPrints.filter((entry) => entry.canPublish);

  return (
    <StudioPageShell
      eyebrow="Impressões"
      title="O que já saiu das impressoras."
      lead="Esta área é portfólio e prova de capacidade. Só entram peças realmente produzidas, projetos autorizados ou conceitos claramente identificados como conceito."
      pathname="/studio/impressoes"
      breadcrumbLabel="Impressões"
    >
      <StudioSection title="Peças reais, sem catálogo inventado">
        {publishedPrints.length ? (
          <div className={catalogStyles.grid}>
            {publishedPrints.map((entry) => {
              const image = entry.images[0];
              return (
                <article className={catalogStyles.item} key={entry.slug}>
                  {image ? (
                    <div className={catalogStyles.media}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(max-width: 1180px) 100vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className={catalogStyles.meta}>
                    <span className={catalogStyles.status}>{statusLabels[entry.status]}</span>
                    <strong>{entry.title}</strong>
                    <p>{entry.summary}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <MediaPlaceholder
            kind="user-photo"
            note="Galeria principal de peças realmente impressas. Ideal: fotos próprias, enquadramento consistente e contexto de cada peça."
          />
        )}
        <p>
          Cada entrada poderá informar o que é a peça, por que foi produzida, material,
          medidas e acabamento quando essas informações forem úteis e publicáveis.
        </p>
      </StudioSection>

      <StudioSection eyebrow="Serviço" title="Já tem um arquivo 3D pronto?">
        <p>
          Se você já possui o modelo e quer saber se conseguimos fabricar, existe um
          caminho separado para análise do arquivo.
        </p>
        <PrimaryLink href="/studio/impressao-3d-sob-demanda">
          Enviar arquivo para análise
        </PrimaryLink>
      </StudioSection>

      <StudioSection eyebrow="Projetos personalizados" title="Placas, caixas e outras necessidades">
        <p>
          Placas e caixas têm páginas próprias porque pedem informações diferentes antes
          do orçamento. Outros projetos entram pelo fluxo geral.
        </p>
        <ul>
          <li><Link href="/studio/placas-personalizadas">Placas personalizadas</Link></li>
          <li><Link href="/studio/caixas-personalizadas">Caixas personalizadas</Link></li>
        </ul>
        <PrimaryLink href="/studio/orcamento">Pedir orçamento</PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
