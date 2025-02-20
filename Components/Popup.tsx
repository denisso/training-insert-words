"use client";
import React from "react";
import styles from "./Popup.module.css";
import classNames from "classnames";
import ReactDOM from "react-dom";
import sm, { StatePublic } from "@/StateManager";

const duration = 1005000;
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

export type PopupItem = {
  popup?: HTMLDivElement | null;
  animation?: Animation | null;
  tY: number;
  text: string;
  type: "error" | "info";
  id: string;
};

type PopupProps = {
  item: PopupItem;
};

const Popup = ({ item }: PopupProps) => {
  const popupRef = React.useRef<HTMLDivElement>(null),
    lineRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!lineRef.current || !popupRef.current) return;
    let popup = popupRef.current;
    if (!item) return;
    item.popup = popup;
    let finished = false;
    function toggleStateAnimations(newState: boolean) {
      if (finished) return;
      sm().state.popups.forEach(({ animation }) => {
        if (!animation) return;
        if (animation.playState == "finished") return;
        newState ? animation.play() : animation.pause();
      });
    }

    const mouseenterListener = () => toggleStateAnimations(false),
      mouseleaveListener = () => toggleStateAnimations(true);

    popup.addEventListener("mouseenter", mouseenterListener);
    popup.addEventListener("mouseleave", mouseleaveListener);
    if (!item.animation) {
      item.animation = lineRef.current.animate(
        moveRight[0],
        moveRight[1] as KeyframeAnimationOptions
      );
    }

    const animationLineEndHandler = () => {
      finished = true;
      popup.style.transform = `translate(100%, ${item.tY}px)`;
    };
    item.animation.addEventListener("finish", animationLineEndHandler);
    const clickHandler = () => {
      toggleStateAnimations(true);
      finished = true;
      animationLineEndHandler();
    };
    const buttonClose = popup.querySelector("." + styles.close);
    if (buttonClose) buttonClose.addEventListener("click", clickHandler);
    // avoid doble unmounting in dev mode 
    let unmounted = false;

    const transitionendHandler = () => finished && cleanAndAlign();
    const cleanAndAlign = () => {
      popup.removeEventListener("mouseenter", mouseenterListener);
      popup.removeEventListener("mouseleave", mouseleaveListener);
      popup.removeEventListener("transitionend", transitionendHandler);

      if (buttonClose) buttonClose.removeEventListener("click", clickHandler);

      if (unmounted) return;
      if (item.animation) {
        if (item.animation.playState != "finished") item.animation.cancel();
        item.animation.removeEventListener("finish", animationLineEndHandler);
      }

      item.animation = null;
      item.popup = null;
      unmounted = true;
      sm().state.popups = sm().state.popups.filter((e) => e !== item);
      verticalAlignPopups();
    };

    requestAnimationFrame(() => {
      if (unmounted) return;
      popup.addEventListener("transitionend", transitionendHandler);
      popup.style.transform = `translateX(0)`;
      verticalAlignPopups();
    });
    return () => {
      unmounted = true;
      cleanAndAlign();
    };
  }, [item]);
  return (
    <div className={classNames(styles.popup, styles[item.type])} ref={popupRef}>
      <div className={styles.content}>{item.text}</div>

      <div className={styles["line-box"]}>
        <div className={styles["line"]} ref={lineRef}></div>
      </div>
      <button className={styles.close}>Close</button>
    </div>
  );
};

function verticalAlignPopups() {
  if (sm().state.popups.length < 2) return;
  requestAnimationFrame(() => {
    const popups = sm().state.popups;
    if (!popups[popups.length - 2] || !popups[popups.length - 1]) return;
    let popup = popups[popups.length - 2].popup;
    if (!popup || popups[popups.length - 1].popup === null) return;
    for (
      let indx = popups.length - 2,
        prevHeight = popup.getBoundingClientRect().height;
      indx >= 0;
      indx--
    ) {
      popups[indx].tY = -(Math.abs(popups[indx + 1].tY) + prevHeight + verticalGap);
      popup = sm().state.popups[indx].popup;
      if (!popup) continue;
      prevHeight = popup.getBoundingClientRect().height;
    }

    // Second rAF: for paint и composite
    requestAnimationFrame(() => {
      for (let indx = sm().state.popups.length - 2; indx >= 0; indx--) {
        popup = sm().state.popups[indx].popup;
        if (!popup) continue;
        popup.style.transform = `translate(0, ${popups[indx].tY}px)`;
      }
    });
  });
}

const PoolPopups = () => {
  const [pops, setPops] = React.useState<PopupItem[]>([]);
  const [mount, setMount] = React.useState(false);

  React.useEffect(() => {
    setMount(true);
    const handlePopups = (pops: StatePublic["popups"]) => {
      setPops(pops);
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
export const appendPopup = (text: string, type: PopupItem["type"]) => {
  sm().state.popups = [
    ...sm().state.popups,
    { text, type, tY: 0, id: performance.now() + "" },
  ];
};
