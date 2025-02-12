import React from "react";
import smd, { textChange, SMDState } from "./state";
import sm from "@/StateManager";
import throttle from "@/utils/throttle";
import { getTextByID, TextFieldsDB, updtaeTextById } from "@/db";

type TextNewProps = {
  className: string;
};

export const NewBtn = ({ className }: TextNewProps) => {
  const onClick = () => {
    if (smd().state.textChanged) {
    } else {
    }
  };
  return (
    <button onClick={onClick} className={className}>
      New
    </button>
  );
};

type TextUpdateProps = {
  className: string;
};

export const SaveChagesBtn = ({ className }: TextUpdateProps) => {
  const [enable, setEnable] = React.useState(false);
  React.useEffect(() => {
    const onTextChanged = (changed: SMDState["textChanged"]) => {
      setEnable(changed);
    };
    smd().attach("textChanged", onTextChanged);
    return () => smd().detach("textChanged", onTextChanged);
  }, []);
  const onClick = () => {
    smd().state.textChanged = false;
    const getText = smd().state.getText;
    if (getText === null) return;
    updtaeTextById(smd().state.textID, getText());
  };
  return (
    <>
      {enable && (
        <button onClick={onClick} className={className}>
          Update
        </button>
      )}
    </>
  );
};

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

type Props = {
  className?: string;
};

const textChangeThrottle = throttle(() => textChange("input"));

const MessageErrorEditorRef = "Editor ref not valid";

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
      if (smd().state.textChangeReason == "new") {
        setText("");
      }
      if (smd().state.textChangeReason == "push")
        getTextByID(smd().state.textID)
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
