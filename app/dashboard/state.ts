import { StateManager } from "@/StateManager";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";

export type SMDState = {
  textID: string;
};

class SMDashboard extends StateManager<SMDState> {
  public state: SMDState;
  constructor(state: SMDState) {
    super(state);
    this.state = this._buildRoot() as SMDState;
  }
}

export default clientSingletonBuilder(SMDashboard, {
  textID: "",
});
