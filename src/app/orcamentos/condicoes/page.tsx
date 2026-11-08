import type { Metadata } from "next";
import Link from "next/link";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Condições da impressão 3D | CMangini 3D",
  description: "Condições para solicitar uma impressão 3D sob demanda no estúdio CMangini 3D.",
  alternates: { canonical: "/orcamentos/condicoes" },
};

export default function CondicoesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1>Condições do serviço</h1>
          <p>Impressão 3D sob demanda</p>
        </div>
      </header>
      <article className={styles.conditions}>
        <p>Estas condições se aplicam aos pedidos de impressão de modelos 3D enviados por link ou arquivo.</p>

        <section>
          <h2>Análise do pedido</h2>
          <p>O envio da solicitação inicia uma análise técnica e comercial. Viabilidade, material, quantidade, valor, prazo e entrega serão informados no orçamento. O envio do formulário não confirma a produção nem reserva uma data.</p>
        </section>

        <section>
          <h2>Modelos e autorização</h2>
          <p>Ao solicitar a impressão, você confirma que tem autorização para usar os modelos e as referências enviados. Informe no pedido qualquer exigência de uso, encaixe, resistência ou acabamento.</p>
        </section>

        <section>
          <h2>Características da impressão FDM</h2>
          <p>Peças produzidas por deposição de filamento podem apresentar marcas de camada, pequenas variações de cor, medidas e acabamento. Requisitos específicos serão avaliados antes da proposta.</p>
        </section>

        <section>
          <h2>Orçamento, pagamento e cancelamento</h2>
          <p>A forma de pagamento e as condições de produção serão informadas no orçamento. A produção depende da sua aprovação da proposta e da confirmação do pagamento combinado. Se precisar cancelar, entre em contato quanto antes para avaliarmos a etapa do pedido e as condições aplicáveis.</p>
        </section>

        <section>
          <h2>Recusa do pedido</h2>
          <p>O Estúdio pode recusar uma solicitação quando ela for tecnicamente inviável ou quando não houver autorização para usar o modelo, informando o motivo.</p>
        </section>

        <Link href="/orcamentos">Voltar para orçamentos</Link>
      </article>
    </div>
  );
}
