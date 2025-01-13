"use client";
import React from "react";
import sm from "@/StateManager";
import parser from "@/utils/parser";
import contest from "@/utils/contest";
import { getAllTexts } from "@/db";

const Init = () => {
  React.useEffect(() => {
    sm();
    parser();
    contest();
    getAllTexts()
      .then((texts) => {
        sm().state.texts = texts;
        sm().state.initdb = true;
      })
      .catch((e) => e);
  }, []);
  return null;
};

export default Init;
