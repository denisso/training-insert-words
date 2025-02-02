"use client";
import React from "react";
import sm, { StatePublic } from "@/StateManager";
import type { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";
import useConstructor from "@/utils/useConstructor";
import smd, { textUpdate } from "./state";
import { getTextByID, updtaeTextById } from "@/db";
import styles from "./DashBoard.module.css";

type Props = {
  className?: string;
  textID: string;
};

const TextEditor = ({ className, textID }: Props) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef("");
  const [textChanged, setTextChanged] = React.useState(false);
  React.useEffect(() => {
    if (!sm().state.texts[textID]) {
      if (contentRef.current !== null)
        contentRef.current.innerHTML = "text not found";
      return;
    }
    getTextByID(textID).then(({ text }) => {
      if (contentRef.current !== null) contentRef.current.innerHTML = text;
    });
  }, [textID]);

  const handleInput = (event: React.SyntheticEvent<HTMLDivElement>) => {
    setTextChanged(true);
    textRef.current = event.currentTarget.innerHTML;
    textUpdate("input");
  };

  const handleUpdate = () => {
    if (!contentRef.current) return;
    setTextChanged(false);
    if (textID !== "") updtaeTextById(textID, contentRef.current.innerHTML);
  };
  return (
    <>
      <div
        ref={contentRef}
        contentEditable={true}
        onInput={handleInput}
        className={className}
      />
      {textChanged ? <button onClick={handleUpdate}>Update</button> : <></>}
    </>
  );
};

type ProxyProps = {
  className?: string;
};

const ProxyTextEditor = ({ className }: ProxyProps) => {
  const [textId, setTextId] = React.useState("");

  React.useEffect(() => {
    const handleTextPush = () => {
      if (smd().state.textChangeReason != "push") return;

      //   if(textChangedRef.current){
      //     // not implemented yet
      setTextId(smd().state.textID);
      //     // logic ask question save current data text
      //   }
    };
    smd().attach("textUpdateTick", handleTextPush);
    return () => smd().detach("textUpdateTick", handleTextPush);
  }, []);

  return <TextEditor textID={textId} className={className} />;
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

const pushToTextEditor = {
  cb: (id: string) => {
    textUpdate("push", id);
  },
  name: "Push to editor",
};

const DashBoard = () => {
  const selector = useConstructor(Selector);
  return (
    <div className={styles.box}>
      <ListTexts
        selector={selector}
        action={pushToTextEditor}
        className={styles.item}
      />
      <ProxyTextEditor className={styles.item} />
    </div>
  );
};

export default DashBoard;
