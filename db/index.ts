"use server";
import sqlite3 from "sqlite3";

export type TEXTS = {
  id: number;
  name: string;
  text: string;
  length: number;
};

const db = new sqlite3.Database("./db.sqlite");

const selectQueryName = db.prepare(`SELECT * FROM text WHERE name LIKE ?`);

export async function getTextsByName(name: string) {
  return new Promise((resolve, reject) => {
    selectQueryName.all(name, (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
}
const selectQueryID = db.prepare(`SELECT * FROM text WHERE id = ?`);

export async function getTextByID(id: string) {
  return new Promise((resolve, reject) => {
    selectQueryID.all(id, (err, rows) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(rows);
      }
    });
  });
}
