# Documento não enviado para os participantes, apenas detalhando o objetivo de cada API de testes realizados.

# API Challenge 3 — Concorrência e regras globais

## Visão geral

A API de Challenge 3 simula uma carteira digital com múltiplas contas de usuário. O sistema permite transferências entre contas e aplica um limite diário cumulativo de transferência.

Base URL:

```text
/api/challenge3
```

Arquivo de persistência:

```text
src/db/wallet_challenge3.json
```

---

## Objetivo do desafio

A principal falha aqui é a ausência de controle atômico sobre operações concorrentes. O problema é intencional e representa um cenário clássico de race condition, em que duas transferências simultâneas podem burlar a validação do limite diário.

---

## Endpoints

### 1. POST /api/challenge3/transfer

Realiza a transferência de um valor de uma conta para outra.

#### Campos esperados

```json
{
  "fromUserId": "user1",
  "toUserId": "user2",
  "amount": 250
}
```

#### Regras envolvidas
- valida se os campos obrigatórios existem;
- impede transferência para a mesma conta;
- verifica valor positivo;
- valida existência das contas;
- calcula o total diário já movimentado;
- verifica se excedeu o limite diário da carteira;
- verifica saldo suficiente;
- atualiza saldo e limite diário;
- salva as alterações no arquivo JSON.

#### Problema principal
A lógica de leitura e escrita da carteira não é tratada de forma atômica. Isso cria uma janela de vulnerabilidade em que duas requisições podem validar o mesmo estado antes que a primeira tenha persistido o resultado.

---

### 2. GET /api/challenge3/balance/:userId

Consulta saldo e situação do limite diário da conta do usuário.

#### Exemplo

```http
GET /api/challenge3/balance/user1
```

#### Resposta esperada
- saldo atual;
- limite diário;
- total transferido hoje;
- restante diário;
- data da última movimentação.

---

## Estado inicial

A carteira começa com:

```json
{
  "dailyLimit": 2000,
  "accounts": [
    { "userId": "user1", "balance": 1000, "dailyTransferTotal": 0, "lastTransferDate": null },
    { "userId": "user2", "balance": 500, "dailyTransferTotal": 0, "lastTransferDate": null },
    { "userId": "user3", "balance": 2500, "dailyTransferTotal": 0, "lastTransferDate": null }
  ]
}
```

---

## Melhoras esperadas

Uma correção adequada deve:

- garantir operação atômica da transferência;
- sincronizar acesso ao estado da carteira;
- evitar race conditions ao validar limite e saldo;
- preservar consistência das duas contas envolvidas;
- recalcular corretamente o total diário por data;
- manter a resposta consistente mesmo em cenários concorrentes.

Estratégias comuns incluem:
- bloqueio por fila/semáforo;
- uso de operações transacionais;
- armazenamento em backend com controle de concorrência real;
- lock local ou mecanismo equivalente para a atualização do arquivo JSON.

---

## Objetivo educacional

Este desafio destaca a importância de transações e consistência em sistemas que envolvem dinheiro ou regras globais. Ele serve como exemplo de como lógica aparentemente simples pode falhar em ambiente concorrente e causar inconsistências financeiras e de negócio.
