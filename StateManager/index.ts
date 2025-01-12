"use client";
import { TextInfo } from "@/db";

type ObserverCallback<T, K extends keyof T> = (arg: T[K]) => void;

abstract class StateManager<T extends object> {
  protected _state: T;
  protected abstract state: T;
  protected _observs: { [K in keyof T]: Set<ObserverCallback<T, K>> };

  constructor(state: T) {
    this._state = state;
    this._observs = this._initObservers();
  }

  attach<K extends keyof T>(key: K, cb?: ObserverCallback<T, K>) {
    if (!cb) return;
    this._observs[key].add(cb);
  }

  detach<K extends keyof T>(key: K, cb?: ObserverCallback<T, K>) {
    if (!cb) return;
    this._observs[key].delete(cb);
  }

  private _initObservers(): { [K in keyof T]: Set<ObserverCallback<T, K>> } {
    const observs: Partial<{ [K in keyof T]: Set<ObserverCallback<T, K>> }> =
      {};
    for (const key of Object.keys(this._state) as (keyof T)[]) {
      observs[key] = new Set<ObserverCallback<T, typeof key>>();
    }
    return observs as { [K in keyof T]: Set<ObserverCallback<T, K>> };
  }

  protected _notifyFn<K extends keyof T>(key: K) {
    // value variable - important for recursive update states
    const value = this._state[key];
    for (const cb of this._observs[key]) cb(value);
  }

  protected _buildProxy<K extends keyof T>(
    key?: K | null,
    methods?: (keyof T[K])[] | null,
    childrens?: Partial<T> | null
  ) {
    const state = !key ? this._state : this._state[key];
    return new Proxy(state as object, {
      get: (target, prop, receiver) => {
        if (childrens && childrens[prop as keyof T]) {
          return childrens[prop as keyof T];
        }
        if (
          key &&
          methods &&
          typeof (target as T)[prop as keyof T] === "function"
        ) {
          if (methods.includes(prop as keyof T[K])) {
            return (...args: string[]) => {
              const result = Reflect.get(target, prop, receiver).apply(
                target,
                args
              );
              this._notifyFn(key);
              return result;
            };
          }
          return Reflect.get(target, prop, receiver).bind(target);
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value, receiver) => {
        const result = Reflect.set(target, prop, value, receiver);
        this._notifyFn(prop as keyof T);
        return result;
      },
    });
  }
}

export const stages = [
  "init",
  "fileloaded",
  "textparsed",
  "textshow",
  "casestart",
  "caseloading",
  "caseready",
  "contest",
  "contestfinish",
] as const;

export const stagesDict: Record<(typeof stages)[number], number> =
  stages.reduce((a, e, i) => {
    a[e] = i;
    return a;
  }, {} as Record<(typeof stages)[number], number>);

export type StatePublic = {
  stage: (typeof stages)[number];
  texts: TextInfo[];
  initdb: boolean;
  timerSec: number;
  // to contest
  text: string;
  textChunks: string[];
  paragraphs: number[];
  // array for fast navigate by only words
  words: number[];
  checkReady: boolean;
  error: string;
};

class StateManagerPublic extends StateManager<StatePublic> {
  public state: StatePublic;
  constructor(state: StatePublic) {
    super(state);
    this.state = this._buildProxy() as StatePublic;
  }
}

let inst: StateManagerPublic | undefined;

function getInstance(): StateManagerPublic {
  if (!inst) {
    if (typeof window === "undefined") {
      throw new Error("StateManagerPublic is not available on the server.");
    }
    inst = new StateManagerPublic({
      texts: [],
      text: "",
      initdb: false,
      stage: "init",
      timerSec: 0,
      paragraphs: [],
      words: [],
      textChunks: [],
      checkReady: false,
      error: "",
    });
  }
  return inst;
}

export default getInstance;
