"use client";
import React from "react";
import sm from "@/StateManager";
import styles from "./Text.module.css";
import { isLatinLetter } from "@/utils/parser";
import classNames from "classnames";
import type { StatePublic } from "@/StateManager";
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
          <span
            key={i}
            className={
              sm.state.wordsSet.has(sm.state.paragraphs[indx] + i)
                ? styles.outline
                : ""
            }
          >
            {w}
          </span>
        ) : (
          <button
            key={i}
            className={classNames(
              styles.w,
              sm.state.wordsSet.has(sm.state.paragraphs[indx] + i)
                ? styles.outline
                : ""
            )}
          >
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
    const getParagraphs = (stage: StatePublic["stage"]) => {
      if (stage == "caseready" && sm.state.textChunks.length)
        setTimeout(() => setP(sm.state.paragraphs.slice()));
      else setP([]);
    };
    sm.attach("stage", getParagraphs);
    return () => {
      sm.detach("stage", getParagraphs);
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
