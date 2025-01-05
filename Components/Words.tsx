"use client";
import React from "react";
import sm from "@/StateManager";
import type { StatePublic } from "@/StateManager";
import styles from "./Words.module.css";
import contest from "@/utils/contest";
import classNames from "classnames";

const Word = ({ indx }: { indx: number }) => {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    contest.wordsCb.set(indx, setHidden);
  }, [indx]);

  return (
    <div className={classNames(styles.bw, hidden ? styles.hidden : "")}>
      <button
        className={styles.w}
        onClick={() => {
          contest.clickByWord(indx);
          setHidden(true);
        }}
      >
        {sm.state.textChunks[indx]}
      </button>
      <div className={styles.space}>{"\u2004"}</div>
    </div>
  );
};

const Words = ({ className }: { className?: string }) => {
  const [words, setWords] = React.useState<number[]>([]);
  const loaded = React.useRef(false);
  React.useEffect(() => {
    const getWords = function (stage: StatePublic["stage"]) {
      if (stage != "contest") {
        if (loaded.current) setWords([]);
        loaded.current = false;
        return;
      }
      loaded.current = true;
      setWords(Array.from(contest.placesSet.keys()));
    };
    sm.attach("stage", getWords);
    return () => {
      sm.detach("stage", getWords);
    };
  }, []);
  return (
    <div className={className}>
      <div className={styles.box}>
        {words.map((indx) => (
          <Word key={indx} indx={indx} />
        ))}
      </div>
    </div>
  );
};

export default Words;
