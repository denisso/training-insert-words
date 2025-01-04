"use client";
import React from "react";
import sm, { stagesDict } from "@/StateManager";
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

  React.useEffect(() => {
    contest.placesCb.set(indx, (action: "select" | "word", payload: number) => {
      if (action == "word") {
        if (payload == -1) {
          setWord("");
        } else {
          setWord(sm.state.textChunks[payload]);
        }
      }
      if (action == "select") {
        if (payload == -1) setSelected(false);
        else setSelected(true);
      }
    });
    if (contest.placeSelected == indx) setSelected(true);
  }, [indx]);

  const handleClick = () => {
    contest.clickByPlace(indx, setSelected, setWord);
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
  const [isPlace, setIsPlace] = React.useState(false);
  const isPlaceRef = React.useRef(false);

  React.useEffect(() => {
    if (!contest.placesSet.has(indx)) return;
    const getStage = (stage: StatePublic["stage"]) => {
      if (stagesDict[stage] < stagesDict["contest"]) {
        if (isPlaceRef.current) setIsPlace(false);
        isPlaceRef.current = false;
      } else {
        setIsPlace(true);
        isPlaceRef.current = true;
      }
    };
    sm.attach("stage", getStage);
    return () => {
      sm.detach("stage", getStage);
    };
  }, [indx]);
  return isPlace ? (
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

const Text = ({ className }: { className?: string }) => {
  const [p, setP] = React.useState<number[]>([]);
  React.useEffect(() => {
    const getParagraphs = (stage: StatePublic["stage"]) => {
      if (
        stagesDict[stage] >= stagesDict["caseready"] &&
        sm.state.textChunks.length
      )
        setP(sm.state.paragraphs.slice());
      else setP([]);
    };
    sm.attach("stage", getParagraphs);
    return () => {
      sm.detach("stage", getParagraphs);
    };
  }, []);
  return (
    <div className={classNames(className, styles.box)}>
      {p.map((_, i) => (
        <Paragraph indx={i} key={i} />
      ))}
    </div>
  );
};

export default Text;
