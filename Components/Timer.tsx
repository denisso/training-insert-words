import React from "react";
import sm, { StatePublic } from "@/StateManager";

const Timer = () => {
  const [sec, setSec] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(null);
  React.useEffect(() => {
    const getStage = (stage: StatePublic["stage"]) => {
      if (stage != "contest") {
        if (timer.current) {
          clearInterval(timer.current);
          setSec(0);
          timer.current = null;
        }
        return;
      }
      timer.current = setInterval(() => {
        setSec((prev) => prev + 1);
      }, 1000);
    };
    sm().attach("stage", getStage);
    return () => {
      sm().attach("stage", getStage);
    };
  }, []);
  return <>{sec} sec</>;
};

export default Timer;
