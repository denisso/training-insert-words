"use client";
import React, { useState, useRef, useEffect } from "react";
import sm, { StatePublic } from "@/StateManager";
import type { TextInfo } from "@/db";
import ListTexts from "@/Components/ListTexts";

type Props = {
  className: string;
  text: string;
};

export const TextEditor = ({ className, text }: Props) => {
  const [content, setContent] = useState(text);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.innerHTML;
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
  public dispatch: Dispatch | null = null;
  attach(dispatch: Dispatch) {
    this.dispatch = dispatch;
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
  detach() {
    this.dispatch = null;
  }
}

const selector = new Selector();

const DashBoard = () => {
  return (
    <div>
      <ListTexts selector={selector} />
    </div>
  );
};

export default DashBoard;
