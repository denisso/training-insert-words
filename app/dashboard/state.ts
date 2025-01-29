import { StateManager } from "@/StateManager";
import clientSingletonBuilder from "@/utils/clientSingletonBuilder";

export type State = {
  textID: string;
};

class SMDashboard extends StateManager<State> {
  public state: State;
  constructor(state: State) {
    super(state);
    this.state = this._buildRoot() as State;
  }
}

export default clientSingletonBuilder(SMDashboard, {
  textID: "",
});
