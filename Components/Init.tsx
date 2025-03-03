"use client";
import React from "react";
import sm, { TextsDict } from "@/StateManager";
import { getDbAllTexts } from "@/db";

const Init = () => {
  React.useEffect(() => {
    sm();
    // contest();
    getDbAllTexts()
      .then(({ data }) => {
        const dict: TextsDict = {};
        data.forEach((text) => {
          if (text instanceof Object)
            dict[text.id] = {
              length: text.length,
              group: text.group === null ? [] : text.group.split(","),
              name: text.name,
            };
        });
        sm().state.texts = dict;
        sm().state.textsAvailable = Object.keys(dict).sort((a, b) => {
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
