"use server";
import { QueryResult, Client } from "pg";

export type TextFieldsDB = {
  id: string;
  name: string;
  length: string;
  text: string;
};

export type TextInfo = Omit<TextFieldsDB, "text"> & {
  group: string[];
};

export type TextContent = Pick<TextFieldsDB, "text">;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

type ResponseData = Promise<{
  data: TextFieldsDB;
}>;

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
  let error;
  if (isPGError(err)) error = { error: err.code };
  else error = { error: true };
  console.error("Error in", queryName, err);
  return error;
};

const queryAll = async (
  query: string,
  params: string[] = [],
  queryName: string
) =>
  new Promise((resolve, reject) => {
    client.query(query, params).then(
      (results) => {
        console.log(results);
        resolve({ data: results.rows });
      },
      (err) => reject(handleError(err, queryName))
    );
  });

const queryOne = async (
  query: string,
  params: string[] = [],
  queryName: string
) =>
  new Promise((resolve, reject) => {
    client.query(query, params).then(
      (result) => resolve({ data: result.rows[0] ? result.rows[0] : [] }),
      (err) => reject(handleError(err, queryName))
    );
  });

const selectTextByID = "SELECT text FROM text WHERE id = $1";

export const getDbTextByID = async (id: string): ResponseData =>
  new Promise((resolve) => {
    (queryOne(selectTextByID, [id], "getDbTextByID") as ResponseData).then(
      resolve,
      resolve
    );
  });

const selectAllTexts = `
  SELECT t1.id, t1.name, t1.length, STRING_AGG(t2.id_category::text, ',') AS "group"
  FROM text t1
  LEFT JOIN text_category t2 ON t1.id = t2.id_text
  GROUP BY t1.id
`;

type TextShortDB = Omit<TextFieldsDB, "text"> & {
  group: string;
};

export const getDbAllTexts = async (): Promise<{ data: TextShortDB[] }> =>
  new Promise((resolve) => {
    (
      queryAll(selectAllTexts, [], "getDbAllTexts") as Promise<{
        data: TextShortDB[];
      }>
    ).then(resolve, resolve);
  });

const updateQueryText = `
  UPDATE "text"
  SET "name" = $2,
    "text" = $3
  WHERE "id" = $1
  RETURNING *;
`;

export const updateDBTextById = async (
  id: string,
  name: string,
  text: string
): ResponseData =>
  new Promise((resolve) => {
    (
      queryOne(
        updateQueryText,
        [id, name, text],
        "updateDBTextById"
      ) as ResponseData
    ).then(resolve, resolve);
  });

export const updateDBTextByIdBoolean = async (
  id: string,
  name: string,
  text: string
) =>
  new Promise((resolve) =>
    updateDBTextById(id, name, text).then((result) =>
      result.data ? resolve(true) : resolve(result)
    )
  );

const queryInsert = `
INSERT INTO text (name, text)
VALUES ($1, $2)
RETURNING *;
`;

export const insertDbText = async (name: string, text: string) => {
  return (
    await (queryOne(queryInsert, [name, text], "insertDbText") as ResponseData)
  ).data.text;
};

const queryDelete = `
DELETE FROM "text" 
WHERE "id" = $1 
RETURNING *;
`;

export async function deleteTextById(id: string) {
  return queryOne(queryDelete, [id], "deleteTextById");
}
