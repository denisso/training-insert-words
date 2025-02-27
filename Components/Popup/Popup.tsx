"use client";
import React from "react";
import classNames from "classnames";
import sm from "@/StateManager";
import styles from "./Popup.module.scss";

const duration = 5000;

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
    lineRef = React.useRef<HTMLDivElement>(null),
    btnCloseRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!lineRef.current || !popupRef.current) return;

    const popup = popupRef.current;
    if (!item) return;
    item.popup = popup;
    let finished = false;
    function toggleStateAnimations(isPlay: boolean) {
      if (finished) return;
      sm().state.popups.forEach(({ animation }) => {
        if (animation && animation.playState != "finished")
          if (isPlay) animation.play();
          else animation.pause();
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
    const handlerClose = () => {
      toggleStateAnimations(true);
      finished = true;
      animationLineEndHandler();
    };

    if (btnCloseRef.current)
      btnCloseRef.current.addEventListener("click", handlerClose);
    // avoid doble unmounting in dev mode
    let unmounted = false;

    const transitionendHandler = () => finished && cleanAndAlign();
    const cleanAndAlign = () => {
      popup.removeEventListener("mouseenter", mouseenterListener);
      popup.removeEventListener("mouseleave", mouseleaveListener);
      popup.removeEventListener("transitionend", transitionendHandler);

      if (btnCloseRef.current)
        btnCloseRef.current.removeEventListener("click", handlerClose);

      if (unmounted) return;
      if (item.animation) {
        if (item.animation.playState != "finished") item.animation.cancel();
        item.animation.removeEventListener("finish", animationLineEndHandler);
      }

      item.animation = null;
      item.popup = null;
      unmounted = true;
      sm().state.popups = sm().state.popups.filter((e) => e !== item);
    };

    requestAnimationFrame(() => {
      if (unmounted) return;
      popup.addEventListener("transitionend", transitionendHandler);
      popup.style.transform = `translateX(0)`;
    });
    return () => {
      unmounted = true;
      cleanAndAlign();
    };
  }, [item]);
  return (
    <div className={classNames(styles.popup, styles[item.type])} ref={popupRef}>
      <div className={styles.box}>
        <button className={styles.close} ref={btnCloseRef}>
          Close
        </button>
        <div className={styles.content}>{item.text}</div>
        <div className={styles["line-box"]}>
          <div className={styles["line"]} ref={lineRef}></div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
