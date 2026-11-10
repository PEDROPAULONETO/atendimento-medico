const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const authRoutes = require('./router/auth');
const consultasRoutes = require('./router/consultas');
const usuariosRoutes = require('./router/usuarios');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do CORS (RNF03)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Montagem das rotas
app.use('/api/auth', authRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rota de teste padrão
app.get('/', (req, res) => {
  res.json({ status: 'API REST Atendimento Médico Rodando 🚀' });
});

// Teste de conexão com o banco e inicialização do servidor (RN03)
pool.query('SELECT 1')
  .then(() => {
    console.log('MySQL conectado com sucesso!');
    app.listen(PORT, () => {
      console.log(`API rodando na porta ${PORT} (http://localhost:${PORT})`);
    });
  })
  .catch((err) => {
    console.error('Erro crítico: Não foi possível conectar ao MySQL.', err.message);
    process.exit(1);
  });