"use client";
import React from "react";
import sm, { StatePublic } from "@/StateManager";
import { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";
import useConstructor from "@/utils/useConstructor";
import smd, { changeText, saveTextToDB } from "./state";
import TextEditor from "./Editor";
import classNames from "classnames";
import styles from "./DashBoard.module.scss";

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

const TextName = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    smd().state.getName = () =>
      inputRef.current ? inputRef.current.value : "";
  }, []);

  return (
    <div className={styles.name}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        onChange={() => changeText("input")}
      />
      <button className="reset">Reset</button>
    </div>
  );
};

const EditorContainer = ({ className }: { className: string }) => {
  return (
    <div className={className}>
      <TextName />
      <TextEditor className={styles.editor} />
    </div>
  );
};

const EditorButtons = ({ className }: { className: string }) => {
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
    <div className={className}>
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

const DashBoard = () => {
  const selector = useConstructor(Selector);

  return (
    <div className={styles.box}>
      <div className={classNames(styles.item, styles.header)}>
        <span className="text">List texts</span>
      </div>
      <div className={classNames(styles.item, styles.header)}>
        <EditorButtons className={classNames(styles.item, styles.editor)} />
      </div>

      <ListTexts
        selector={selector}
        action={pushToTextEditorCallBack}
        className={classNames(styles.item, styles.content)}
      />
      <EditorContainer className={classNames(styles.item, styles.content)} />
    </div>
  );
};

export default DashBoard;
