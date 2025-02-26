"use client";
import React from "react";
import sm, { StatePublic } from "@/StateManager";
import { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";
import useConstructor from "@/utils/useConstructor";
import smd, { SMDState, changeText, saveTextToDB } from "./state";
import TextEditor from "./Editor";
import classNames from "classnames";
import styles from "./DashBoard.module.scss";

const TextName = ({ className }: { className?: string }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    smd().state.getName = () =>
      inputRef.current ? inputRef.current.value : "";
    const handleTExtChangeReason = (reason: SMDState["textChangeReason"]) => {
      if (!inputRef.current) return;
      if (reason == "push")
        inputRef.current.value =
          sm().state.texts[smd().state.textID]?.name ?? "";
      else if (reason == "new") inputRef.current.value = "";
    };
    smd().attach("textChangeReason", handleTExtChangeReason);
    return () => smd().detach("textChangeReason", handleTExtChangeReason);
  }, []);

  return (
    <div className={classNames(className, styles["editor-name"])}>
      <input
        ref={inputRef}
        type="text"
        className={styles["input-name"]}
        onChange={() => changeText("input")}
      />
      <button className={styles["button-name"]}>Reset</button>
    </div>
  );
};

const EditorContainer = ({ className }: { className?: string }) => {
  return (
    <div className={classNames(className, styles["editor-container"])}>
      <TextName />
      <TextEditor />
    </div>
  );
};

const EditorButtons = ({ className }: { className?: string }) => {
  const [disable, setDisable] = React.useState(false);
  const onNewText = () => {
    if (disable) return;
    changeText("new");
  };
  const onSaveText = () => {
    if (disable) return;
    saveTextToDB(() => setDisable(false));
  };
  return (
    <div className={classNames(className, styles["editor-buttons"])}>
      <button onClick={onNewText} disabled={disable}>
        New text
      </button>
      <button onClick={onSaveText} disabled={disable}>
        Save text
      </button>
      <span className="text">Editor</span>
    </div>
  );
};

type Dispatch = (newState: TextInfo["id"][]) => void;

class Selector {
  attach(dispatch: Dispatch) {
    sm().attach("texts", (texts: StatePublic["texts"]) => {
      dispatch(
        Object.keys(texts).sort((a, b) => {
          if (a.length === b.length) {
            return a.localeCompare(b);
          }
          return a.length - b.length;
        })
      );
    });
  }
}

const pushToTextEditorCallBack = {
  cb: (id: string) => {
    changeText("push", id);
  },
  name: "Push to editor",
};

const DashBoard = () => {
  const selector = useConstructor(Selector);

  return (
    <div className={styles.grid}>
      <div className={classNames(styles["row-header"], styles["col-texts"])}>
        <span className="text">List texts</span>
      </div>
      <EditorButtons
        className={classNames(styles["row-header"], styles["col-editor"])}
      />
      <div className={classNames(styles["row-content"], styles["col-texts"])}>
        <ListTexts selector={selector} action={pushToTextEditorCallBack} />
      </div>
      <EditorContainer
        className={classNames(styles["row-content"], styles["col-editor"])}
      />
    </div>
  );
};

export default DashBoard;
