"use client";
import React from "react";
import ListTexts from "@/Components/ListTexts";
import { TextInfo } from "@/db";
import sm, { StatePublic } from "@/StateManager";
import styles from "./Homepage.module.css";

const addToSelectedCb = (id: number) => {
  sm().state.textsSelected = [id, ...sm().state.textsSelected].sort(
    (a, b) => a - b
  );
  sm().state.textsAvailable = sm().state.textsAvailable.filter(
    (idrem) => idrem !== id
  );
};

const removeFromSelectedCb = (id: number) => {
  sm().state.textsSelected = sm().state.textsSelected.filter(
    (idrem) => idrem !== id
  );
  sm().state.textsAvailable = [id, ...sm().state.textsAvailable].sort(
    (a, b) => a - b
  );
};

const addToSelected = { cb: addToSelectedCb, name: "Move to selected" };
const removeFromSelected = {
  cb: removeFromSelectedCb,
  name: "Remove from selected",
};

type ItemProps = {
  className?: string;
};

const TextsSelected = ({ className }: ItemProps) => {
  const [texts, setTexts] = React.useState<TextInfo["id"][]>([]);
  React.useEffect(() => {
    const handler = (texts: StatePublic["textsSelected"]) => {
      setTexts(texts);
    };
    sm().attach("textsSelected", handler);
    setTexts(sm().state.textsSelected);
    return () => {
      sm().detach("textsSelected", handler);
    };
  }, []);

  return (
    <ListTexts
      className={className}
      name={"selected"}
      texts={texts}
      action={removeFromSelected}
      link={{ href: "/contest/", name: "Start contest", slug: "id" }}
    />
  );
};

const TextsAvailable = ({ className }: ItemProps) => {
  const [texts, setTexts] = React.useState<TextInfo["id"][]>([]);
  React.useEffect(() => {
    const handler = (texts: StatePublic["textsAvailable"]) => {
      setTexts(texts);
    };

    sm().attach("textsAvailable", handler);
    setTexts(sm().state.textsAvailable);
    return () => {
      sm().detach("textsAvailable", handler);
    };
  }, []);

  return (
    <ListTexts
      className={className}
      name={"available"}
      texts={texts}
      action={addToSelected}
      link={{ href: "/contest/", name: "Start contest", slug: "id" }}
    />
  );
};

const HomePage = () => {
  return (
    <div className={styles.box}>
      <TextsAvailable className={styles.item} />
      <TextsSelected className={styles.item} />
    </div>
  );
};
export default HomePage;
