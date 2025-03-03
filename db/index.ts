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

interface PgError {
  code: string;
}

const isPGError = (err: unknown): err is PgError => {
  const error = err as PgError;
  return (
    typeof err === "object" && err !== null && typeof error.code === "string"
  );
};

const handleError = (err: unknown, queryName: string) => {
  if (isPGError(err)) {
    console.error("Error in", queryName, err);
    throw new Error(err.code);
  }
  console.error("Error in", queryName, err);
  throw new Error(`queryOne: error in ${queryName}`);
};

async function queryAll(
  query: string,
  params: string[] = [],
  queryName: string
) {
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    handleError(err, queryName);
  }
}

async function queryOne(
  query: string,
  params: string[] = [],
  queryName: string
) {
  try {
    const result = await client.query(query, params);
    return result.rows[0];
  } catch (err: unknown) {
    handleError(err, queryName);
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

export async function getDbAllTexts(): Promise<TextsDict> {
  try {
    const texts = (await queryAll(
      selectAllTexts,
      [],
      "getDbAllTexts"
    )) as TextShortDB[];
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

export async function getDbTextByID(id: string): Promise<TextContent> {
  return queryOne(
    selectTextByID,
    [id],
    "getDbTextByID"
  ) as Promise<TextContent>;
}

const updateQueryText = `
  UPDATE "text"
  SET "name" = $2,
    "text" = $3
  WHERE "id" = $1
  RETURNING *;
`;

export async function updateDBTextById(id: string, name: string, text: string) {
  return queryOne(
    updateQueryText,
    [id, name, text],
    "updateDBTextById"
  ) as Promise<TextContent>;
}

export async function updateDBTextByIdBoolean(
  id: string,
  name: string,
  text: string
) {
  return new Promise((resolve, reject) => {
    updateDBTextById(id, name, text).then((_) => resolve(true), reject);
  });
}

const queryInsert = `
INSERT INTO text (name, text)
VALUES ($1, $2)
RETURNING *;
`;

export async function insertDbText(name: string, text: string) {
  return (
    (await queryOne(queryInsert, [name, text], "insertDbText")) as Pick<
      TextsDict,
      "id"
    >
  ).id;
}

const queryDelete = `
DELETE FROM "text" 
WHERE "id" = $1 
RETURNING *;
`;

export async function deleteTextById(id: string) {
  return queryOne(queryDelete, [id], "deleteTextById");
}
