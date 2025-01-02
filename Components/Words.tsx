"use client";
import React from "react";
import sm from "@/StateManager";
import type { StatePublic } from "@/StateManager";
import styles from "./Words.module.css";
import contest from "@/utils/contest";

const Word = ({ indx }: { indx: number }) => {
  React.useEffect(() => {}, [indx]);
  return <div className={styles.w}>{sm.state.textChunks[indx]}</div>;
};

const Words = () => {
  const [words, setWords] = React.useState<number[]>([]);
  const loaded = React.useRef(false);
  React.useEffect(() => {
    const getWords = function (stage: StatePublic["stage"]) {
      if (stage != "caseready") {
        if (stage == "caseloading") setWords([]);
        return;
      }

      loaded.current = true;

      setWords(Array.from(contest.wordsSet.keys()));
    };
    sm.attach("stage", getWords);
    return () => {
      sm.detach("stage", getWords);
    };
  }, []);
  return (
    <div className="">
      {words.map((indx) => (
        <Word key={indx} indx={indx} />
      ))}
    </div>
  );
};

export default Words;
