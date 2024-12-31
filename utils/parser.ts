import sm from "@/StateManager";

export function isLatinLetter(char: string) {
  return /^[a-zA-Z]$/.test(char);
}

class Parser {
  constructor() {
    this.parse = this.parse.bind(this);
    sm.attach("text", this.parse);
  }
  pushWord(w: string) {
    if (!w) return;
    if (w.length > 1 || isLatinLetter(w)) sm.state.words++;
    sm.state.textChunks.push(w);
  }
  parse(text: string) {
    sm.state.words = 0;
    sm.state.textChunks.length = 0;
    sm.state.paragraphs.length = 0;
    sm.state.wordsSelected.length = 0
    sm.state.paragraphs.push(0);
    sm.state.parsed = false;

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
          sm.state.paragraphs.push(sm.state.textChunks.length);
          p = false;
        }
        if (c == u && !w) this.pushWord(text[i]);
        else w += text[i];
      } else if (c == ns) {
        p = true;
        this.pushWord(w);
        w = "";
      } else {
        this.pushWord(w);
        w = "";
        if (i && text[i - 1] != text[i]) this.pushWord(text[i]);
      }
    }
    this.pushWord(w);
    sm.state.parsed = true;
    for(let i =0; i < n; i++){
      
    }
  }
}

const parser = new Parser();
export default parser;
