"use server";
import { Client } from "pg";

export type TextFieldsDB = {
  id: string;
  name: string;
  length: string;
  text: string;
};

export type TextInfo = Omit<TextFieldsDB, "text"> & {
  group: string[];
};

export type TextsDict = {
  [id: TextInfo["id"]]: Pick<TextInfo, "name" | "length" | "group">;
};
export type TextContent = Pick<TextFieldsDB, "text">;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Error connecting to database", err));

async function queryAll(query: string, params: any[] = []) {
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Error executing query", err);
    throw err;
  }
}

async function queryOne(query: string, params: any[] = []) {
  try {
    const result = await client.query(query, params);
    return result.rows[0];
  } catch (err) {
    console.error("Error executing query", err);
    throw err;
  }
}

const selectAllTexts = `
  SELECT t1.id, t1.name, t1.length, STRING_AGG(t2.id_category::text, ',') AS "group"
  FROM text t1
  LEFT JOIN text_category t2 ON t1.id = t2.id_text
  GROUP BY t1.id
`;

type TextShortDB = Omit<TextFieldsDB, "text"> & {
  group: string;
};

export async function getAllTexts(): Promise<TextsDict> {
  try {
    const texts = (await queryAll(selectAllTexts)) as TextShortDB[];
    const dict: TextsDict = {};

    for (const text of texts) {
      dict[text.id] = {
        length: text.length,
        group: text.group === null ? [] : text.group.split(","),
        name: text.name,
      };
    }

    return dict;
  } catch (err) {
    console.error("Error fetching all texts", err);
    throw err;
  }
}

const selectTextByID = "SELECT text FROM text WHERE id = $1";

export async function getTextByID(id: string): Promise<TextContent> {
  try {
    const result = (await queryOne(selectTextByID, [id])) as TextContent;
    return result;
  } catch (err) {
    console.error("Error get text by ID", err);
    throw err;
  }
}

const updateQueryText = `
  UPDATE "text"
  SET "text" = $2
  WHERE "id" = $1
  RETURNING *;
`;

export async function updtaeTextById(id: string, text: string )  {
  try {
    const result = (await queryOne(updateQueryText, [id, text])) as TextContent;
    return result;
  } catch (err) {
    console.error("Error updtae text by ID", err);
    throw err;
  }
}

const queryInsert = `
INSERT INTO text (name, text)
VALUES ($1, $2)
RETURNING *;
`;

export async function insertText(name: string, text: string) {
  try{
    const result = (await queryOne(queryInsert, [name, text])) as TextContent;
    return result;
  }
  catch(err){
    console.error("Error insert text by ID", err);
    throw err;
  }
}