const pool = require('../db');

class Consulta {
  static async criar(dados) {
    const { paciente_id, medico_id, data_hora, observacoes } = dados;

    if (!paciente_id || !medico_id || !data_hora) {
      throw new Error('Paciente, médico e data/hora são obrigatórios.');
    }

    const [resultado] = await pool.execute(
      `INSERT INTO consultas (paciente_id, medico_id, data_hora, observacoes) 
       VALUES (?, ?, ?, ?)`,
      [paciente_id, medico_id, data_hora, observacoes || null]
    );

    return { id: resultado.insertId, ...dados };
  }

  // Listar todas as consultas com JOIN (RF03)
  static async listarTodas() {
    const [consultas] = await pool.execute(
      `SELECT c.id, c.data_hora, c.status, c.observacoes, c.criado_em,
              p.id AS paciente_id, p.nome AS paciente_nome, p.cpf AS paciente_cpf,
              m.id AS medico_id, m.nome AS medico_nome, m.crm AS medico_crm, m.especialidade AS medico_especialidade
       FROM consultas c
       JOIN usuarios p ON c.paciente_id = p.id
       JOIN usuarios m ON c.medico_id = m.id
       ORDER BY c.data_hora DESC`
    );
    return consultas;
  }

  static async buscarPorId(id) {
    const [linhas] = await pool.execute(
      `SELECT c.id, c.data_hora, c.status, c.observacoes, c.criado_em,
              p.id AS paciente_id, p.nome AS paciente_nome, p.cpf AS paciente_cpf, p.telefone AS paciente_telefone,
              m.id AS medico_id, m.nome AS medico_nome, m.crm AS medico_crm, m.especialidade AS medico_especialidade
       FROM consultas c
       JOIN usuarios p ON c.paciente_id = p.id
       JOIN usuarios m ON c.medico_id = m.id
       WHERE c.id = ?`,
      [id]
    );
    return linhas[0] || null;
  }

  // Atualizar status ou observações (RF04)
  static async atualizar(id, dados) {
    const { status, observacoes } = dados;

    const [resultado] = await pool.execute(
      `UPDATE consultas 
       SET status = COALESCE(?, status), 
           observacoes = COALESCE(?, observacoes) 
       WHERE id = ?`,
      [status || null, observacoes || null, id]
    );

    return resultado.affectedRows > 0;
  }
}

module.exports = Consulta;