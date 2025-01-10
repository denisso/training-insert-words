"use server";
import sqlite3 from "sqlite3";

export type TEXT = {
  id: number;
  name: string;
  text: string;
  length: number;
};

const db = new sqlite3.Database("./db/db.sqlite");

async function queryAll(query: ReturnType<typeof db.prepare>, ...args: string[]) {
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

const selectTextsByName = db.prepare("SELECT * FROM text WHERE name LIKE ?");

export async function getTextsByName(name: string): Promise<TEXT[]> {
  return queryAll(selectTextsByName, name) as Promise<TEXT[]>
}

const selectTextByID = db.prepare("SELECT * FROM text WHERE id = ?");

export async function getTextByID(id: string): Promise<TEXT> {
  return queryAll(selectTextByID, id) as Promise<TEXT>
}

const selectAllTextShort = db.prepare("SELECT id, name, length FROM text");

export async function getAllTexts(): Promise<TEXT[]> {
  return queryAll(selectAllTextShort) as Promise<TEXT[]>
}
