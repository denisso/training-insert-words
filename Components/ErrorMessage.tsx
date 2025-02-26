"use client";
import React from "react";
import sm from "@/StateManager";
import styles from "./ErrorMessage.module.css";

const ErrorMessage = () => {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    sm().attach("error", setMessage);
    return () => {
      sm().detach("error", setMessage);
    };
  }, []);
  return (
    <div className={styles["error-box"]}>{message ? message : "No Errors"}</div>
  );
};

export default ErrorMessage;
