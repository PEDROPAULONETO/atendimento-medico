const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  connectionLimit: 10,
});

async function inicializarBancoAutomaticamente() {
  try {
    // 1. Executa o schema.sql para garantir tabelas
    const caminhoSchema = path.join(__dirname, '../banco/schema.sql');
    if (fs.existsSync(caminhoSchema)) {
      const sqlSchema = fs.readFileSync(caminhoSchema, 'utf8');
      await pool.query(sqlSchema);
    }

    // 2. Executa o dados.sql (usando INSERT IGNORE ou verificando se já existem para evitar erro de duplicidade de email/CPF)
    const caminhoDados = path.join(__dirname, '../banco/dados.sql');
    if (fs.existsSync(caminhoDados)) {
      let sqlDados = fs.readFileSync(caminhoDados, 'utf8');

      // Substitui INSERT por INSERT IGNORE para não quebrar se os usuários já estiverem cadastrados
      sqlDados = sqlDados.replace(/INSERT INTO/gi, 'INSERT IGNORE INTO');

      await pool.query(sqlDados);
      console.log('Banco de dados populado com os dados iniciais com sucesso!');
    }
  } catch (error) {
  }
}

inicializarBancoAutomaticamente();

module.exports = pool;