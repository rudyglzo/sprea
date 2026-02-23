import Link from "next/link";
import { UploadPage } from "./upload-page";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Sprea home">
          Sprea
        </Link>
        <p className={styles.tagline}>Read faster than you can think</p>
      </header>
      <main id="main" className={styles.main}>
        <UploadPage />
      </main>
      <footer className={styles.footer}>
        <p>Upload PDF, DOCX, or images. Extract text. Speed-read with RSVP.</p>
      </footer>
    </div>
  );
}
