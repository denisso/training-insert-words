import Menu from "@/Components/Contest/Menu";
import Text from "@/Components/Contest/Text";
import Words from "@/Components/Contest/Words";
import Link from "next/link";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};
export default async function Page({ params }: Props) {
  const id = (await params).id;

  return (
    <div className={styles.container}>
      Contest {id} <Link href="/">Go back to /</Link>
      <Menu textId={id}/>
      
      <div className={styles.box}>
        
        <Text className={styles.text} />
        <Words className={styles.words} />
      </div>
    </div>
  );
}
