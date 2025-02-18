import React from "react";
import styles from "./Popup.module.css";
import classNames from "classnames";
import ReactDOM from "react-dom";
import sm, { StatePublic } from "@/StateManager";

const duration = 5000;
const verticalGap = 16;
const moveRight = [
  [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
  {
    id: "moveRight",
    duration,
    easing: "linear",
    fill: "forwards",
  },
];

type PopupProps = {
  className: string;
  text: string;
  type: "error" | "info";
};

const Popup = ({ className, text, type }: PopupProps) => {
  const popupRef = React.useRef<HTMLDivElement>(null),
    lineRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!lineRef.current || !popupRef.current) return;
    const item = sm().state.popups.find((e) => e.popup === null);
    if (!item) return;
    item.popup = popupRef.current;
    item.animation = lineRef.current.animate(
      moveRight[0],
      moveRight[1] as KeyframeAnimationOptions
    );

    verticalAlignPopups();

  }, []);
  return (
    <div className={classNames(className, styles[type])} ref={popupRef}>
      {text}
      <div className="line-box">
        <div className="line" ref={lineRef}></div>
      </div>
    </div>
  );
};

export type PopupItem = {
  popup?: HTMLDivElement | null;
  animation?: Animation | null;
} & PopupProps;

function verticalAlignPopups() {
  const tY: number[] = [0];

  requestAnimationFrame(() => {
    const popups = sm().state.popups;
    let popup = popups[popups.length - 2].popup;
    if (!popup || popups[popups.length - 1].popup === null) return;
    for (
      let indx = popups.length - 2,
        prevHeight = popup.getBoundingClientRect().height;
      indx >= 0;
      indx--
    ) {
      tY[indx] = -(Math.abs(tY[indx + 1]) + prevHeight + verticalGap);
      popup = sm().state.popups[indx].popup;
      if (!popup) continue;
      prevHeight = popup.getBoundingClientRect().height;
    }

    // Second rAF: for paint и composite
    requestAnimationFrame(() => {
      for (let indx = sm().state.popups.length - 2; indx >= 0; indx--) {
        popup = sm().state.popups[indx].popup;
        if (!popup) continue;
        popup.style.transform = `translate(0, ${tY[indx]}px)`;
      }
    });
  });
}

const PoolPopups = () => {
  const [pops, setPops] = React.useState<PopupItem[]>([]);

  React.useEffect(() => {
    const handlePopups = (pops: StatePublic["popups"]) => {
      setPops(pops);
    };
    sm().attach("popups", handlePopups);

    return () => sm().detach("popups", handlePopups);
  }, []);

  return ReactDOM.createPortal(
    <>
      {pops.map((_, i) => (
        <Popup
          className={pops[i].className}
          text={pops[i].text}
          type={pops[i].type}
        />
      ))}
    </>,
    document.body
  );
};
export default PoolPopups;
export const appendPopup = ({ className, text, type }: PopupProps) => {
  sm().state.popups = [...sm().state.popups, { className, text, type }];
};
