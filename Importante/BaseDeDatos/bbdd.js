const mysql = require('mysql2/promise');

// Crear pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 50, // <-- Expandimos de 10 a 50 para alto tráfico concurrente
  queueLimit: 0
});

module.exports = pool;
