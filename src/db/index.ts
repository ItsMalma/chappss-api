import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: Bun.env.DATABASE_URL,
});
const db = drizzle({ client: pool });

export default db;
