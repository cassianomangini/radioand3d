import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estúdio — CM 3D & Rádio",
};

export default function StudioPage() {
  return (
    <div>
      <h1>CM 3D ESTÚDIO</h1>
      <p>
        Estamos em São Caetano do Sul, no ABC Paulista. Produzimos caixas,
        placas, organizadores, peças decorativas, brinquedos sensoriais e
        projetos personalizados.
      </p>
      <p>
        Trabalhamos com filamentos de qualidade, como PLA e PETG, escolhendo o
        material mais adequado para cada peça, considerando acabamento,
        resistência e finalidade de uso.
      </p>
      <p>
        Oferecemos <strong>retirada em São Caetano do Sul</strong> e{" "}
        <strong>envio para todo o Brasil pelos Correios</strong>. Nossos produtos
        também estão disponíveis na <strong>Shopee</strong>.
      </p>
    </div>
  );
}
