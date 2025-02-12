import React from "react";
import styles from "./Popup.module.css";
import classNames from "classnames";
type Props = {
  className: string;
  text: string;
  type: "error" | "info";
};
const Popup = ({ className, text, type }: Props) => {
  return (
    <div className={classNames(className, styles[type])}>
      {text}
      <div className="line-box">
        <div className="line"></div>
      </div>
    </div>
  );
};

export default Popup;
