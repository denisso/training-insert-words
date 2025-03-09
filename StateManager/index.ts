"use client";
import { TextInfo } from "@/db";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";
import type { PopupItem } from "@/Components/Popup/Popup";
type ObserverCallback<T, K extends keyof T> = (arg: T[K]) => void;

export abstract class StateManager<T extends object> {
  protected _state: T;
  protected abstract state: T;
  protected _observs: { [K in keyof T]: Set<ObserverCallback<T, K>> };

  constructor(state: T) {
    this._state = state;
    this._observs = this._initObservers();
  }

  /**
   * Attach callback for notify observers
   * @param key key name property in proxy
   * @param cb callback
   * @returns
   */
  attach<K extends keyof T>(key: K, cb?: ObserverCallback<T, K>) {
    if (!cb) return;
    this._observs[key].add(cb);
  }

  /**
   * Detach callback for notify observers
   * @param key key name property in proxy
   * @param cb callback
   * @returns
   */
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

  /**
   * Notify observers by key name property
   * @param key - key name property in proxy
   */
  protected _notifyFn<K extends keyof T>(key: K) {
    // value variable - important for recursive update states
    const value = this._state[key];
    for (const cb of this._observs[key]) cb(value);
  }

  /**
   *
   * @param children children proxies
   * @returns proxy
   */
  protected _buildRoot(children?: Partial<T>) {
    return this._buildProxy(null, null, children);
  }
  /**
   *
   * @param key key property name in parent proxy
   * @param methods observed methods
   * @param children  children proxies
   * @returns proxy
   */
  protected _buildChildren<K extends keyof T>(
    key: K,
    methods?: (keyof T[K])[] | null,
    children?: Partial<T> | null
  ) {
    return this._buildProxy(key, methods, children);
  }

  /**
   *
   * @param key key property name in parent proxy
   * @param methods observed methods
   * @param children  children proxies
   * @returns
   */
  protected _buildProxy<K extends keyof T>(
    key?: K | null,
    methods?: (keyof T[K])[] | null,
    children?: Partial<T> | null
  ) {
    const state = !key ? this._state : this._state[key];
    return new Proxy(state as object, {
      get: (target, prop, receiver) => {
        if (children && children[prop as keyof T]) {
          return children[prop as keyof T];
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

export type TextsDict = {
  [id: TextInfo["id"]]: Pick<TextInfo, "name" | "length">;
};

export type StatePublic = {
  // stage: (typeof stages)[number];
  texts: TextsDict;
  textsAvailable: TextInfo["id"][];
  textsSelected: TextInfo["id"][];
  error: string;
  modal: {
    title: string;
    text: string;
    onOk: (done: () => void) => void;
    onCancel?: (done: () => void) => void;
    btns?: { text: "string"; cb: () => void }[];
  } | null;
  popups: PopupItem[];
};

class StateManagerPublic extends StateManager<StatePublic> {
  public state: StatePublic;
  constructor(state: StatePublic) {
    super(state);
    this.state = this._buildRoot() as StatePublic;
  }
}

export default clientSingletonBuilder(StateManagerPublic, {
  texts: {},
  textsAvailable: [],
  textsSelected: [],
  error: "",
  modal: null,
  popups: [],
});
