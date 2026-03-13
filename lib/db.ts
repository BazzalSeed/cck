import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface WorkTicket {
  id: number;
  category: string;
  product_code: string;
  part_name: string;
  material: string;
  processes: string;
  process_count: number;
}

export async function initDb(): Promise<void> {
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
}

export async function getCategories(): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT category FROM work_tickets ORDER BY category"
  );
  return rows.map((r: { category: string }) => r.category);
}

export async function getProductCodes(category: string): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT product_code FROM work_tickets WHERE category = $1 ORDER BY product_code",
    [category]
  );
  return rows.map((r: { product_code: string }) => r.product_code);
}

export async function getPartNames(
  category: string,
  productCode: string
): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT part_name FROM work_tickets WHERE category = $1 AND product_code = $2 ORDER BY part_name",
    [category, productCode]
  );
  return rows
    .map((r: { part_name: string }) => r.part_name)
    .filter(Boolean);
}

export async function getMaterials(
  category: string,
  productCode: string,
  partName: string
): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT material FROM work_tickets WHERE category = $1 AND product_code = $2 AND part_name = $3 ORDER BY material",
    [category, productCode, partName]
  );
  return rows
    .map((r: { material: string }) => r.material)
    .filter(Boolean);
}

export async function getTicket(
  category: string,
  productCode: string,
  partName: string,
  material: string
): Promise<WorkTicket | undefined> {
  const { rows } = await pool.query(
    "SELECT * FROM work_tickets WHERE category = $1 AND product_code = $2 AND part_name = $3 AND material = $4 LIMIT 1",
    [category, productCode, partName, material]
  );
  return rows[0] as WorkTicket | undefined;
}

// --- Admin functions ---

export async function getAllTickets(
  page: number,
  limit: number,
  search?: string,
  category?: string
): Promise<{ tickets: WorkTicket[]; total: number }> {
  let where = "WHERE 1=1";
  const params: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    where += ` AND (product_code LIKE $${paramIdx} OR part_name LIKE $${paramIdx + 1} OR material LIKE $${paramIdx + 2})`;
    const like = `%${search}%`;
    params.push(like, like, like);
    paramIdx += 3;
  }
  if (category) {
    where += ` AND category = $${paramIdx}`;
    params.push(category);
    paramIdx += 1;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) as cnt FROM work_tickets ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].cnt, 10);

  const offset = (page - 1) * limit;
  const dataResult = await pool.query(
    `SELECT * FROM work_tickets ${where} ORDER BY id ASC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  );

  return { tickets: dataResult.rows as WorkTicket[], total };
}

export async function getTicketById(
  id: number
): Promise<WorkTicket | undefined> {
  const { rows } = await pool.query(
    "SELECT * FROM work_tickets WHERE id = $1",
    [id]
  );
  return rows[0] as WorkTicket | undefined;
}

export async function createTicket(
  data: Omit<WorkTicket, "id">
): Promise<number> {
  const { rows } = await pool.query(
    "INSERT INTO work_tickets (category, product_code, part_name, material, processes, process_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [
      data.category,
      data.product_code,
      data.part_name,
      data.material,
      data.processes,
      data.process_count,
    ]
  );
  return rows[0].id;
}

export async function updateTicket(
  id: number,
  data: Omit<WorkTicket, "id">
): Promise<void> {
  await pool.query(
    "UPDATE work_tickets SET category=$1, product_code=$2, part_name=$3, material=$4, processes=$5, process_count=$6 WHERE id=$7",
    [
      data.category,
      data.product_code,
      data.part_name,
      data.material,
      data.processes,
      data.process_count,
      id,
    ]
  );
}

export async function deleteTicket(id: number): Promise<void> {
  await pool.query("DELETE FROM work_tickets WHERE id = $1", [id]);
}
