"use client";
import React from "react";
import sm from "@/StateManager";
import type { StatePublic } from "@/StateManager";

const Words = () => {
  const [words, setWords] = React.useState<string[]>([]);
  const loaded = React.useRef(false);
  React.useEffect(() => {
    const getWords = function(stage: StatePublic["stage"])  {
      if (stage != "caseready") {
        if (stage == "caseloading") setWords([]);

        return;
      }

      if (!sm.state.wordsSelected.length) return;

      loaded.current = true;
      const words = [];
      for (const indx of sm.state.wordsSelected)
        words.push(sm.state.textChunks[indx]);

      setWords(words);
    };
    sm.attach("stage", getWords);
    return () => {
      sm.detach("stage", getWords);
    };
  }, []);
  return (
    <div className="">
      {words.map((word, i) => (
        <div key={i}>{word}</div>
      ))}
    </div>
  );
};

export default Words;
