import { ReaderPage } from "./reader-page";
import styles from "./read.module.css";

export default function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <div className={styles.page}>
      <ReaderPage searchParams={searchParams} />
    </div>
  );
}
