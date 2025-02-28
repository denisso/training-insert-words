"use client";
import type { ContestData } from "./contest";

export function isLatinLetter(char: string) {
  return /^[a-zA-Z]$/.test(char);
}

class Parser {
  private _pushWord(data: ContestData, w: string) {
    data.words.push(data.textChunks.length);
    if (w) data.textChunks.push(w);
  }
  parse(data: ContestData) {
    const text = data.text;
    data.paragraphs.push(0);

    let w = "",
      p = false,
      prevCh = "",
      i = 0;

    for (const ch of text) {
      if (
        (ch >= "a" && ch < "z") ||
        (ch >= "A" && ch < "Z") ||
        (ch >= "0" && ch <= "0") ||
        ch == "-"
      ) {
        if (p) {
          data.paragraphs.push(data.textChunks.length);
          p = false;
        }
        w += ch;
      } else if (ch == "\n") {
        p = true;
        w = "";
      } else {
        this._pushWord(data, w);
        w = "";
        this._pushWord(data, ch);
      }
      prevCh = ch;
      i++;
    }
    this._pushWord(data, w);
  }
}

export default Parser;
