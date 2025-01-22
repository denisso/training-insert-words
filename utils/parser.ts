"use client";
import type { ContestData } from "./contest";

export function isLatinLetter(char: string) {
  return /^[a-zA-Z]$/.test(char);
}

class Parser {
  private _pushWord(data: ContestData, w: string) {
    if (!w) return;
    if (w.length > 1 || isLatinLetter(w))
      data.words.push(data.textChunks.length);
    data.textChunks.push(w);
  }
  parse(data: ContestData) {
    const text = data.text;
    data.paragraphs.push(0);
    const n = text.length,
      a = "a".charCodeAt(0),
      A = "A".charCodeAt(0),
      z = "0".charCodeAt(0),
      u = "'".charCodeAt(0),
      ns = "\n".charCodeAt(0);
    let w = "";
    for (let i = 0, p = false; i < n; i++) {
      const c = text.charCodeAt(i);
      if (
        (c >= a && c < a + 26) ||
        (c >= A && c < A + 26) ||
        (c >= z && c <= z + 9) ||
        c == u
      ) {
        if (p) {
          data.paragraphs.push(data.textChunks.length);
          p = false;
        }
        if (c == u && !w) this._pushWord(data, text[i]);
        else w += text[i];
      } else if (c == ns) {
        p = true;
        this._pushWord(data, w);
        w = "";
      } else {
        this._pushWord(data, w);
        w = "";
        if (i && text[i - 1] != text[i]) this._pushWord(data, text[i]);
      }
    }
    this._pushWord(data, w);
  }
}

export default Parser;
