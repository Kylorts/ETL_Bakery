const mysql = require('mysql2/promise');

//i am using laragon
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
});

const dw = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
});

module.exports = { db, dw };