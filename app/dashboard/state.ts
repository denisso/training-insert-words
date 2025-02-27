"use client";
import sm, { StateManager } from "@/StateManager";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";
import { updateDBTextByIdBoolean, insertDbText } from "@/db";
import { showPopup } from "@/Components/Popup/";

export type SMDState = {
  textID: string;
  isTextEmpty: boolean;
  /**
   * push - load text from public state texts
   * new - new text textID=-1 clear text in textEditor
   * input - text changes in editor
   * save - save text to data base
   */
  textChangeReason: "new" | "push" | "input" | "save";
  // triggered each time when text changed
  textUpdateTick: boolean;
  // true - text in editor was changed
  textChanged: boolean;
  // assigned by in TextEditor Effect mount
  // uses in save changes button
  getText: (() => string) | null;
  getName: (() => string) | null;
  awaitSave: boolean;
};

class SMDashboard extends StateManager<SMDState> {
  public state: SMDState;
  constructor(state: SMDState) {
    super(state);
    this.state = this._buildRoot() as SMDState;
  }
}

const smd = clientSingletonBuilder(SMDashboard, {
  textID: "",
  isTextEmpty: true,
  textChangeReason: "new",
  textUpdateTick: false,
  textChanged: false,
  getText: null,
  getName: null,
  awaitSave: false,
});

export default smd;

const changeStateText = (reason: SMDState["textChangeReason"], id: string) => {
  // for reason "input" textID = no change
  if (reason == "new") smd().state.textID = "";
  else if (reason == "push" || reason == "save") smd().state.textID = id;
  if (smd().state.textID === "" || reason == "input")
    smd().state.textChanged = true;
  else smd().state.textChanged = false;
  smd().state.textChangeReason = reason;
  smd().state.textUpdateTick = !smd().state.textUpdateTick;
};

export const saveTextToDB = (done: () => void) => {
  const getText = smd().state.getText,
    getName = smd().state.getName;
  if (getText && getName) {
    if (!getName()) {
      showPopup("Text name is empty", "error");
      return;
    }
    if (smd().state.textID == "") {
      insertDbText(getName(), getText())
        .then((_) => {

          showPopup("New text saved succesful", "info");
        })
        .catch((_) =>
          showPopup(
            "Server error during function execution insertDbText",
            "error"
          )
        )
        .finally(done);
    } else {
      updateDBTextByIdBoolean(smd().state.textID, getName(), getText())
        .then(() => {
          showPopup("Saved succesful", "info");
          sm().state.texts[smd().state.textID].name = getName();
        })
        .catch((_) =>
          showPopup(
            "Server error during function execution updateDBTextByIdBoolean",
            "error"
          )
        )
        .finally(done);
    }
  } else {
    showPopup("Client Error getText or getName not be setted", "error");
  }
};

const openModal = (reason: SMDState["textChangeReason"], id: string) => {
  sm().state.modal = {
    title: "Attention",
    text: "save changes?",
    onOk: (done) => {
      saveTextToDB(done);
    },
    onCancel: (done) => {
      changeStateText(reason, id);
      done();
    },
  };
};

export const changeText = (
  reason: SMDState["textChangeReason"],
  id: string = ""
) => {
  if (reason == "new" || reason == "push") {
    if (smd().state.textChanged) {
      return openModal(reason, id);
    } else {
      changeStateText(reason, id);
    }
  } else {
    changeStateText(reason, id);
  }
};
