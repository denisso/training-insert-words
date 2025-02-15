import sm, { StateManager } from "@/StateManager";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";
import { updtaeTextById } from "@/db";

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
});

export default smd;

const textChanged = (reason: SMDState["textChangeReason"], id: string = "") => {
  smd().state.textChangeReason = reason;
  smd().state.textID = id;
  smd().state.textChanged = false;
  smd().state.textUpdateTick = !smd().state.textUpdateTick;
};

export const textChange = (
  reason: SMDState["textChangeReason"],
  id: string = ""
) => {
  smd().state.textChangeReason = reason;
  if (reason == "new" || reason == "push") {
    // check changes in editor
    if (smd().state.textChanged) {
      return (sm().state.modal = {
        title: "Attention",
        text: "save changes?",
        onOk: () => {
          if (reason == "new") smd().state.textID = "";
          const getText = smd().state.getText;
          if (getText !== null) updtaeTextById(smd().state.textID, getText());
          textChanged(reason, id);
        },
        onCancel: () => textChanged(reason, id),
      });
    }
  }
  if (id) smd().state.textID = id;
  if (reason == "input") smd().state.textChanged = true;
  else smd().state.textChanged = false;
  smd().state.textUpdateTick = !smd().state.textUpdateTick;
};
