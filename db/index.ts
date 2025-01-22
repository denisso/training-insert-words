"use server";
import sqlite3 from "sqlite3";
import path from 'path';

type TextFieldsDB = {
  id: number;
  name: string;
  length: number;
  text: string;
};

export type TextInfo = Omit<TextFieldsDB, "text"> & {
  group: number[];
};

export type TextsDict = {
  [id: TextInfo["id"]]: Pick<TextInfo, "name" | "length" | "group">;
};
export type TextContent = Pick<TextFieldsDB, "text">;

const dbPath = path.join(process.cwd(), 'db', 'db.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database opened successfully');
  }
});

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
export async function getAllTexts(): Promise<TextsDict> {
  "use server";
  return new Promise((resolve, reject) => {
    (queryAll(selectAllTexts) as Promise<TextShortDB[]>)
      .then((texts) => {
        const dict: TextsDict = {};
        for (const text of texts) {
          dict[text.id] = {
            length: text.length,
            group: text.group === null ? [] : text.group.split(",").map(Number),
            name: text.name,
          };
        }
        resolve(dict);
      })
      .catch((e) => reject(e));
  });
}

async function queryOne(
  query: ReturnType<typeof db.prepare>,
  ...args: string[]
) {
  "use server";
  return new Promise((resolve, reject) => {
    query.get(args, (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
}


const selectTextByID = db.prepare("SELECT text FROM text WHERE id = ?");

export async function getTextByID(id: string): Promise<TextContent> {
  "use server";
  return queryOne(selectTextByID, id) as Promise<TextContent>;
}
