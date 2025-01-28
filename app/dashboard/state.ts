import { StateManager } from "@/StateManager";

export type State = {
  error: string;
};

class SMDashboard extends StateManager<State> {
  public state: State;
  constructor(state: State) {
    super(state);
    this.state = this._buildRoot() as State;
  }
}

let inst: SMDashboard | undefined;

function getInstance(): SMDashboard {
  if (!inst) {
    if (typeof window === "undefined") {
      throw new Error("StateManagerPublic is not available on the server.");
    }
    inst = new SMDashboard({
      error: "",
    });
  }
  return inst;
}

export default getInstance;
