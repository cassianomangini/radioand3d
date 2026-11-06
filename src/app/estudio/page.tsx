import type { Metadata } from "next";
import { connection } from "next/server";
import { getStudioPhotos, studioPhotoSrc } from "@/features/studio/r2-photos";
import { StudioCarousel, type StudioSlide } from "./studio-carousel";
import styles from "./page.module.css";

const title = "Estúdio de Impressão 3D | CM 3D & Rádio";
const description = "Conheça o estúdio CM 3D, em São Caetano do Sul, e veja peças e trabalhos reais de impressão 3D.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/estudio" },
  openGraph: { title, description, url: "/estudio", type: "website" },
};

function shufflePhotos<T>(items: readonly T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function categoryFromKey(key: string): StudioSlide["category"] {
  const folder = key.split("/")[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  switch (folder) {
    case "decoracao": return "decoracao";
    case "caixas": return "caixas";
    case "brinquedos": return "brinquedos";
    case "natal": return "natal";
    case "cores": return "cores";
    default: return "outros";
  }
}

export default async function StudioPage() {
  await connection();
  const photos = shufflePhotos(await getStudioPhotos());
  const slides: StudioSlide[] = photos.map((photo, index) => ({
    src: studioPhotoSrc(photo),
    alt: `Trabalho do estúdio CM 3D, foto ${index + 1}`,
    title: `Foto ${index + 1}`,
    category: categoryFromKey(photo.key),
  }));
  return (
    <div className={styles.page} data-studio-page>
      <div className={styles.layout}>
        <header className={styles.intro}>
          <h1>Estúdio</h1>
          <p>
            Conheça nosso estúdio e veja alguns dos trabalhos que já realizamos.
          </p>
        </header>
        <StudioCarousel slides={slides} />
      </div>
    </div>
  );
}
