import React from "react";
import sm, { StatePublic, stagesDict } from "@/StateManager";

const State = () => {
  const [words, setWords] = React.useState(0);
  React.useEffect(() => {
    const getStage = (state: StatePublic["stage"]) => {
      if (stagesDict[state] < stagesDict["textparsed"]) {
        return setWords(0);
      }
      setWords(sm().state.words.length);
    };
    sm().attach("stage", getStage);
    return () => {
      sm().detach("stage", getStage);
    };
  }, []);
  return <>{words} words.</>;
};

export default State;
