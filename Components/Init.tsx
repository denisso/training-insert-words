"use client";
import React from "react";
import sm from "@/StateManager";
import parser from "@/utils/parser";
import { getAllTexts } from "@/db";

const Init = () => {
  React.useEffect(() => {
    sm();
    // contest();
    getAllTexts()
      .then((texts) => {
        sm().state.texts = texts;
        sm().state.textsAvailable = Object.keys(texts).map(Number);
      })
      .catch((e) => e);
  }, []);
  return null;
};

export default Init;
