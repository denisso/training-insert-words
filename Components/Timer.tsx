import React from "react";
import sm, { StatePublic } from "@/StateManager";

const resetTimer = (
  timer: React.RefObject<ReturnType<typeof setTimeout> | null>
) => {
  if (timer.current === null) return;
  clearInterval(timer.current);
  timer.current = null;
};

const Timer = () => {
  const [sec, setSec] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(null);
  React.useEffect(() => {
    const getStage = (stage: StatePublic["stage"]) => {
      if (stage == "caseready") {
        setSec(0);
        sm().state.timerSec = 0;
        resetTimer(timer);
      }
      if (stage == "contest") {
        timer.current = setInterval(() => {
          setSec((prev) => {
            sm().state.timerSec = prev + 1;
            return prev + 1;
          });
        }, 1000);
      }
      if (stage == "contestfinish") {
        resetTimer(timer);
      }
    };
    sm().attach("stage", getStage);
    return () => {
      sm().attach("stage", getStage);
    };
  }, []);
  return <>{sec} sec</>;
};

export default Timer;
