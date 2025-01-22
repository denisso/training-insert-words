import React from "react";
import contest, { StateContest, stagesDict } from "@/utils/contest";

const State = () => {
  const [words, setWords] = React.useState(0);
  React.useEffect(() => {
    const getStage = (stage: StateContest["stage"]) => {
      if (stagesDict[stage] < stagesDict["textParsed"]) {
        return setWords(0);
      }
      setWords(contest().data.words.length);
    };
    contest().sm.attach("stage", getStage);
    return () => {
      contest().sm.detach("stage", getStage);
    };
  }, []);
  return <>{words} words.</>;
};

export default State;
