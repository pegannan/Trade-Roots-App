import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from './pool.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = await readFile(path.join(dir, 'schema.sql'), 'utf8');

try {
  await pool.query(sql);
  console.log('Database tables are ready.');
} catch (err) {
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
