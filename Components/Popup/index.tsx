"use client";
import React from "react";
import ReactDOM from "react-dom";
import Popup, { PopupItem } from "./Popup";
import sm, { StatePublic } from "@/StateManager";

const verticalGap = 16;

function verticalAlignPopups() {
  if (sm().state.popups.length < 2) return;
  requestAnimationFrame(() => {
    const popups = sm().state.popups;
    popups[popups.length - 1].tY = 0;

    let popup = popups[popups.length - 2].popup;
    if (!popup) return;
    for (
      let indx = popups.length - 2,
        prevHeight = popup.getBoundingClientRect().height;
      indx >= 0;
      indx--
    ) {
      popups[indx].tY = -(
        Math.abs(popups[indx + 1].tY) +
        prevHeight +
        verticalGap
      );
      popup = sm().state.popups[indx].popup;
      if (!popup) continue;
      prevHeight = popup.getBoundingClientRect().height;
    }

    // for paint и composite
    for (let indx = sm().state.popups.length - 1; indx >= 0; indx--) {
      popup = sm().state.popups[indx].popup;
      const animation = sm().state.popups[indx].animation;
      // easy crunch workaround =)
      if (!popup || (animation && animation.playState == "finished")) continue;
      popup.style.transform = `translate(0, ${popups[indx].tY}px)`;
    }
  });
}

const PoolPopups = () => {
  const [pops, setPops] = React.useState<PopupItem[]>([]);
  const [mount, setMount] = React.useState(false);

  React.useEffect(() => {
    setMount(true);
    const handlePopups = (pops: StatePublic["popups"]) => {
      setPops(pops);
      requestAnimationFrame(() => {
        verticalAlignPopups();
      });
    };
    sm().attach("popups", handlePopups);
    return () => sm().detach("popups", handlePopups);
  }, []);
  if (!mount) return null;
  else
    return ReactDOM.createPortal(
      <>
        {pops.map((item, i) => (
          <Popup item={item} key={pops[i].id} />
        ))}
      </>,
      document.body
    );
};
export default PoolPopups;
export const showPopup = (text: string, type: PopupItem["type"]) => {
  sm().state.popups = [
    ...sm().state.popups,
    { text, type, tY: 0, id: performance.now() + "" },
  ];
};
