"use client";
import React from "react";
import sm from "@/StateManager";
import styles from "./Text.module.css";
import { isLatinLetter } from "@/utils/parser";
import classNames from "classnames";
import type { StatePublic } from "@/StateManager";
import contest from "@/utils/contest";

type WordPlaceProps = {
  indx: number;
  word: string;
};

const Place = ({ indx }: WordPlaceProps) => {
  const [selected, setSelected] = React.useState(false);
  const [word, setWord] = React.useState("");
  const wordRef = React.useRef<number>(-1);
  React.useEffect(() => {
    contest.places.set(indx, (action: "select" | "word", payload: number) => {
      if (action == "word") {
        if (payload == -1) {
          setWord("");
        } else {
          setWord(sm.state.textChunks[payload]);
        }
        wordRef.current = payload;
      }
      if (action == "select") {
        if (payload == -1) setSelected(false);
        else setSelected(true);
      }
    });
    if (contest.placeSelected == indx) setSelected(true);
  }, [indx]);

  const handleClick = () => {
    if (wordRef.current == -1) {
      setSelected(true);
      const cb = contest.places.get(contest.placeSelected);
      if (typeof cb == "function") cb("select", -1);

      contest.placeSelected = indx;
    }
    
  };
  return (
    <button
      className={classNames(
        styles.w,
        styles.outline,
        selected ? styles.selected : ""
      )}
      onClick={handleClick}
    >
      {word}
    </button>
  );
};

const Word = ({ word, indx }: WordPlaceProps) => {
  return contest.wordsSet.has(indx) ? (
    <Place word={word} indx={indx} />
  ) : isLatinLetter(word[0]) ? (
    <button className={styles.w}>{word}</button>
  ) : (
    <span>{word}</span>
  );
};

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
      {words.map((w, i) => (
        <Word key={i} indx={sm.state.paragraphs[indx] + i} word={w} />
      ))}
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
    <div className={styles.box}>
      {p.map((_, i) => (
        <Paragraph indx={i} key={i} />
      ))}
    </div>
  );
};

export default Text;
