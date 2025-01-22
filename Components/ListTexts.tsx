"use client";
import React from "react";
import Link from "next/link";
import { TextInfo } from "@/db";
import sm from "@/StateManager";
import type { TextsDict } from "@/db";
import styles from "./ListTexts.module.css";

type Props = {
  name: string;
  texts: TextInfo["id"][];
  action?: { cb: (id: number) => void; name: string };
  link?: { name: string; href: string; slug: keyof TextInfo };
  className?: string;
};

const ListTexts = ({ name, texts, action, link, className }: Props) => {
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

export default ListTexts;
