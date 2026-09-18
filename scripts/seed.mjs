import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of required) {
  if (process.env[key] === undefined) {
    throw new Error(`Environment variable ${key} belum diset. Buat file .env dari .env.example.`);
  }
}

const seedPath = path.resolve(process.cwd(), 'db', 'seed.sql');
const sql = await fs.readFile(seedPath, 'utf8');

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
});

try {
  await connection.query(sql);
  console.log(`[db:seed] Database ${process.env.DB_NAME} siap digunakan.`);
} finally {
  await connection.end();
}
