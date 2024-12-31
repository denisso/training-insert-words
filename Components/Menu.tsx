"use client";
import React from "react";
import sm from "@/StateManager";
import settings from "@/settings";
import Button from "./Button";
import "@/utils/parser";
import styles from "./global.module.css";

const ButtonLoadFile = () => {
  const refInput = React.useRef<HTMLInputElement>(null);
  const onClick = () => {
    refInput.current?.click();
  };
  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      if (file.size > settings.fileSize) {
        sm.state.text = `file size is more than ${settings.fileSize} bytes`;
        return;
      } else if (sm.state.text) {
        sm.state.text = "";
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        sm.state.text = String(e.target?.result) ?? "";
      };
      reader.readAsText(file);
    }
  };
  return (
    <>
      <Button onClick={onClick}>Load from File</Button>
      <input
        ref={refInput}
        type="file"
        accept=".txt"
        onChange={loadFromFile}
        style={{ display: "none" }}
      />
    </>
  );
};
const ButtonSaveFile = () => {
  const saveToFile = () => {
    const blob = new Blob([sm.state.text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "textfile.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return <Button onClick={saveToFile}>Save to File</Button>;
};

export default function Menu() {
  return (
    <div className={styles.container}>
      <ButtonLoadFile />
      <ButtonSaveFile />
    </div>
  );
}
