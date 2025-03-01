"use client";
import React from "react";
import ListTexts, { Action } from "@/Components/ListTexts";
import sm, { StatePublic } from "@/StateManager";
import styles from "./HomePage.module.css";

const addToSelectedCb = (id: string) => {
  sm().state.textsSelected = [id, ...sm().state.textsSelected].sort((a, b) => {
    if (a.length === b.length) {
      return a.localeCompare(b);
    }
    return a.length - b.length;
  });
  sm().state.textsAvailable = sm().state.textsAvailable.filter(
    (idrem) => idrem !== id
  );
};

const removeFromSelectedCb = (id: string) => {
  sm().state.textsSelected = sm().state.textsSelected.filter(
    (idrem) => idrem !== id
  );
  sm().state.textsAvailable = [id, ...sm().state.textsAvailable].sort(
    (a, b) => {
      if (a.length === b.length) {
        return a.localeCompare(b);
      }
      return a.length - b.length;
    }
  );
};

const addToSelected: Action = {
  type: "callback",
  cb: addToSelectedCb,
  name: "Move to selected",
};
const removeFromSelected: Action = {
  type: "callback",
  cb: removeFromSelectedCb,
  name: "Remove from selected",
};

class SelectorTexts<T> {
  protected dispatch: ((texts: T) => void) | null = null;

  constructor() {
    this.setState = this.setState.bind(this);
  }

  setState(texts: StatePublic[keyof StatePublic]) {
    if (this.dispatch) this.dispatch(texts as T);
  }

  attach(dispatch: (newState: T) => void, stateKey: keyof StatePublic) {
    this.dispatch = dispatch;
    dispatch(sm().state[stateKey] as T);
    sm().attach(stateKey, this.setState);
  }

  detach(stateKey: keyof StatePublic) {
    this.dispatch = null;
    sm().detach(stateKey, this.setState);
  }
}
class SelectorTextsSelected extends SelectorTexts<
  StatePublic["textsSelected"]
> {
  attach(dispatch: (newState: StatePublic["textsSelected"]) => void) {
    super.attach(dispatch, "textsSelected");
  }

  detach() {
    super.detach("textsSelected");
  }
}

class SelectorTextsAvailable extends SelectorTexts<
  StatePublic["textsAvailable"]
> {
  attach(dispatch: (newState: StatePublic["textsAvailable"]) => void) {
    super.attach(dispatch, "textsAvailable");
  }

  detach() {
    super.detach("textsAvailable");
  }
}

const selectorTextsAvailable = new SelectorTextsAvailable(),
  selectorTextsSelected = new SelectorTextsSelected();

const HomePage = () => {
  const [remove, setRemove] = React.useState<Action[]>([]);
  const [add, setAdd] = React.useState<Action[]>([]);
  React.useEffect(() => {
    setRemove([
      { type: "link", href: "/contest/", name: "Start contest", slug: "id" },
      removeFromSelected,
    ]);
    setAdd([
      { type: "link", href: "/contest/", name: "Start contest", slug: "id" },
      addToSelected,
    ]);
  }, []);
  return (
    <div className={styles.box}>
      <div className={styles.item}>
        <div className={styles.name}>Selected</div>
        <ListTexts
          className={styles.list}
          selector={selectorTextsSelected}
          actions={remove}
        />
      </div>
      <div className={styles.item}>
        <div className={styles.name}>Available</div>
        <ListTexts
          className={styles.list}
          selector={selectorTextsAvailable}
          actions={add}
        />
      </div>
    </div>
  );
};
export default HomePage;
