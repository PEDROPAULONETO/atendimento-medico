const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');

// POST /api/auth/register (RF01)
router.post('/register', async (req, res) => {
  try {
    const novoUsuario = await Usuario.criar(req.body);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: novoUsuario,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O e-mail ou CPF informado já está cadastrado no sistema.',
      });
    }
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message,
    });
  }
});

module.exports = router;