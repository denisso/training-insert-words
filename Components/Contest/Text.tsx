"use client";
import React from "react";
import classNames from "classnames";
import contest, { StateContest, stagesDict } from "@/utils/contest";
import styles from "./Text.module.css";

type PlaceWordProps = {
  /**
   * index words parsed words structure data
   */
  indx: number;
  /**
   *  word as string
   */
  word: string;
};

const Place = ({ indx }: PlaceWordProps) => {
  const [selected, setSelected] = React.useState(false);
  const [wordString, setWordString] = React.useState("");

  React.useEffect(() => {
    contest().placesStates.setStates(indx, setSelected, setWordString);
  }, [indx]);

  const handleClick = () => contest().placeClick(indx);

  return (
    <button
      className={classNames(
        styles.w,
        styles.outline,
        selected ? styles.selected : ""
      )}
      onClick={handleClick}
    >
      {wordString}
    </button>
  );
};

/**
 * Proxy component
 * @param WordPlaceProps
 * @returns
 */
const Word = ({ indx, word }: PlaceWordProps) => {
  const [isPlace, setIsPlace] = React.useState(false);
  React.useEffect(() => {
    const handlerStartContest = (stage: StateContest["stage"]) => {
      if (stagesDict[stage] >= stagesDict["contestStarted"]) {
        if (contest().matchSet.has(indx)) {
          setIsPlace(true);
        }
      }
      if (stagesDict[stage] == stagesDict["contestReady"]) {
        setIsPlace(false);
      }
    };
    contest().sm.attach("stage", handlerStartContest);
    return () => contest().sm.detach("stage", handlerStartContest);
  }, [indx]);

  return isPlace ? (
    <Place indx={indx} word={word} />
  ) : (
    <span>{word === " " ? "\u2004" : word}</span>
  );
};

const Paragraph = ({ indx }: { indx: number }) => {
  const [words, setWords] = React.useState<string[]>([]);

  React.useEffect(() => {
    setWords(
      contest().data.textChunks.slice(
        contest().data.paragraphs[indx],
        indx == contest().data.paragraphs.length - 1
          ? contest().data.textChunks.length
          : contest().data.paragraphs[indx + 1]
      )
    );
  }, [indx]);
  return (
    <p className={styles.p}>
      {words.map((w, i) => (
        <Word key={i} indx={contest().data.paragraphs[indx] + i} word={w} />
      ))}
    </p>
  );
};

const Text = ({ className }: { className?: string }) => {
  const [p, setP] = React.useState<number[]>([]);
  React.useEffect(() => {
    const loadText = (stage: StateContest["stage"]) => {
      if (stagesDict["contestReady"] > stagesDict[stage]) return;
      setP(contest().data.paragraphs.slice());
    };
    contest().sm.attach("stage", loadText);

    return () => contest().sm.detach("stage", loadText);
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
