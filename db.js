// db.js - Database connection
const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'grocery_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export promise-based connection
module.exports = pool.promise();