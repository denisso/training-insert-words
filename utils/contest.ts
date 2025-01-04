import sm, { StatePublic, stagesDict } from "@/StateManager";
import config from "@/settings";

const randomInteger = (min: number, max: number) =>
  Math.round(min - 0.5 + Math.random() * (max - min + 1));

export type PlaceCb = (action: "select" | "word", payload: number) => void;

export type WordCb = (display: boolean) => void;
class ConTest {
  public placesCb = new Map<number, PlaceCb>();
  public wordsCb = new Map<number, WordCb>();
  public placeSelected = 0;
  public placesSet = new Map<number, number>();
  private _placed = 0;
  constructor() {
    this.build = this.build.bind(this);
    this.check = this.check.bind(this);
    sm.attach("stage", (stage: StatePublic["stage"]) => {
      if (stage == "textparsed") this.build();
    });
  }
  build() {
    if (stagesDict[sm.state.stage] < stagesDict["textparsed"]) return;
    sm.state.stage = "caseloading";
    sm.state.checkReady = false;
    this.placesSet.clear();
    this.placesCb.clear();
    this.wordsCb.clear();
    this._placed = 0;

    const n =
      sm.state.words.length - (sm.state.words.length % config.wordsStepCount);
    this.placeSelected =
      sm.state.words[randomInteger(0, config.wordsStepCount - 1)];
    this.placesSet.set(this.placeSelected, -1);
    for (let i = config.wordsStepCount; i < n; i += config.wordsStepCount) {
      const indx =
        sm.state.words[randomInteger(i, i + config.wordsStepCount - 1)];
      this.placesSet.set(indx, -1);
    }
    if (
      sm.state.words.length % config.wordsStepCount >=
      config.wordsStepCount >> 1
    ) {
      const indx = sm.state.words[randomInteger(n, sm.state.words.length - 1)];
      this.placesSet.set(indx, -1);
    }
    setTimeout(() => (sm.state.stage = "caseready"));
  }
  private _switchSelectTo(from: number, to: number) {
    const selectOffCb = this.placesCb.get(from);
    if (typeof selectOffCb == "function") selectOffCb("select", -1);

    const selectOnCb = this.placesCb.get(to);
    if (typeof selectOnCb == "function") selectOnCb("select", to);
  }

  private _selectFirstEmptyPlace() {
    const iterator = this.placesSet.entries();
    let result = iterator.next();
    while (!result.done) {
      const [placeindx, wordIndx] = result.value;
      if (wordIndx == -1) {
        this._switchSelectTo(this.placeSelected, placeindx);
        this.placeSelected = placeindx;
        break;
      }
      result = iterator.next();
    }
  }
  clickByWord(indx: number) {
    const pcb = this.placesCb.get(this.placeSelected);
    if (typeof pcb == "function") pcb("word", indx);
    this.placesSet.set(this.placeSelected, indx);
    this._placed++;

    if (this._placed == this.placesSet.size) {
      // activate button check
      sm.state.checkReady = true;
      const selectOffCb = this.placesCb.get(this.placeSelected);
      if (typeof selectOffCb == "function") selectOffCb("select", -1);
    } else {
      // select select next empty place
      this._selectFirstEmptyPlace();
    }
  }
  clickByPlace(
    indx: number,
    setSelected: (arg: boolean) => void,
    setWord: (arg: string) => void
  ) {
    const placeWordIndx = this.placesSet.get(indx);
    if (placeWordIndx == -1) {
      setSelected(true);
      const cb = this.placesCb.get(this.placeSelected);
      if (typeof cb == "function") cb("select", -1);
    } else {
      if (this._placed == this.placesSet.size) sm.state.checkReady = false;
      this._placed--;

      const wordIndx = this.placesSet.get(indx);
      if (wordIndx !== undefined) {
        const hideCb = this.wordsCb.get(wordIndx);
        if (typeof hideCb == "function") hideCb(false);
      }
      this.placesSet.set(indx, -1);

      this._switchSelectTo(this.placeSelected, indx);
      this.placeSelected = indx;
      setWord("");
    }
    this.placeSelected = indx;
  }
  check() {
    const iterator = this.placesSet.entries(),
      chunks = sm.state.textChunks;
    let result = iterator.next(),
      minus = 0;
    while (!result.done) {
      const [placeindx, wordIndx] = result.value;
      if (chunks[placeindx].toLowerCase() !== chunks[wordIndx].toLowerCase()) {
        minus++;
        this.placesSet.set(placeindx, -1);
        const placeCb = this.placesCb.get(placeindx);
        if (typeof placeCb == "function") placeCb("word", -1);
        const wordCb = this.wordsCb.get(placeindx);
        if (typeof wordCb == "function") wordCb(false);
      }
      result = iterator.next();
    }
    this._placed -= minus;
    if (minus) {
      this._selectFirstEmptyPlace();
    } else {
      alert("Ok");
    }
  }
}

const test = new ConTest();
export default test;
