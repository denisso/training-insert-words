import Menu from "@/Components/Menu";
import Text from "@/Components/Text";
import Words from "@/Components/Words";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.box}>
        <Text className={styles.text} />
        <Words className={styles.words} />
      </div>
    </div>
  );
}