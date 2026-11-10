const pool = require('../db');

const Usuario = {
  async criar({ nome, email, senha, perfil, crm, especialidade, cpf, telefone }) {
    // Validações básicas (RN01)
    if (!nome || !email || !senha || !perfil) {
      throw new Error('Nome, e-mail, senha e perfil são obrigatórios.');
    }

    const emailFormatado = email.toLowerCase().trim();

    if (senha.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    const perfisValidos = ['medico', 'secretaria', 'paciente'];
    if (!perfisValidos.includes(perfil)) {
      throw new Error('Perfil inválido.');
    }

    const sql = `
      INSERT INTO usuarios (nome, email, senha, perfil, crm, especialidade, cpf, telefone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.execute(sql, [
      nome,
      emailFormatado,
      senha, // Na 1ª entrega entra plano (ou hash se preferir adiantar, mas o hash é cobrado na 2ª)
      perfil,
      crm || null,
      especialidade || null,
      cpf || null,
      telefone || null,
    ]);

    return { id: resultado.insertId, nome, email: emailFormatado, perfil };
  },

  async buscarPorEmail(email) {
    const [linhas] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return linhas[0];
  },

  async buscarPorId(id) {
    const [linhas] = await pool.execute(
      'SELECT id, nome, email, perfil, crm, especialidade, cpf, telefone FROM usuarios WHERE id = ?',
      [id]
    );
    return linhas[0];
  }
};

module.exports = Usuario;   