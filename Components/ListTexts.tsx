"use client";
import React from "react";
import Link from "next/link";
import { TextInfo } from "@/db";
import sm from "@/StateManager";
import type { TextsDict } from "@/db";
import styles from "./ListTexts.module.css";

type ListProps = {
  name: string;
  texts: TextInfo["id"][];
  action?: { cb: (id: number) => void; name: string };
  link?: { name: string; href: string; slug: keyof TextInfo };
  className?: string;
};

export const ListTexts = ({
  name,
  texts,
  action,
  link,
  className,
}: ListProps) => {
  const [d, setDict] = React.useState<TextsDict>({});
  React.useEffect(() => {
    const handler = (dict: TextsDict) => {
      setDict(dict);
    };
    sm().attach("texts", handler);
    if (Object.keys(sm().state.texts).length) {
      setDict(sm().state.texts);
    }
    return () => {
      sm().detach("texts", handler);
    };
  }, [texts]);
  if (!Object.keys(d).length) {
    return null;
  }

  return (
    <div className={className}>
      <div className="header">{name}</div>
      <div className={styles.box}>
        {texts.map((id) => {
          const text = d[id];
          if (!text) return null;
          return (
            <div className={styles.items} key={id}>
              {text.name} {" / "} Number Words: {text.length} {" / "}
              {link ? (
                <Link href={link.href + id} className={styles.link}>
                  {link.name}
                </Link>
              ) : (
                <></>
              )}
              {" / "}
              {action ? (
                <button onClick={() => action.cb(id)}>{action.name}</button>
              ) : (
                <></>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type ReducerProps = {
  reducer: {
    setDispatch: (dispatch: (texts: TextInfo["id"][]) => void) => void;
    unsetDispatch: () => void;
  };
};
const useStateReducer = (reducer: ReducerProps["reducer"]) => {
  const [state, setState] = React.useState<TextInfo["id"][]>([]);
  React.useEffect(() => {
    reducer.setDispatch(setState);
    return () => reducer.unsetDispatch();
  }, []);
  return state;
};

// pattern reducer state
const ListTextStateReducer = ({
  reducer,
  ...props
}: ReducerProps & Omit<ListProps, "texts">) => {
  const texts = useStateReducer(reducer);
  return <ListTexts texts={texts} {...props} />;
};

export default ListTextStateReducer;
