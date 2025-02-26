"use client";
import React from "react";
import Link from "next/link";
import { TextInfo } from "@/db";
import sm from "@/StateManager";
import type { TextsDict } from "@/db";
import classNames from "classnames";
import styles from "./ListTexts.module.scss";

type ListProps = {
  texts: TextInfo["id"][];
  action?: { cb: (id: string) => void; name: string };
  link?: { name: string; href: string; slug: keyof TextInfo };
  className?: string;
};

export const ListTexts = ({ texts, action, link, className }: ListProps) => {
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
    <table className={classNames(className, styles.table)}>
      <tbody>
        {texts.map((id, i) => {
          const text = d[id];
          if (!text) return null;
          return (
            <tr key={id} className={i ? "" :styles["first-row"]}>
              <td className={classNames(styles.cell, styles.name)}>
                {text.name}
              </td>
              <td className={styles.cell}>Number Words: {text.length}</td>

              {link && (
                <td className={styles.cell}>
                  <Link href={link.href + id} className={styles.link}>
                    {link.name}
                  </Link>
                </td>
              )}
              {action && (
                <td className={styles.cell}>
                  <button onClick={() => action.cb(id)}>{action.name}</button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

type StateProps = {
  selector: {
    attach: (dispatch: (texts: TextInfo["id"][]) => void) => void;
    detach?: () => void;
  };
};
const useState = (selector: StateProps["selector"]) => {
  const [state, setState] = React.useState<TextInfo["id"][]>([]);
  React.useEffect(() => {
    selector.attach(setState);
    return () => {
      if (selector.detach) selector.detach();
    };
  }, [selector]);
  return state;
};

const ListTextsState = ({
  selector,
  ...props
}: StateProps & Omit<ListProps, "texts">) => {
  const texts = useState(selector);
  return <ListTexts texts={texts} {...props} />;
};

export default ListTextsState;
