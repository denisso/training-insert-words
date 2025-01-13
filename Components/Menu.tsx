"use client";
import React from "react";
import sm, { StatePublic, stagesDict } from "@/StateManager";
import settings from "@/settings";
import Button from "./Button";
import contest from "@/utils/contest";
import Timer from "./Timer";
import State from "./State";

const ButtonLoadFile = () => {
  const refInput = React.useRef<HTMLInputElement>(null);
  const onClick = () => {
    if (refInput.current?.value) refInput.current.value = "";
    refInput.current?.click();
  };
  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      if (file.size > settings.fileSize) {
        sm().state.text = `file size is more than ${settings.fileSize} bytes`;
        return;
      } else if (sm().state.text) {
        sm().state.text = "";
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const state = sm().state;
        state.text = String(e.target?.result);
        state.stage = "fileloaded";
      };
      reader.readAsText(file);
    }
  };
  return (
    <>
      <Button onClick={onClick}>Load from File</Button>
      <input
        ref={refInput}
        type="file"
        accept=".txt"
        onChange={loadFromFile}
        style={{ display: "none" }}
      />
    </>
  );
};

const ButtonCheck = () => {
  const [disabled, setDisabled] = React.useState(false);
  React.useEffect(() => {
    const checkReady = (enabled: boolean) => setDisabled(!enabled);

    sm().attach("checkReady", checkReady);
    setDisabled(!sm().state.checkReady);
    return () => {
      sm().detach("checkReady", checkReady);
    };
  }, []);

  const handlerClick = () => contest().check();
  return (
    <Button disabled={disabled} onClick={handlerClick}>
      Check
    </Button>
  );
};
const ButtonBuildCase = () => {
  const [disabled, setDisabled] = React.useState(true);
  React.useEffect(() => {
    const getStage = (stage: StatePublic["stage"]) => {
      if (stagesDict[stage] < stagesDict["contest"]) return setDisabled(true);
      setDisabled(false);
    };
    sm().attach("stage", getStage);
    setDisabled(!sm().state.checkReady);
    return () => {
      sm().detach("stage", getStage);
    };
  }, []);

  const handleClick = () => contest().build();

  return (
    <Button disabled={disabled} onClick={handleClick}>
      Rebuild test
    </Button>
  );
};
const ButtonStartContest = () => {
  const [disabled, setDisabled] = React.useState(true);
  React.useEffect(() => {
    const getStage = (stage: StatePublic["stage"]) => {
      if (stagesDict[stage] == stagesDict["caseready"])
        return setDisabled(false);
      setDisabled(true);
    };
    sm().attach("stage", getStage);
    setDisabled(!sm().state.checkReady);
    return () => {
      sm().detach("stage", getStage);
    };
  }, []);

  const handleClick = () => {
    if (sm().state.stage != "caseready") return;
    sm().state.stage = "contest";
  };
  return (
    <Button disabled={disabled} onClick={handleClick}>
      Start test
    </Button>
  );
};
export default function Menu() {

  return (
    <div>
      <ButtonLoadFile />
      <ButtonCheck />
      <ButtonBuildCase />
      <ButtonStartContest />
      <Timer />
      <State />
    </div>
  );
}
