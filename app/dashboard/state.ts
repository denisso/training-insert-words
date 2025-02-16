import sm, { StateManager } from "@/StateManager";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";
import { updateDBTextByIdBoolean } from "@/db";

export type SMDState = {
  textID: string;
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
  textChangeReason: "new",
  textUpdateTick: false,
  textChanged: false,
  getText: null,
  getName: null,
  awaitSave: false,
});

export default smd;

const changeStateText = (reason: SMDState["textChangeReason"], id: string) => {
  smd().state.textChangeReason = reason;
  // for reason "input" textID = no change
  if (reason == "new") smd().state.textID = "";
  else if (reason == "push" || reason == "save") smd().state.textID = id;
  if (smd().state.textID === "" || reason == "input")
    smd().state.textChanged = true;
  else smd().state.textChanged = false;
  smd().state.textUpdateTick = !smd().state.textUpdateTick;
};

export const saveTextToDB = (done: () => void) => {
  const getText = smd().state.getText,
    getName = smd().state.getName;
  if (getText && getName)
    updateDBTextByIdBoolean(smd().state.textID, getName(), getText())
      .then(() => {
        // handle new or existing text
      })
      .catch((e) => console.log(e))
      .finally(done);
};

const openModal = (reason: SMDState["textChangeReason"], id: string) => {
  sm().state.modal = {
    title: "Attention",
    text: "save changes?",
    onOk: (done) => {
      saveTextToDB(done);
    },
    onCancel: () => {
      changeStateText(reason, id);
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
