"use client";
import React from "react";
import ListTexts from "@/Components/ListTexts";
import sm, { StatePublic } from "@/StateManager";
import styles from "./HomePage.module.css";

const addToSelectedCb = (id: number) => {
  sm().state.textsSelected = [id, ...sm().state.textsSelected].sort(
    (a, b) => a - b
  );
  sm().state.textsAvailable = sm().state.textsAvailable.filter(
    (idrem) => idrem !== id
  );
};

const removeFromSelectedCb = (id: number) => {
  sm().state.textsSelected = sm().state.textsSelected.filter(
    (idrem) => idrem !== id
  );
  sm().state.textsAvailable = [id, ...sm().state.textsAvailable].sort(
    (a, b) => a - b
  );
};

const addToSelected = { cb: addToSelectedCb, name: "Move to selected" };
const removeFromSelected = {
  cb: removeFromSelectedCb,
  name: "Remove from selected",
};

class TextReducer<T> {
  public state: number[] = [];
  protected dispatch: ((texts: T) => void) | null = null;

  constructor() {
    this.setState = this.setState.bind(this);
  }

  setState(texts: StatePublic[ keyof StatePublic]) {
    if (this.dispatch) this.dispatch(texts as T);
  }

  setDispatch(dispatch: (newState: T) => void, stateKey: keyof StatePublic) {
    this.dispatch = dispatch;
    dispatch(sm().state[stateKey] as T);
    sm().attach(stateKey, this.setState);
  }

  unsetDispatch(stateKey: keyof StatePublic) {
    this.dispatch = null;
    sm().detach(stateKey, this.setState);
  }
}
class TextsSelectedReducer extends TextReducer<StatePublic["textsSelected"]> {
  setDispatch(dispatch: (newState: StatePublic["textsSelected"]) => void) {
    super.setDispatch(dispatch, "textsSelected");
  }

  unsetDispatch() {
    super.unsetDispatch("textsSelected");
  }
}

class TextsAvailableReducer extends TextReducer<StatePublic["textsAvailable"]> {
  setDispatch(dispatch: (newState: StatePublic["textsAvailable"]) => void) {
    super.setDispatch(dispatch, "textsAvailable");
  }

  unsetDispatch() {
    super.unsetDispatch("textsAvailable");
  }
}

const HomePage = () => {
  const reducerSelected = React.useRef(new TextsSelectedReducer());
  const reducerAvailable = React.useRef(new TextsAvailableReducer());

  return (
    <div className={styles.box}>
      <ListTexts
        className={styles.item}
        name={"selected"}
        reducer={reducerSelected.current}
        action={removeFromSelected}
        link={{ href: "/contest/", name: "Start contest", slug: "id" }}
      />
      <ListTexts
        className={styles.item}
        name={"available"}
        reducer={reducerAvailable.current}
        action={addToSelected}
        link={{ href: "/contest/", name: "Start contest", slug: "id" }}
      />
    </div>
  );
};
export default HomePage;
