"use client";
import React from "react";
import sm, { StatePublic } from "@/StateManager";
import type { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";
import useConstructor from "@/utils/useConstructor";
import { textChange } from "./state";
import TextEditor from "./Editor";
import styles from "./DashBoard.module.css";

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
    textChange("push", id);
  },
  name: "Push to editor",
};

const DashBoard = () => {
  const selector = useConstructor(Selector);

  return (
    <>
      <div className={styles.box}>
        <div className={styles.item}>List texts</div>
        <div className={styles.item}></div>
        Editor
      </div>
      <div className={styles.box}>
        <ListTexts
          selector={selector}
          action={pushToTextEditorCallBack}
          className={styles.item}
        />
        <TextEditor className={styles.item} />
      </div>
    </>
  );
};

export default DashBoard;
