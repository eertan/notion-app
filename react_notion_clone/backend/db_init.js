const { query, pool } = require('./db'); // Assuming db.js exports pool for direct use if needed

const createTables = async () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const createNotesTableQuery = `
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const createTasksTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date DATE, 
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Index for faster lookups on user_id in notes and tasks
  const createNotesUserIdIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  `;
  const createTasksUserIdIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  `;
   // Index for faster lookups on username
  const createUsersUsernameIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `;


  try {
    console.log('Attempting to connect to the database to initialize tables...');
    // Test connection by trying to get a client
    const client = await pool.connect();
    console.log('Successfully connected to the database.');
    
    console.log('Creating users table...');
    await client.query(createUserTableQuery);
    console.log('Users table created or already exists.');

    console.log('Creating notes table...');
    await client.query(createNotesTableQuery);
    console.log('Notes table created or already exists.');

    console.log('Creating tasks table...');
    await client.query(createTasksTableQuery);
    console.log('Tasks table created or already exists.');
    
    console.log('Creating index on notes.user_id...');
    await client.query(createNotesUserIdIndexQuery);
    console.log('Index on notes.user_id created or already exists.');

    console.log('Creating index on tasks.user_id...');
    await client.query(createTasksUserIdIndexQuery);
    console.log('Index on tasks.user_id created or already exists.');

    console.log('Creating index on users.username...');
    await client.query(createUsersUsernameIndexQuery);
    console.log('Index on users.username created or already exists.');

    client.release();
    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error during database initialization:', err.stack);
    // If running this script directly, exit with an error code
    if (require.main === module) {
      process.exit(1);
    } else {
      throw err; // Re-throw if called as a module
    }
  }
};

// If the script is run directly (node db_init.js), execute createTables
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Successfully executed db_init.js');
      pool.end(); // Close the pool if script is run directly
    })
    .catch((err) => {
      console.error('Failed to execute db_init.js:', err);
      pool.end(); // Close the pool on error
    });
}

module.exports = createTables; // Export for potential use in server startup
