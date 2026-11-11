USE atendimento_medico;

-- Inserção da Secretária inicial do sistema
INSERT INTO usuarios (nome, email, senha, perfil, cpf, telefone) 
VALUES ('Ana Secretária', 'ana.secretaria@email.com', '$2a$10$exemploDeHashBcryptOuSenhaSimples', 'secretaria', '09876543211', '(83)7777-7777');

-- Inserção de médicos iniciais para testes
INSERT INTO usuarios (nome, email, senha, perfil, cpf, telefone, crm, especialidade) 
VALUES ('Dr. Carlos Nogueira', 'carlos@email.com', '$2a$10$exemploDeHashBcryptOuSenhaSimples', 'medico', '12345678900', '(83)99999-9999', '12345-PB', 'Cardiologia');

INSERT INTO usuarios (nome, email, senha, perfil, cpf, telefone, crm, especialidade) 
VALUES ('Dra. Beatriz Souza', 'beatriz@email.com', '$2a$10$exemploDeHashBcryptOuSenhaSimples', 'medico','98765432100', '(83)88888-8888', '54321-PB', 'Pediatria');