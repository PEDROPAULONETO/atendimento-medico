const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const [usuarios] = await pool.execute(
            'SELECT id, nome, email, perfil, especialidade, telefone, criado_em FROM usuarios'
        );
        return res.status(200).json({
            sucesso: true,
            usuarios,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar usuários.',
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Busca o usuário no banco
        const [linhas] = await pool.execute(
            'SELECT id, nome, email, perfil, especialidade, telefone, criado_em FROM usuarios WHERE id = ?',
            [id]
        );

        if (linhas.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            usuario: linhas[0]
        });

    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao buscar usuário.',
            erro: error.message
        });
    }
});

router.get('perfil/:perfil', async (req, res) => {
    try {
        const { perfil } = req.params;

        // Valida se o perfil informado é válido conforme o ENUM do banco
        const perfisValidos = ['medico', 'secretaria', 'paciente'];
        if (!perfisValidos.includes(perfil)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Perfil inválido. Use: medico, secretaria ou paciente.'
            });
        }

        // Seleciona os campos de forma segura (ocultando dados sensíveis)
        const [usuarios] = await pool.execute(
            'SELECT id, nome, email, perfil, especialidade, telefone, criado_em FROM usuarios WHERE perfil = ?',
            [perfil]
        );

        return res.status(200).json({
            sucesso: true,
            total: usuarios.length,
            usuarios
        });

    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao filtrar usuários por perfil.',
            erro: error.message
        });
    }
});

router.get('/medicos', async (req, res) => {
    try {
        const [medicos] = await pool.execute(
            'SELECT id, nome, email, crm, especialidade, criado_em FROM usuarios WHERE perfil = ?',
            ['medico']
        );
        return res.status(200).json({ sucesso: true, medicos });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar médicos.' });
    }
});

router.get('/pacientes', async (req, res) => {
    try {
        const [pacientes] = await pool.execute(
            'SELECT id, nome, email, cpf, telefone, criado_em FROM usuarios WHERE perfil = ?',
            ['paciente']
        );
        return res.status(200).json({ sucesso: true, pacientes });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar pacientes.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, perfil, crm, especialidade, cpf, telefone } = req.body;

        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios: nome, email, senha e perfil.'
            });
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Inserção utilizando query parametrizada (RNF02)
        const [resultado] = await pool.execute(
            `INSERT INTO usuarios (nome, email, senha, perfil, cpf, telefone, crm, especialidade) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nome,
                email,
                senhaHash,
                perfil,
                cpf || null,
                telefone || null,
                crm || null,
                especialidade || null
            ]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso!',
            usuarioId: resultado.insertId
        });

    } catch (error) {
        // Tratamento para e-mail ou CPF duplicado (RN01)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro: E-mail ou CPF já cadastrado no sistema.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao cadastrar usuário.',
            erro: error.message
        });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha, perfil, cpf, telefone, crm, especialidade } = req.body;

        // 1. Verifica se o usuário existe
        const [usuarioExiste] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (usuarioExiste.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        // 2. Prepara a nova senha caso tenha sido enviada
        let senhaHash = undefined;
        if (senha) {
            const saltRounds = 10;
            senhaHash = await bcrypt.hash(senha, saltRounds);
        }

        // 3. Atualiza os campos dinamicamente usando COALESCE (mantém o valor antigo se o campo não for enviado)
        await pool.execute(
            `UPDATE usuarios 
             SET nome = COALESCE(?, nome), 
                 email = COALESCE(?, email), 
                 senha = COALESCE(?, senha), 
                 perfil = COALESCE(?, perfil), 
                 cpf = COALESCE(?, cpf), 
                 telefone = COALESCE(?, telefone), 
                 crm = COALESCE(?, crm), 
                 especialidade = COALESCE(?, especialidade) 
             WHERE id = ?`,
            [
                nome || null,
                email || null,
                senhaHash || null,
                perfil || null,
                cpf || null,
                telefone || null,
                crm || null,
                especialidade || null,
                id
            ]
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso!'
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro: E-mail ou CPF já cadastrado por outro usuário.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar usuário.',
            erro: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Verifica se o usuário existe
        const [usuarioExiste] = await pool.execute('SELECT id, perfil FROM usuarios WHERE id = ?', [id]);
        if (usuarioExiste.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        const usuario = usuarioExiste[0];

        // 2. Opcional: Verifica se o usuário possui consultas associadas para evitar erro de FK
        let colunaVerificacao = usuario.perfil === 'medico' ? 'medico_id' : 'paciente_id';
        if (usuario.perfil === 'secretaria') colunaVerificacao = null; // Secretárias geralmente não têm FK direta em consultas

        if (colunaVerificacao) {
            const [consultasVinculadas] = await pool.execute(
                `SELECT id FROM consultas WHERE ${colunaVerificacao} = ? LIMIT 1`,
                [id]
            );

            if (consultasVinculadas.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `Não é possível excluir este ${usuario.perfil} pois existem consultas vinculadas a ele no sistema.`
                });
            }
        }

        // 3. Executa a exclusão
        await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário excluído com sucesso!'
        });

    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao excluir usuário.',
            erro: error.message
        });
    }
});

module.exports = router;