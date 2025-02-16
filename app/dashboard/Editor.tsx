import React from "react";
import smd, { changeText, SMDState } from "./state";
import sm from "@/StateManager";
import throttle from "@/utils/throttle";
import { getDbTextByID, TextFieldsDB, updateDBTextById } from "@/db";

type TextFieldProps = {
  className: string;
  key: keyof Omit<TextFieldsDB, "text">;
};

export const TextField = ({ key, className }: TextFieldProps) => {
  const [state, setState] = React.useState("");
  React.useEffect(() => {
    const getPropByKey = (id: SMDState["textID"]) => {
      const text = sm().state.texts[id];
      if (!text) return setState("-");
      if (key == "id") setState(smd().state.textID);
      else setState(text[key]);
    };
    smd().attach("textID", getPropByKey);
    return () => smd().detach("textID", getPropByKey);
  }, []);
  return <div className={className}>{state}</div>;
};

const textChangeThrottle = throttle(() => changeText("input"));

const MessageErrorEditorRef = "Editor ref not valid";

type Props = {
  className?: string;
};

const TextEditor = ({ className }: Props) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    smd().state.getText = () => {
      if (!contentRef.current) return "";
      return contentRef.current.innerHTML;
    };
    const setText = (text: string) => {
      if (!contentRef.current) return console.error(MessageErrorEditorRef);
      contentRef.current.innerHTML = text;
    };
    const handleTick = () => {
      const reason = smd().state.textChangeReason;
      if (reason == "new") {
        setText("");
      }
      if (reason == "push")
        getDbTextByID(smd().state.textID)
          .then(({ text }) => {
            setText(text);
          })
          .catch((e) => {
            if (!contentRef.current)
              return console.error(MessageErrorEditorRef);
            if (e instanceof Error) {
              contentRef.current.innerHTML = e.message;
            } else if (typeof e === "string") {
              contentRef.current.innerHTML = e;
            } else {
              contentRef.current.innerHTML = "unknown error";
            }
          });
    };
    smd().attach("textUpdateTick", handleTick);
    return () => smd().detach("textUpdateTick", handleTick);
  }, []);

  const handleInput = () => {
    textChangeThrottle();
  };

  return (
    <>
      <div
        ref={contentRef}
        contentEditable={true}
        onInput={handleInput}
        className={className}
      />
    </>
  );
};

export default TextEditor;
