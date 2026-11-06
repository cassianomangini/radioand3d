import type { Metadata } from "next";
import { HomeFrame } from "../components/home-frame";

const title = "CM 3D & Rádio | Impressão 3D em São Caetano do Sul";
const description = "Caixas sob medida, placas personalizadas e impressão 3D por encomenda em São Caetano do Sul. Retirada local e envio para todo o Brasil.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    type: "website",
    locale: "pt_BR",
    siteName: "CM 3D & Rádio",
  },
};

export default function Home() {
  return <HomeFrame />;
}
