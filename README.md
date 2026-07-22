# Central de Chamados Internos

Aplicação web desenvolvida como desafio técnico para gerenciamento de chamados internos, com autenticação, controle de acesso por perfil e área administrativa.

## Funcionalidades

- Autenticação por sessão.
- Controle de acesso para usuários e administradores.
- Abertura, listagem e consulta de chamados.
- Protocolo sequencial para identificação dos chamados.
- Atualização de status com histórico de alterações.
- Comentários administrativos.
- Upload opcional de anexos.
- Dashboard com indicadores e gráficos.
- Registro de auditoria das principais ações.
- Cadastro e listagem de usuários pela área administrativa.
- Tratamento centralizado de páginas 404 e erros internos.

## Perfis de acesso

### Usuário

- Abre chamados.
- Consulta apenas os próprios chamados.
- Acompanha status, histórico e comentários.

### Administrador

- Consulta todos os chamados.
- Filtra chamados por critérios administrativos.
- Atualiza status e adiciona comentários.
- Consulta os registros de auditoria.
- Cadastra e lista usuários.

## Tecnologias

- Node.js
- Express
- EJS
- MongoDB
- Mongoose
- express-session
- connect-mongo
- bcrypt
- Multer
- Chart.js

## Organização do projeto

A aplicação utiliza uma estrutura baseada em MVC com camada de serviços:

```text
src/
├── config/          # Configurações da aplicação e do banco de dados
├── constants/       # Valores e regras compartilhadas
├── controllers/     # Controle das requisições e respostas
├── middlewares/     # Autenticação, autorização, upload e erros
├── models/          # Schemas do Mongoose
├── routes/          # Definição das rotas
├── services/        # Regras de negócio e acesso aos dados
├── utils/           # Funções auxiliares
├── validators/      # Validação e normalização das entradas
└── views/           # Templates EJS
```

Fluxo principal:

```text
Rota → Middleware → Controller → Validator/Service → Model → MongoDB
```

## Requisitos

- Node.js instalado.
- Conta ou instância MongoDB disponível.

## Configuração

Crie um arquivo `.env` na raiz do projeto usando o `.env.example` como referência:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=sua_string_de_conexao
SESSION_SECRET=uma_chave_segura
```

## Instalação e execução

Instale as dependências:

```bash
npm install
```

Crie os usuários iniciais:

```bash
npm run seed
```

Inicie a aplicação em ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm start
npm run seed
```

- `npm run dev`: inicia a aplicação em desenvolvimento.
- `npm start`: inicia a aplicação normalmente.
- `npm run seed`: cria os usuários iniciais.

## Regras principais

- As senhas são armazenadas somente como hash.
- Os e-mails são normalizados antes da persistência.
- Usuários comuns acessam apenas os próprios chamados.
- Rotas administrativas exigem autenticação e perfil `ADMIN`.
- Anexos possuem validação de formato e tamanho.
- Alterações relevantes geram registros de auditoria.
- O gerenciamento administrativo de usuários contempla cadastro e listagem.

## Autor

**Diogo Rodrigues**
