import sm, { StatePublic } from "@/StateManager";
import config from "@/settings";

const randomInteger = (min: number, max: number) =>
  Math.round(min - 0.5 + Math.random() * (max - min + 1));

export type CallBackButton = (
  action: "select" | "word",
  payload: number
) => void;

class ConTest {
  public words: Map<number, () => void>;
  public places: Map<number, CallBackButton>;
  public placeSelected: number;
  // dict for fast test isWord by time O(1)
  public wordsSet: Map<number, boolean>;
  constructor() {
    this.words = new Map<number, () => void>();
    this.places = new Map<number, () => void>();
    this.wordsSet = new Map<number, boolean>();
    this.placeSelected = 0;
    sm.attach("stage", (stage: StatePublic["stage"]) => {
      if (stage == "textparsed" || stage == "casestart") this.start();
    });
  }
  start() {
    sm.state.stage = "caseloading";
    this.wordsSet.clear();
    this.words.clear();
    this.places.clear();

    const n =
      sm.state.words.length - (sm.state.words.length % config.wordsStepCount);
    this.placeSelected =
      sm.state.words[randomInteger(0, config.wordsStepCount - 1)];
    this.wordsSet.set(this.placeSelected, false);
    for (let i = config.wordsStepCount; i < n; i += config.wordsStepCount) {
      const indx =
        sm.state.words[randomInteger(i, i + config.wordsStepCount - 1)];
      this.wordsSet.set(indx, false);
    }
    if (
      sm.state.words.length % config.wordsStepCount >=
      config.wordsStepCount >> 1
    ) {
      const indx = sm.state.words[randomInteger(n, sm.state.words.length - 1)];
      this.wordsSet.set(indx, false);
    }
    sm.state.stage = "caseready";
  }
}

const test = new ConTest();
export default test;
