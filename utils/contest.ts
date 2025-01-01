import sm, { StatePublic } from "@/StateManager";
import config from "@/settings";

const randomInteger = (min: number, max: number) =>
  Math.round(min - 0.5 + Math.random() * (max - min + 1));

class ConTest {
  constructor() {
    this.start = this.start.bind(this);
    sm.attach("stage", this.start);
  }
  start(stage: StatePublic["stage"]) {
    if (stage != "textparsed") return;
    sm.state.stage = "caseloading";
    sm.state.wordsSelected.length = 0;
    sm.state.wordsSet.clear();
    const n =
      sm.state.words.length - (sm.state.words.length % config.wordsStepCount);
    for (let i = 0; i < n; i += config.wordsStepCount) {
      const indx =
        sm.state.words[randomInteger(i, i + config.wordsStepCount - 1)];
      sm.state.wordsSet.add(indx);
      sm.state.wordsSelected.push(indx);
    }
    if (
      sm.state.words.length % config.wordsStepCount >=
      config.wordsStepCount >> 1
    ) {
      const indx =
        sm.state.words[randomInteger(n, sm.state.wordsSelected.length - 1)];
      sm.state.wordsSet.add(indx);
      sm.state.wordsSelected.push(indx);
    }
    sm.state.stage = "caseready";
  }
}

const test = new ConTest();
export default test;
