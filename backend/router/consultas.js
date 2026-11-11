const express = require('express');
const router = express.Router();
const Consulta = require('../models/consulta');

// POST /api/consultas - Criar consulta (RF02)
router.post('/', async (req, res) => {
  try {
    const novaConsulta = await Consulta.criar(req.body);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Consulta agendada com sucesso!',
      consulta: novaConsulta,
    });
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message,
    });
  }
});

// GET /api/consultas - Listar consultas com JOIN (RF03)
router.get('/', async (req, res) => {
  try {
    const consultas = await Consulta.listarTodas();
    return res.status(200).json({
      sucesso: true,
      consultas,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao listar consultas.',
    });
  }
});

// GET /api/consultas/:id - Buscar consulta específica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await Consulta.buscarPorId(id);

    if (!consulta) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Consulta não encontrada.',
      });
    }

    return res.status(200).json({
      sucesso: true,
      consulta,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao buscar consulta.',
      erro: error.message,
    });
  }
});

// PATCH /api/consultas/:id - Alterar situação / observações (RF04)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const atualizado = await Consulta.atualizar(id, req.body);

    if (!atualizado) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Consulta não encontrada.',
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Consulta atualizada com sucesso!',
    });
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message,
    });
  }
});

module.exports = router;