"use client";
import React from "react";
import sm from "@/StateManager";
import styles from "./Text.module.css";
import { isLatinLetter } from "@/utils/parser";

const Paragraph = ({ indx }: { indx: number }) => {
  const [words, setWords] = React.useState<string[]>([]);

  React.useEffect(() => {
    setWords(
      sm.state.textChunks.slice(
        sm.state.paragraphs[indx],
        indx == sm.state.paragraphs.length - 1
          ? sm.state.textChunks.length
          : sm.state.paragraphs[indx + 1]
      )
    );
  }, [indx]);
  return (
    <p className={styles.p}>
      {words.map((w, i) =>
        w.length == 1 && !isLatinLetter(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <button key={i} className={styles.w}>
            {w}
          </button>
        )
      )}
    </p>
  );
};

const Text = () => {
  const [p, setP] = React.useState<number[]>([]);
  React.useEffect(() => {
    const getParsed = (parse: boolean) => {
      if (parse && sm.state.textChunks.length)
        setTimeout(() => setP(sm.state.paragraphs.slice()));
      else setP([]);
    };
    sm.attach("parsed", getParsed);
    return () => {
      sm.detach("parsed", getParsed);
    };
  }, []);
  return (
    <div>
      {p.map((_, i) => (
        <Paragraph indx={i} key={i} />
      ))}
    </div>
  );
};

export default Text;
