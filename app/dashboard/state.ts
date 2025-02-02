import { StateManager } from "@/StateManager";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";

export type SMDState = {
  textID: string;
  textChangeReason: "init" | "push" | "input";
  textUpdateTick: boolean;
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
  textChangeReason: "init",
  textUpdateTick: false,
});

export default smd;

export const textUpdate = (
  reason: SMDState["textChangeReason"],
  id?: string
) => {
  smd().state.textChangeReason = reason;
  if (id !== undefined) smd().state.textID = id;

  smd().state.textUpdateTick = !smd().state.textUpdateTick;
};
