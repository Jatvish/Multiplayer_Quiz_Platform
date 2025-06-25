
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    return false;
  }
}

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');

    // If no tables exist, create them
    if (tables.length === 0) {
      console.log('Initializing database tables...');

      // Read SQL schema file and execute
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, '../database/schema.sql');

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(statement => statement.trim());

        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement + ';');
          }
        }

        console.log('Database tables created successfully');
      } else {
        console.error('Schema file not found');
      }
    }

    connection.release();
    return true;
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
