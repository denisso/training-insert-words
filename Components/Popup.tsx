import React from "react";
import styles from "./Popup.module.css";
import classNames from "classnames";
import ReactDOM from "react-dom";

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

const animations = new Set<Animation>();

type PopupProps = {
  className: string;
  text: string;
  type: "error" | "info";
};

const Popup = ({ className, text, type }: PopupProps) => {
  const popupRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {}, []);
  return (
    <div className={classNames(className, styles[type])} ref={popupRef}>
      {text}
      <div className="line-box">
        <div className="line"></div>
      </div>
    </div>
  );
};

const PoolPopups = () => {
  const [modals, setModals] = React.useState<HTMLDivElement[]>([]);
  const [props, setProps] = React.useState<PopupProps[]>([]);
  const verticalAlignPopups = () => {
    const tY: number[] = [0];

    requestAnimationFrame(() => {
      for (
        let indx = modals.length - 2,
          prevHeight = modals[indx].getBoundingClientRect().height;
        indx >= 0;
        indx--
      ) {
        tY[indx] = -(Math.abs(tY[indx + 1]) + prevHeight + verticalGap);
        prevHeight = modals[indx].getBoundingClientRect().height;
      }

      // Second rAF: for paint и composite
      requestAnimationFrame(() => {
        for (let indx = modals.length - 2; indx >= 0; indx--) {
          modals[indx].style.transform = `translate(0, ${tY[indx]}px)`;
        }
      });
    });
  };

  return ReactDOM.createPortal(
    <>
      {modals.map((_, i) => (
        <Popup
          className={props[i].className}
          text={props[i].text}
          type={props[i].type}
        />
      ))}
    </>,
    document.body
  );
};
export default PoolPopups;
export const appendPopup = () => {};
