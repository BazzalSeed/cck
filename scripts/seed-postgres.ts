import Database from "better-sqlite3";
import { Pool } from "pg";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "cck.db");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL env var is required");
    process.exit(1);
  }

  // Read from SQLite
  const sqlite = new Database(DB_PATH, { readonly: true });
  const rows = sqlite.prepare("SELECT * FROM work_tickets").all() as {
    id: number;
    category: string;
    product_code: string;
    part_name: string;
    material: string;
    processes: string;
    process_count: number;
  }[];
  console.log(`Read ${rows.length} rows from SQLite`);
  sqlite.close();

  // Write to Postgres
  const pool = new Pool({ connectionString });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS work_tickets (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      product_code TEXT NOT NULL,
      part_name TEXT,
      material TEXT,
      processes TEXT,
      process_count INTEGER DEFAULT 0
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_wt_category ON work_tickets(category)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_wt_product_code ON work_tickets(product_code)`
  );

  // Clear existing data
  await pool.query("DELETE FROM work_tickets");

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values: unknown[] = [];
    const placeholders: string[] = [];

    batch.forEach((row, idx) => {
      const offset = idx * 6;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      );
      values.push(
        row.category,
        row.product_code,
        row.part_name,
        row.material,
        row.processes,
        row.process_count
      );
    });

    await pool.query(
      `INSERT INTO work_tickets (category, product_code, part_name, material, processes, process_count) VALUES ${placeholders.join(", ")}`,
      values
    );
    console.log(`Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }

  const countResult = await pool.query("SELECT COUNT(*) as cnt FROM work_tickets");
  console.log(`Done. Total rows in Postgres: ${countResult.rows[0].cnt}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
