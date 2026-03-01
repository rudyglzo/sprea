import Link from "next/link";
import { AnimatedText } from "./components/animated-text";
import { UploadPage } from "./upload-page";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Sprea home">
          sprea
        </Link>
        <AnimatedText
          words={["read", "faster", "than", "you", "can", "think"]}
          as="p"
          className={styles.tagline}
          cycle
          rgb
        />
      </header>
      <main id="main" className={styles.main}>
        <UploadPage />
      </main>
    </div>
  );
}
