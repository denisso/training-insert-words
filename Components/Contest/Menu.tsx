"use client";
import React from "react";
import Button from "../Button";
import contest, { StateContest, stagesDict } from "@/utils/contest";
import { getTextByID } from "@/db";
import Timer from "./Timer";
import State from "./State";

const ButtonCheck = () => {
  const [disabled, setDisabled] = React.useState(false);
  React.useEffect(() => {
    const checkReady = (enabled: boolean) => setDisabled(!enabled);

    contest().sm.attach("checkReady", checkReady);
    setDisabled(!contest().state.checkReady);
    return () => {
      contest().sm.detach("checkReady", checkReady);
    };
  }, []);

  const handlerClick = () => contest().check();
  return (
    <Button disabled={disabled} onClick={handlerClick}>
      Check
    </Button>
  );
};

const ButtonReesetCase = () => {
  const [disabled, setDisabled] = React.useState(true);
  React.useEffect(() => {
    const getStage = (stage: StateContest["stage"]) => {
      if (stagesDict[stage] < stagesDict["textParsed"])
        return setDisabled(true);
      setDisabled(false);
    };
    contest().sm.attach("stage", getStage);
    setDisabled(!contest().sm.state.checkReady);
    return () => {
      contest().sm.detach("stage", getStage);
    };
  }, []);

  const handleClick = () => contest().prepare();

  return (
    <Button disabled={disabled} onClick={handleClick}>
      Reeset
    </Button>
  );
};
const ButtonStartContest = () => {
  const [disabled, setDisabled] = React.useState(true);
  React.useEffect(() => {
    const getStage = (stage: StateContest["stage"]) => {
      if (stagesDict[stage] >= stagesDict["contestReady"])
        return setDisabled(false);
      setDisabled(true);
    };
    contest().sm.attach("stage", getStage);
    setDisabled(!contest().sm.state.checkReady);
    return () => {
      contest().sm.detach("stage", getStage);
    };
  }, []);

  const handleClick = () => {
    contest().start();
  };

  return (
    <Button disabled={disabled} onClick={handleClick}>
      Start test
    </Button>
  );
};

type Props = {
  textId: string;
};

export default function Menu({ textId }: Props) {
  React.useEffect(() => {
    getTextByID(textId)
      .then(({ text }) => {
        contest().loadText(text);
      })
      .catch((error) => {
        alert(error);
      });
    return () => {
      contest().clear();
    };
  }, [textId]);
  return (
    <div>
      <ButtonCheck />
      <ButtonReesetCase />
      <ButtonStartContest />
      <Timer />
      <State />
    </div>
  );
}
