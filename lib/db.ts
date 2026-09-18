import mysql, {
  type ResultSetHeader,
  type RowDataPacket,
  type FieldPacket,
  type QueryResult,
  type QueryOptions,
} from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3400),
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "rahasia123",
  database: process.env.DB_NAME || "ctf-platform",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export type DBRow = RowDataPacket;

export { pool };

type DBValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Buffer
  | Uint8Array;

export async function query<
  T extends RowDataPacket[] = RowDataPacket[]
>(sql: string, params: DBValue[] = []): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

export async function unsafeQuery<
  T extends RowDataPacket[] = RowDataPacket[]
>(sql: string): Promise<T> {
  const [rows] = await pool.query<T>(sql);
  return rows;
}

export async function execute(
  sql: string,
  params: DBValue[] = []
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

export const labMode = process.env.LAB_MODE !== "false";
