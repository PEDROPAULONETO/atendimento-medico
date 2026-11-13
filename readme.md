# 🩺 Sistema REST de Atendimento Médico — 1ª Entrega Backend

Bem-vindo ao repositório do **Sistema de Atendimento Médico**, um ecossistema completo para gestão de clínicas e consultas médicas. Este projeto compõe a avaliação da disciplina de **Criar Serviços Web com REST (2026.2)** do Centro Universitário UNIFACISA, ministrada pelo Prof. Bruno Rafael Araújo Vasconcelos.

---

## 📌 Visão Geral do Projeto

O sistema organiza o atendimento de uma clínica médica integrando três perfis distintos de usuários: **Médico**, **Secretária** e **Paciente**. A API REST foi desenvolvida com foco em segurança, robustez de dados, autoconfiguração e conformidade aos padrões RESTful.

### 🛠️ Tecnologias Utilizadas (Backend)
- **Node.js** (Ambiente de execução)
- **Express.js** (Framework web para rotas e middlewares)
- **MySQL 8** (Banco de dados relacional)
- **`mysql2/promise`** (Driver MySQL com suporte a `async/await` e manipulação de Pool)
- **Bcrypt.js** (Criptografia e hashing seguro de senhas)
- **Dotenv** (Gerenciamento de variáveis de ambiente)
- **CORS** (Controle de acesso entre origens)
- **Nodemon** (Ambiente de desenvolvimento com auto-reload)

---

## 🏗️ Arquitetura e Estrutura de Pastas

```text
atendimento-medico/
├── banco/
│   ├── schema.sql           # Estrutura do banco de dados (Tabelas usuarios e consultas)
│   └── dados.sql            # Script de população inicial (Secretária e Médicos padrão)
└── backend/
    ├── db.js                # Conexão Pool + Automatização de Schema e Seed de Dados
    ├── models/              # Camada de Regras e Acesso ao Banco (SQL Parametrizado)
    │   └── consulta.js      # Model Consulta (criar, listarTodas, buscarPorId, atualizar)
    ├── routes/              # Endpoints da API REST
    │   ├── auth.js          # Autenticação e rotas de login
    │   ├── consultas.js     # Rotas CRUD e filtros de Consultas
    │   └── usuarios.js      # Rotas CRUD, filtros por Perfil e Gestão de Usuários
    ├── .env                 # Variáveis de ambiente (ignorado no Git)
    ├── .env.example         # Modelo de configuração do ambiente
    ├── package.json         # Dependências do projeto e scripts ("dev": "nodemon server.js")
    └── server.js            # Inicialização da API e teste de saúde do banco de dados
```

---

## 📋 Requisitos e Funcionalidades (1ª Entrega)

Nesta seção estão descritos os itens oficiais exigidos para a 1ª Entrega, acompanhados das **Soluções Extras Criadas** para maximizar a qualidade e usabilidade do projeto.

---

### 1. Requisitos Funcionais (RF)

| ID | Requisito Oficial da 1ª Entrega | Solução / Implementação | ✨ Soluções Extras Criadas (Diferenciais) |
|---|---|---|---|
| **RF01** | A API cadastra usuários com nome, e-mail, senha e perfil (`medico`, `secretaria` ou `paciente`) na tabela `usuarios`. | Implementado via `POST /api/usuarios` com sanitização dos campos. | **Suporte completo a campos específicos no cadastro:** Permite receber e salvar `cpf`, `telefone`, `crm` e `especialidade` já na criação, com sanitização de campos nulos por perfil. |
| **RF02** | A API cadastra consultas informando `paciente_id`, `medico_id` e `data_hora` na tabela `consultas`. | Implementado via `POST /api/consultas`. | **Validação avançada de conflitos:** Impede agendamento se o médico já possuir consulta no mesmo dia e horário. |
| **RF03** | A API lista as consultas com os nomes do paciente e do médico (`JOIN` com `usuarios`). | Implementado via `GET /api/consultas`. | **Detalhamento estendido no `JOIN`:** Além dos nomes, o `JOIN` retorna `cpf` do paciente, `crm` e `especialidade` do médico, organizando os dados para consumo no frontend. |
| **RF04** | A API altera a situação (`status`) e as observações de uma consulta. | Implementado via `PATCH /api/consultas/:id`. | **Atualização Dinâmica com `COALESCE`:** Permite atualizar apenas o status, apenas as observações ou ambos sem sobrescrever dados não enviados. |
| **RF-EXTRA-1** | *(Não exigido na 1ª entrega)* | **Busca de Consulta por ID (`GET /api/consultas/:id`)** | **Nova Rota:** Retorna os dados completos de uma única consulta identificada pelo seu ID, realizando `JOIN` com médico e paciente. |
| **RF-EXTRA-2** | *(Não exigido na 1ª entrega)* | **Busca de Usuário por ID (`GET /api/usuarios/:id`)** | **Nova Rota:** Permite buscar o perfil individual de qualquer usuário cadastrado no sistema. |
| **RF-EXTRA-3** | *(Não exigido na 1ª entrega)* | **Atualização Parcial de Usuários (`PATCH /api/usuarios/:id`)** | **Nova Rota:** Permite atualizar dados de cadastro do usuário (como telefone, nome, e-mail ou redefinição de senha hash). |
| **RF-EXTRA-4** | *(Não exigido na 1ª entrega)* | **Exclusão de Usuários (`DELETE /api/usuarios/:id`)** | **Nova Rota:** Permite remover um usuário do sistema com checagem prévia de integridade referencial. |

---

### 2. Regras de Negócio (RN)

| ID | Regra Oficial da 1ª Entrega | Solução / Implementação | ✨ Soluções Extras Criadas (Diferenciais) |
|---|---|---|---|
| **RN01** | Usuário: `nome` obrigatório; `email` único em minúsculas; `senha` mín. 6 caracteres; `perfil` válido (`medico`, `secretaria`, `paciente`). `ER_DUP_ENTRY` retorna 400. | Validações implementadas nas rotas e models de usuários. | **Sanitização de Duplicidade:** Tratamento amigável para chave duplicada informando se o erro foi no E-mail ou CPF. |
| **RN02** | Consulta: `paciente_id` deve ser paciente e `medico_id` médico; `data_hora` obrigatória; status (`agendada`, `realizada`, `cancelada`); sem duplicidade de horário por médico. | Validação relacional no modelo de consultas e constraints no MySQL. | **Tratamento de integridade relacional:** Mensagens claras para chaves estrangeiras inválidas no banco. |
| **RN03** | Conexão: Teste com `SELECT 1` no `server.js` antes de iniciar o `app.listen`. | Implementado no `server.js` prometificado. | **Autoconfiguração do Banco (Auto-Migration):** O `db.js` verifica a existência da base de dados, executa automaticamente o `schema.sql` e insere os registros iniciais do `dados.sql` (`INSERT IGNORE`) ao inicializar a aplicação. |
| **RN-EXTRA-1** | *(Adiantado da 2ª entrega)* | **Hashing de Senhas com Bcrypt** | **Segurança antecipada:** Todas as senhas cadastradas ou atualizadas via `POST` ou `PATCH` já são criptografadas com `bcryptjs` (salt 10) desde a 1ª entrega. |

---

### 3. Rotas da API REST (`http://localhost:5000/api`)

#### 📅 Endpoints de Consultas (`/api/consultas`)

| Método | Rota | Descrição | Status HTTP | Tipo de Entrega |
|---|---|---|---|---|
| **POST** | `/api/consultas` | Agenda uma nova consulta médica | `201 Created` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 123211.png>)
| **GET** | `/api/consultas` | Lista todas as consultas cadastradas (com `JOIN`) | `200 OK` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 123320.png>)
| **PATCH** | `/api/consultas/:id` | Altera a situação (`status`) ou observações | `200 OK` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 123459.png>)
| **GET** | `/api/consultas/:id` | **[EXTRA]** Busca detalhes de uma consulta por ID | `200 OK` / `404 Not Found` | ✨ **Solução Extra** |
![alt text](<docs/prints/Captura de tela 2026-11-12 123601.png>)

#### 👤 Endpoints de Usuários (`/api/usuarios`)

| Método | Rota | Descrição | Status HTTP | Tipo de Entrega |
|---|---|---|---|---|
| **GET** | `http://localhost:5000/` | API rodando na porta 5000 | `200 OK` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 110819.png>)
| **POST** | `/api/usuarios` | Cadastra um novo usuário (Paciente, Médico ou Secretária) | `201 Created` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 114736.png>)
| **GET** | `/api/usuarios` | Lista todos os usuários cadastrados | `200 OK` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 114934.png>)
| **GET** | `/api/usuarios/medicos` | Lista apenas os usuários com perfil médico | `200 OK` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 115834.png>)
| **GET** | `/api/usuarios/pacientes` | Lista apenas os usuários com perfil paciente | `200 OK` | **Oficial (1ª Entrega)** |
![alt text](<docs/prints/Captura de tela 2026-11-12 120024.png>)
| **GET** | `/api/usuarios/:id` | **[EXTRA]** Busca dados de um usuário por ID | `200 OK` / `404 Not Found` | ✨ **Solução Extra** |
![alt text](<docs/prints/Captura de tela 2026-11-12 120749.png>)
| **PATCH** | `/api/usuarios/:id` | **[EXTRA]** Atualização parcial dos dados do usuário | `200 OK` / `404 Not Found` | ✨ **Solução Extra** |
![alt text](<docs/prints/Captura de tela 2026-11-12 121651.png>)
| **DELETE** | `/api/usuarios/:id` | **[EXTRA]** Exclui um usuário (com checagem de consultas) | `200 OK` / `400 Bad Request` | ✨ **Solução Extra** |
![alt text](<docs/prints/Captura de tela 2026-11-12 121816.png>)

---

### 4. Requisitos Não Funcionais (RNF) e Segurança

| ID | Requisito Oficial da 1ª Entrega | Solução / Implementação | ✨ Soluções Extras Criadas (Diferenciais) |
|---|---|---|---|
| **RNF01** | **Padrão de Respostas JSON e HTTP:** Criado (201), Sucesso (200), Dados inválidos (400), Não encontrado (404), Erro interno (500). | Todos os endpoints retornam payloads padronizados com `{ sucesso: boolean, ... }`. | **Padrão Consistente:** Formatação unificada de erros em toda a aplicação facilitando a integração futura com React. |
| **RNF02** | **Segurança (SQL Injection):** Todas as consultas ao banco utilizam queries parametrizadas (`pool.execute(sql, [params])`). | 100% de cobertura contra SQL Injection em todos os models e rotas. | **Proteção de Dados Sensíveis (Privacidade):** Remoção total do campo `senha` hash em todas as rotas `GET` de usuários e adição de restrição configurável para omitir CPF e telefones pessoais em listagens gerais. |
| **RNF03** | **Configuração de Ambiente:** Uso do `dotenv` e CORS restrito a `http://localhost:5173`. | `.env` configurado e mantido no `.gitignore` com disponibilização do `.env.example`. | **Fallback e Resiliência:** Configuração automática de portas e tratamento de erro de inicialização de porta ocupada. |
| **RNF04** | **Usabilidade da API:** Mensagens de erro claras e em português. | Tratamento de erros intuitivo e amigável ao desenvolvedor. | **Validação de Integridade Referencial no DELETE:** Impede que um usuário seja deletado caso ele possua consultas atreladas, prevenindo erros de FK e quebra de histórico na clínica. |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **MySQL 8** rodando localmente (porta `3306`)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/atendimento-medico.git
   cd atendimento-medico/backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o arquivo de variáveis de ambiente (`.env`):**
   Crie um arquivo `.env` na pasta `backend/` baseado no `.env.example`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=atendimento_medico
   JWT_SECRET=sua_chave_secreta_aqui
   ```

4. **Execute o servidor em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

   > **Note:** A aplicação criará o banco de dados `atendimento_medico`, executará o `schema.sql` e populará as tabelas automaticamente com os dados do `dados.sql` na primeira execução!

---

## 🧪 Exemplos de Testes no Postman

### 1. Criar um novo Paciente (`POST /api/usuarios`)
- **URL:** `http://localhost:5000/api/usuarios`
- **Body (JSON):**
  ```json
  {
    "nome": "Maria Silva",
    "email": "maria.silva@email.com",
    "senha": "senhaSegura123",
    "perfil": "paciente",
    "cpf": "12345678901",
    "telefone": "(83)98888-7777"
  }
  ```

### 2. Agendar Consulta (`POST /api/consultas`)
- **URL:** `http://localhost:5000/api/consultas`
- **Body (JSON):**
  ```json
  {
    "paciente_id": 3,
    "medico_id": 1,
    "data_hora": "2026-11-20 14:30:00",
    "observacoes": "Primeira consulta cardiológica"
  }
  ```

### 3. Listar Consultas com JOIN (`GET /api/consultas`)
- **URL:** `http://localhost:5000/api/consultas`

### 4. Buscar Usuários por Perfil (`GET /api/usuarios/perfil/medico`)
- **URL:** `http://localhost:5000/api/usuarios/perfil/medico`

---

## 👥 Equipe e Créditos

- **Integrante 1:** Pedro Paulo da Silva Neto — Matrícula: 2515050115
- **Integrante 2:** José Fernando Henrique Correia de Albuquerque — Matrícula: 2515050082
- **Integrante 3:** Natanael do Nascimento Cardoso de Almeida — Matrícula: 2515050074

**Professor Orientador:** Bruno Rafael Araújo Vasconcelos  
**Instituição:** UNIFACISA — Centro Universitário