import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeFrame } from "@/components/home-frame";
import { getPublishedRadioPublication } from "@/features/radio/publications";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const publication = getPublishedRadioPublication(slug);
  if (!publication) return { title: "Música não encontrada", robots: { index: false, follow: false } };
  const title = `${publication.title} — CM Rádio`;
  const description = `Ouça ${publication.title}, de ${publication.artist}, na CM Rádio.`;
  return {
    title,
    description,
    // As URLs de compartilhamento exibem a Home, sem conteúdo editorial exclusivo da faixa.
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function SharedMusicPage({ params }: Props) {
  const { slug } = await params;
  if (!getPublishedRadioPublication(slug)) notFound();
  return <HomeFrame />;
}
