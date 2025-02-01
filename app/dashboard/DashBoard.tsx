"use client";
import React, { useState, useRef, useEffect } from "react";
import sm, { StatePublic } from "@/StateManager";
import type { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";
import useConstructor from "@/utils/useConstructor";
import smd, { SMDState } from "./state";
import { getTextByID } from "@/db";

type Props = {
  className?: string;
  text: string;
};



const TextEditor = ({ className, text }: Props) => {
  const [content, setContent] = useState(text);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(text);
  }, [text]);

  const handleInput = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const newContent = event.currentTarget.innerHTML;
    setContent(newContent);
  };

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      contentEditable={true}
      onInput={handleInput}
      className={className}
    />
  );
};




const ProxyTextEditor = () => {
  const [text, setText] = React.useState("");
  React.useEffect(() => {
    const handle = (textId: SMDState["textID"]) => {
      if (sm().state.texts[textId]) {
        getTextByID(textId).then(({text}) => {
          setText(text);
        });
      } else {
        setText("text not found");
      }
    };
    smd().attach("textID", handle);
    return () => smd().detach("textID", handle);
  }, []);
  return <TextEditor text={text} />;
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
    smd().state.textID = id;
  },
  name: "push to editor",
};
const DashBoard = () => {
  const selector = useConstructor(Selector);
  return (
    <div>
      <ProxyTextEditor />
      <ListTexts selector={selector} action={pushToTextEditor} />
    </div>
  );
};

export default DashBoard;
