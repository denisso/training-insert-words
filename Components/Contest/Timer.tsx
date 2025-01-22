import React from "react";
import contest, { StateContest } from "@/utils/contest";

const Timer = () => {
  const [sec, setSec] = React.useState(0);
  React.useEffect(() => {
    const getSec = (sec: StateContest["timerSec"]) => {
      setSec(sec);
    };
    contest().sm.attach("timerSec", getSec);
    return () => {
      contest().sm.attach("timerSec", getSec);
    };
  }, []);
  return <>{sec} sec</>;
};

export default Timer;
