const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const { execSync } = require('child_process');
const net = require('net');

function isPortOpen(host, port, timeoutMs = 400) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function getWslIp() {
  try {
    const wslIp = execSync('wsl.exe hostname -I', { encoding: 'utf8', timeout: 5000 }).trim().split(/\s+/)[0];
    if (wslIp && wslIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return wslIp;
    }
  } catch (_) {}
  return null;
}

// Synchronously determine reachable DB host (127.0.0.1 vs WSL IP)
function resolveDbHostSync() {
  const configured = process.env.DB_HOST || '127.0.0.1';
  if (configured !== '127.0.0.1' && configured !== 'localhost') {
    return configured;
  }
  // If running on Windows and WSL exists, query WSL IP
  const wslIp = getWslIp();
  if (wslIp) {
    return wslIp;
  }
  return configured;
}

const resolvedHost = resolveDbHostSync();

// Create MySQL Connection Pool
const pool = mysql.createPool({
  host: resolvedHost,
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
    console.log(`[Database] Successfully connected to MySQL (${process.env.DB_NAME}) on ${resolvedHost}:${process.env.DB_PORT || 3306}`);
    connection.release();
  } catch (error) {
    console.error('[Database] Failed to connect to MySQL:', error.message);
  }
})();

module.exports = pool;
