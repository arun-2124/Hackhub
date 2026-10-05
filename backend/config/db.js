const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'hackhub_user',
  password: process.env.DB_PASSWORD || 'hackhub_pass123',
  database: process.env.DB_NAME || 'hackhub_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL (${process.env.DB_NAME}) on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();
  } catch (error) {
    console.error('[Database] Failed to connect to MySQL:', error.message);
  }
})();

module.exports = pool;
