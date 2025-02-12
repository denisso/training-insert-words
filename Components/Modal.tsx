"use client";
import React from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import sm, { StatePublic } from "@/StateManager";

const Modal = () => {
  const [display, setDisplay] = React.useState<"none" | "flex">("none");
  const modalRef = React.useRef<StatePublic["modal"]>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [portalDom, setPortalDom] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalDom(document.body);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        sm().state.modal = null;
      }
    };

    document.addEventListener("keydown", handleEscape);
    const handleModal = (modal: StatePublic["modal"]) => {
      modalRef.current = modal;
      setDisplay(modal ? "flex" : "none");
    };
    sm().attach("modal", handleModal);
    return () => {
      sm().detach("modal", handleModal);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const onCancel = () => {
    const modal = sm().state.modal;
    if (modal?.onCancel) modal.onCancel();
    sm().state.modal = null;
  };
  const onOk = () => {
    const modal = sm().state.modal;
    if (modal?.onOk) modal?.onOk();
    sm().state.modal = null;
  };
  const onClickOverlay = (e: React.MouseEvent) => {
    if (e.target !== overlayRef.current) return;
    sm().state.modal = null;
  };
  return (
    portalDom !== null &&
    ReactDOM.createPortal(
      <div
        className={styles.overlay}
        onClick={onClickOverlay}
        style={{ display }}
        ref={overlayRef}
      >
        <div className={styles.modal}>
          <div className="title">{modalRef.current?.title}</div>

          <div className="bittons">
            <button onClick={onOk}>Ok</button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>,
      portalDom
    )
  );
};

export default Modal;
