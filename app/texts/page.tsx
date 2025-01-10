"use client";
import React, { useTransition } from "react";
import { getAllTexts, TEXT } from "@/db";

const List = () => {
  const [texts, setTexts] = React.useState<TEXT[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchTexts = () => {
    startTransition(async () => {
      const data = await getAllTexts();
      setTexts(data);
    });
  };

  return (
    <div>
      <button onClick={fetchTexts} disabled={isPending}>
        {isPending ? "Loading..." : "Fetch Texts"}
      </button>
      <div>
        {texts.map((text) => (
          <div key={text.id}>{JSON.stringify(text)}</div>
        ))}
      </div>
    </div>
  );
};

const Texts = () => {
  return (
    <div>
      <List />
    </div>
  );
};

export default Texts;
