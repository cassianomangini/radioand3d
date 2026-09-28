import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="foundation-title">
        <p className={styles.eyebrow}>CM 3D and Radio</p>
        <h1 id="foundation-title">Fundação técnica em construção.</h1>
        <p>
          Esta tela é apenas um estado de bootstrap. A identidade visual final será
          implementada somente depois da aprovação da direção CM.
        </p>
      </section>
    </main>
  );
}
