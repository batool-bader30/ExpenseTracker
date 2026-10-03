const { Pool } = require('pg');
require('dotenv').config();

connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false

module.exports = pool;
