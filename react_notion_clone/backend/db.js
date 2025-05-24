const { Pool } = require('pg');
require('dotenv').config(); // To load .env file variables

const dbUser = process.env.DB_USER || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'notes_tasks_app';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbPort = process.env.DB_PORT || 5432;

// Log a warning if using default DB credentials (except for localhost default user/db)
if (
  (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) &&
  !(dbHost === 'localhost' && dbUser === 'postgres' && dbName === 'notes_tasks_app' && dbPassword === 'postgres') 
) {
  console.warn(
    'WARNING: One or more database environment variables (DB_USER, DB_PASSWORD, DB_NAME) are not set. ' +
    'Using default values. This is not recommended for production.'
  );
}


const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: parseInt(dbPort, 10), // Ensure port is an integer
  // ssl: { // SSL configuration might be needed for remote databases
  //   rejectUnauthorized: false, // Adjust as per your DB's SSL requirements
  // },
});

pool.on('connect', () => {
  console.log(`Connected to the database '${dbName}' on ${dbHost}:${dbPort} as user '${dbUser}'`);
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // process.exit(-1); // Optional: exit if cannot connect to DB
});

/**
 * Executes a SQL query using the connection pool.
 * @param {string} text - The SQL query text (e.g., "SELECT * FROM users WHERE id = $1").
 * @param {Array} [params] - An array of parameters to substitute into the query text.
 * @returns {Promise<object>} The query result object from the 'pg' library.
 * @throws {Error} If the query fails.
 */
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration: `${duration}ms`, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', { text, error: err.stack });
    throw err;
  }
};

module.exports = {
  query,
  pool, // Exporting pool directly can be useful for transactions or specific pg features
};
