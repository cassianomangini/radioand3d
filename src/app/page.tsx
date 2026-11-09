import type { Metadata } from "next";
import { HomeFrame } from "../components/home-frame";
import { SITE_URL } from "@/lib/site-seo";

const title = "CMangini3D | Impressão 3D em São Caetano do Sul";
const description = "Na CMangini3D, fazemos caixas sob medida, placas personalizadas e impressão 3D por encomenda em São Caetano do Sul. Enviamos para todo o Brasil.";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CMangini3D",
  url: `${SITE_URL}/`,
};

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
    siteName: "CMangini3D",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
      <HomeFrame />
    </>
  );
}
