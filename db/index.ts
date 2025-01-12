"use server";
import sqlite3 from "sqlite3";

type TextFieldsDB = {
  id: number;
  name: string;
  length: number;
  text: string;
};

export type TextInfo = Omit<TextFieldsDB, "text"> & {
  group: number[];
};

export type TextContent = Pick<TextFieldsDB, "text">;

const db = new sqlite3.Database("./db/db.sqlite");

async function queryAll(
  query: ReturnType<typeof db.prepare>,
  ...args: string[]
) {
  "use server";
  return new Promise((resolve, reject) => {
    query.all(args, (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
}

const selectAllTexts = db.prepare(`
  SELECT t1.id, t1.name, t1.length, GROUP_CONCAT(t2.id_category) AS "group"
  FROM text t1
  LEFT JOIN text_category t2 ON t1.id = t2.id_text
  GROUP BY t1.id
`);

type TextShortDB = Omit<TextFieldsDB, "text"> & {
  group: string;
};
export async function getAllTexts(): Promise<TextInfo[]> {
  "use server";
  return new Promise((resolve, reject) => {
    (queryAll(selectAllTexts) as Promise<TextShortDB[]>)
      .then((texts) => {
        resolve(
          texts.map((text) => {
            return {
              ...text,
              group: text.group ? text.group.split(",").map(Number) : [],
            };
          })
        );
      })
      .catch((e) => reject(e));
  });
}

const selectTextByID = db.prepare("SELECT * FROM text WHERE id = ?");

export async function getTextByID(id: string): Promise<TextContent> {
  "use server";
  return queryAll(selectTextByID, id) as Promise<TextContent>;
}
