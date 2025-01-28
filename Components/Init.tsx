"use client";
import React from "react";
import sm from "@/StateManager";
import { getAllTexts } from "@/db";

const Init = () => {
  React.useEffect(() => {
    sm();
    // contest();
    getAllTexts()
      .then((texts) => {
        sm().state.texts = texts;
        sm().state.textsAvailable = Object.keys(texts).sort((a, b) => {
          if (a.length === b.length) {
            return a.localeCompare(b);
          }
          return a.length - b.length;
        });
      })
      .catch((e) => e);
  }, []);
  return null;
};

export default Init;
