"use client";
import React, { useState, useRef, useEffect } from "react";
import sm, { StatePublic } from "@/StateManager";
import type { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";
import useConstructor from "@/utils/useConstructor";
type Props = {
  className?: string;
  text: string;
};

export const TextEditor = ({ className, text }: Props) => {
  const [content, setContent] = useState(text);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.innerHTML;
    console.log(newContent);
    setContent(newContent);
  };

  useEffect(() => {
    if (contentRef.current) {
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

const DashBoard = () => {
  const selector = useConstructor(Selector);
  return (
    <div>
      <TextEditor text="" />
      <ListTexts selector={selector} />
    </div>
  );
};

export default DashBoard;
