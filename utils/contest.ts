"use client";
import config from "@/settings";
import { StateManager } from "@/StateManager";
import Parser from "./parser";

const randomInteger = (min: number, max: number) =>
  Math.round(min - 0.5 + Math.random() * (max - min + 1));

export const stages = [
  "init", // the context module has been initialized
  "textLoaded", // the text was uploaded
  "textParsed", // the preparation of the data structures is completed
  "contestReady", // show the text to the user
  "contestStarted", // the contest has started
  "contestFinished", // the contest has ended
] as const;

export const stagesDict: Record<(typeof stages)[number], number> =
  stages.reduce((a, e, i) => {
    a[e] = i;
    return a;
  }, {} as Record<(typeof stages)[number], number>);

export type StateContest = {
  timerSec: number;
  stage: (typeof stages)[number];
  checkReady: boolean;
};

class StateManagerContest extends StateManager<StateContest> {
  public state: StateContest;
  constructor(state: StateContest) {
    super(state);
    this.state = this._buildProxy() as StateContest;
  }
}

export type ContestData = {
  // raw text can be used for copy to buffer
  text: string;
  // contains the index of words that will be the beginning of the paragraph
  paragraphs: number[];
  // indexes only words
  words: number[];
  // indexes of all parts of speech
  textChunks: string[];
};

class Timer {
  private _timer: ReturnType<typeof setTimeout> | null;

  constructor() {
    this._timer = null;
  }
  start() {
    this._timer = setInterval(() => {
      getInstance().state.timerSec++;
    }, 1000);
  }
  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }
  reset() {
    getInstance().state.timerSec = 0;
    this.stop();
  }
}

export class Contest {
  private _timer: Timer;
  public state: StateContest;
  public sm: StateManagerContest;
  public data: ContestData = {
    text: "",
    paragraphs: [],
    words: [],
    textChunks: [],
  };
  // parser text works fill data structures in this.data
  private _parser: Parser;

  public placesStates;

  public wordsStates = new Map<number, (arg: boolean) => void>();

  // the current place we are working with
  public placeSelected = 0;

  // place first index - place index in text second index - word index
  // uses for check test pass if
  // words[index1].toLowerCase() === words[index2].toLowerCase()
  // see method this.check for more info
  public matchSet = new Map<number, number>();

  // words counter set by places, if _placed === matchSet.size run this.check
  private _placed = 0;

  constructor() {
    this._timer = new Timer();
    this.sm = new StateManagerContest({
      timerSec: 0,
      stage: "init",
      checkReady: false,
    });
    this.state = this.sm.state;
    this._parser = new Parser();
    this.prepare = this.prepare.bind(this);
    this.check = this.check.bind(this);
    const that = this;
    this.placesStates = {
      //
      selected: new Map<number, (arg: boolean) => void>(),
      wordString: new Map<number, (word: string) => void>(),
      setStates: function (
        indx: number,
        setSelected: (arg: boolean) => void,
        setWordString: (word: string) => void
      ) {
        // some kind of crunch
        this.selected.set(indx, setSelected);
        this.wordString.set(indx, setWordString);
        if (that.placeSelected == indx) {
          setSelected(true);
        }
      },
    };
  }
  loadText(text: string) {
    this.clear()
    this.data.text = text;
    this._parser.parse(this.data);
    this.prepare();
  }
  clear() {
    this.reset();
    this.data.text = "";
    this.data.words.length = 0;
    this.data.textChunks.length = 0;
    this.data.paragraphs.length = 0;
  }
  reset() {
    this._timer.reset();
    this.matchSet.clear();
    this.wordsStates.clear();
    this.placesStates.selected.clear();
    this.placesStates.wordString.clear();
    this._placed = 0;
    this.placeSelected = 0;
  }
  prepare() {
    this.reset();
    let prev = randomInteger(0, config.wordsStepCount - 1);
    const n =
      this.data.words.length - (this.data.words.length % config.wordsStepCount);
    this.placeSelected = this.data.words[prev];
    this.matchSet.set(this.placeSelected, -1);
    for (let i = config.wordsStepCount; i < n; i += config.wordsStepCount) {
      let randIndx = randomInteger(i, i + config.wordsStepCount - 1);

      if (prev + 1 == randIndx) randIndx++;
      let indx = this.data.words[randIndx];
      this.matchSet.set(indx, -1);
      prev = randIndx;
    }
    if (
      this.data.words.length % config.wordsStepCount >=
      config.wordsStepCount >> 1
    ) {
      let randIndx = randomInteger(n, this.data.words.length - 1);
      if (prev + 1 == randIndx) randIndx++;
      const indx =
        this.data.words[randomInteger(n, this.data.words.length - 1)];
      this.matchSet.set(indx, -1);
    }
    this.state.stage = "contestReady";
  }

  start() {
    if (stagesDict[this.state.stage] < stagesDict["contestReady"]) return;
    this.state.stage = "contestStarted";
    this._timer.reset();
    this._timer.start();
  }

  private _switchSelectTo(from: number, to: number) {
    const selectOffCb = this.placesStates.selected.get(from);
    if (typeof selectOffCb == "function") selectOffCb(false);
    const selectOnCb = this.placesStates.selected.get(to);
    if (typeof selectOnCb == "function") selectOnCb(true);
  }

  private _selectFirstEmptyPlace() {
    const iterator = this.matchSet.entries();
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
  wordClick(indx: number) {
    const setWordToPlace = this.placesStates.wordString.get(this.placeSelected);
    if (typeof setWordToPlace == "function") {
      // set word
      setWordToPlace(this.data.textChunks[indx]);
    }
    const wordIndexInplace = this.matchSet.get(this.placeSelected);
    if (wordIndexInplace !== undefined && wordIndexInplace != -1) {
      const hideCb = this.wordsStates.get(wordIndexInplace);
      if (typeof hideCb == "function") {
        hideCb(false);
        this._placed--;
      }
    }
    this.matchSet.set(this.placeSelected, indx);
    this._placed++;

    if (this._placed == this.matchSet.size) {
      // activate button check
      this.state.checkReady = true;
      const selectOffCb = this.placesStates.selected.get(this.placeSelected);
      if (typeof selectOffCb == "function") selectOffCb(false);
    } else {
      // select select next empty place
      this._selectFirstEmptyPlace();
    }
  }

  placeClick(indx: number) {
    if (this.placeSelected === indx) {
      if (this._placed == this.matchSet.size) this.state.checkReady = false;

      const wordIndx = this.matchSet.get(indx);
      if (wordIndx !== undefined) {
        const hideCb = this.wordsStates.get(wordIndx);
        if (typeof hideCb == "function") {
          hideCb(false);
          this._placed--;
        }
      }
      const placeWordSetCb = this.placesStates.wordString.get(indx);
      if (typeof placeWordSetCb == "function") placeWordSetCb("");
      this.matchSet.set(indx, -1);
    } else {
      // select turn off old place
      this._switchSelectTo(this.placeSelected, indx);
      this.placeSelected = indx;
    }
  }
  check() {
    const iterator = this.matchSet.entries(),
      chunks = this.data.textChunks;
    let result = iterator.next(),
      minus = 0;
    while (!result.done) {
      const [placeindx, wordIndx] = result.value;
      if (chunks[placeindx].toLowerCase() !== chunks[wordIndx].toLowerCase()) {
        minus++;
        this.matchSet.set(placeindx, -1);
        const wordStringCb = this.placesStates.wordString.get(placeindx);
        if (typeof wordStringCb == "function") wordStringCb("");
        const wordHideCb = this.wordsStates.get(placeindx);
        if (typeof wordHideCb == "function") wordHideCb(false);
      }
      result = iterator.next();
    }
    this._placed -= minus;
    if (minus) {
      this._selectFirstEmptyPlace();
    } else {
      this.state.stage = "contestFinished";
      this._timer.stop();
      alert("Ok");
    }
  }
}

let inst: Contest | undefined;

function getInstance(): Contest {
  if (!inst) {
    if (typeof window === "undefined") {
      throw new Error("ConTest is not wordString on the server.");
    }
    inst = new Contest();
  }
  return inst;
}

export default getInstance;
