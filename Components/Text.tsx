"use client";
import React from "react";
import sm from "@/StateManager";
import styles from "./Text.module.css";

const Paragraph = ({ indx }: { indx: number }) => {
  const [words, setWords] = React.useState<string[]>([]);
  React.useEffect(() => {
    setWords(
      sm.state.words.slice(
        sm.state.paragraphs[indx],
        indx == sm.state.paragraphs.length - 1
          ? sm.state.words.length
          : sm.state.paragraphs[indx + 1]
      )
    );
  }, [indx]);
  return (
    <p className={styles.p}>
      {words.map((word, i) => (
        <button key={i} className={styles.w}>
          {word}
        </button>
      ))}
    </p>
  );
};

const Text = () => {
  const [p, setP] = React.useState<number[]>([]);
  React.useEffect(() => {
    const getParsed = (parse: boolean) => {
      console.log(sm.state.paragraphs, sm.state.words)
      if (parse) setP(sm.state.paragraphs.slice());
      else setP([]);
    };
    sm.attach("parsed", getParsed);
    return () => {
      sm.detach("parsed", getParsed);
    };
  }, []);
  return (
    <div>
      {p.map((indx) => (
        <Paragraph indx={indx} key={indx} />
      ))}
    </div>
  );
};

export default Text;
