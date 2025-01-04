"use client";
import React from "react";
import sm, { StatePublic, stagesDict } from "@/StateManager";
import settings from "@/settings";
import Button from "./Button";
import "@/utils/parser";
import contest from "@/utils/contest";

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
        sm.state.text = `file size is more than ${settings.fileSize} bytes`;
        return;
      } else if (sm.state.text) {
        sm.state.text = "";
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        sm.state.text = String(e.target?.result) ?? "";
        sm.state.stage = "fileloaded";
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

// const ButtonSaveFile = () => {
//   const saveToFile = () => {
//     const blob = new Blob([sm.state.text], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "textfile.txt";
//     link.click();
//     URL.revokeObjectURL(link.href);
//   };
//   return <Button onClick={saveToFile}>Save to File</Button>;
// };

const ButtonCheck = () => {
  const [disabled, setDisabled] = React.useState(false);
  React.useEffect(() => {
    const checkReady = (enabled: boolean) => setDisabled(!enabled);

    sm.attach("checkReady", checkReady);
    setDisabled(!sm.state.checkReady);
    return () => {
      sm.detach("checkReady", checkReady);
    };
  }, []);
  return (
    <Button disabled={disabled} onClick={contest.check}>
      Check
    </Button>
  );
};
const ButtonBuildCase = () => {
  const [disabled, setDisabled] = React.useState(true);
  React.useEffect(() => {
    const getStage = (stage: StatePublic["stage"]) => {
      if (stagesDict[stage] < stagesDict["contest"])
        return setDisabled(true);
      setDisabled(false);
    };
    sm.attach("stage", getStage);
    setDisabled(!sm.state.checkReady);
    return () => {
      sm.detach("stage", getStage);
    };
  }, []);
  return (
    <Button disabled={disabled} onClick={contest.build}>
      Rebuild test
    </Button>
  );
};
const ButtonStartContest = () => {
  const [disabled, setDisabled] = React.useState(true);
  React.useEffect(() => {
    const getStage = (stage: StatePublic["stage"]) => {
      if (stagesDict[stage] < stagesDict["textparsed"])
        return setDisabled(true);
      setDisabled(false);
    };
    sm.attach("stage", getStage);
    setDisabled(!sm.state.checkReady);
    return () => {
      sm.detach("stage", getStage);
    };
  }, []);

  const handleClick = () => {
    sm.state.stage = "contest";
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
      {/* <ButtonSaveFile /> */}
      <ButtonCheck />
      <ButtonBuildCase />
      <ButtonStartContest />
    </div>
  );
}
