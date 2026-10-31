# Documento não enviado para os participantes, apenas detalhando o objetivo de cada API de testes realizados

# API Challenge 1 — Segurança e autenticação

## Visão geral

A API de Challenge 1 simula um sistema simples de usuários com cadastro, login e consulta de perfil. Ela foi criada para expor falhas tradicionais de autenticação, armazenamento de senhas e tratamento de dados sensíveis.

Base URL:

```text
/api/challenge1
```

Arquivo de persistência:

```text
src/db/users_challenge1.json
```

---

## Objetivo do desafio

O problema principal desta API é demonstrar que a autenticação e o gerenciamento de usuários foram implementados de forma vulnerável intencionalmente. O objetivo para o agente é identificar e corrigir:

- armazenamento de senha em texto puro;
- ausência de validação de e-mail;
- uso de segredo JWT hardcoded;
- exposição de senha em rota protegida;
- autenticação baseada em comparação direta de credenciais sem hash.

---

## Endpoints

### 1. POST /api/challenge1/register

Cria um novo usuário.

#### Campos esperados

```json
{
  "email": "usuario@teste.com",
  "password": "senha123",
  "name": "Usuário Teste"
}
```

#### Comportamento atual
- valida se os campos obrigatórios existem;
- impede e-mails duplicados;
- salva o novo usuário em JSON sem criptografar a senha;
- retorna o usuário sem a senha em resposta, mas salva a senha em texto puro.

#### Problemas principais
- ausência de validação de formato de e-mail;
- senha armazenada em claro;
- risco de vazamento de dados em banco ou arquivo local.

---

### 2. POST /api/challenge1/login

Autentica um usuário mediante e-mail e senha.

#### Campos esperados

```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

#### Comportamento atual
- procura o usuário por e-mail e senha em texto puro;
- se válido, gera um JWT com segredo hardcoded;
- retorna o token e os dados do usuário.

#### Problemas principais
- comparação direta da senha em texto puro;
- ausência de hash de senha;
- JWT com segredo fixo em código;
- ausência de melhor tratamento de erros e expiração segura.

---

### 3. GET /api/challenge1/profile

Retorna o perfil do usuário autenticado.

#### Requisitos de autenticação

O cliente deve enviar o token no cabeçalho:

```http
Authorization: Bearer <token>
```

#### Comportamento atual
- valida o JWT;
- localiza o usuário;
- retorna dados sensíveis, incluindo a senha em texto puro.

#### Problemas principais
- rota protegida expõe a senha;
- risco de vazamento de dados sensíveis em resposta HTTP.

---

## Melhoras esperadas

Uma correção adequada para este desafio deve incluir:

- hash da senha com `bcrypt` antes de salvar;
- comparação segura de senha no login;
- carregamento do segredo JWT a partir de variável de ambiente (`process.env.JWT_SECRET`);
- validação do e-mail;
- remoção da senha do retorno da rota `/profile`;
- proteção de dados do usuário e padronização de respostas.

---

## Objetivo educacional

Essa API serve como exemplo clássico de uma implementação que parece funcional, mas contém riscos severos de segurança. O agente deve aprender a transformar um fluxo simples em uma autenticação segura e sem vulnerabilidades graves.
