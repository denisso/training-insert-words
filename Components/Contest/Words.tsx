"use client";
import React from "react";
import contest, { StateContest, stagesDict } from "@/utils/contest";
import styles from "./Words.module.css";
import classNames from "classnames";

const Word = ({ indx }: { indx: number }) => {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    contest().wordsStates.set(indx, setHidden);
  }, [indx]);

  return (
    <div className={classNames(styles.bw, hidden ? styles.hidden : "")}>
      <button
        className={styles.w}
        onClick={() => {
          contest().wordClick(indx);
          setHidden(true);
        }}
      >
        {contest().data.textChunks[indx]}
      </button>
      <div className={styles.space}>{"\u2004"}</div>
    </div>
  );
};

const Words = ({ className }: { className?: string }) => {
  const [words, setWords] = React.useState<number[]>([]);
  React.useEffect(() => {
    const getWords = function (stage: StateContest["stage"]) {
      if (stagesDict[stage] >= stagesDict["contestStarted"]){
        setWords(Array.from(contest().matchSet.keys()));
      }
        
      else setWords([]);
    };
    contest().sm.attach("stage", getWords);
    return () => contest().sm.detach("stage", getWords);
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
