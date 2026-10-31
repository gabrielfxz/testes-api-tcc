# Documento não enviado para os participantes, apenas detalhando o objetivo de cada API de testes realizados.

# API Challenge 2 — Refatoração e regras de negócio

## Visão geral

A API de Challenge 2 simula um sistema de checkout de e-commerce. O objetivo é processar pedidos, aplicar cupons, calcular frete, verificar estoque e registrar a compra.

Base URL:

```text
/api/challenge2
```

Arquivo de persistência:

```text
src/db/orders_challenge2.json
```

---

## Objetivo do desafio

Este desafio foi desenhado para representar um código monolítico e altamente aninhado, com lógica espalhada em diversas condições e decisões. O foco aqui é a refatoração e a simplicidade no tratamento de regras de negócio.

As principais áreas de complexidade são:

- catálogo de produtos;
- cálculo de subtotal;
- regras de frete por região;
- aplicação de cupons;
- desconto adicional por valor;
- validação de estoque;
- persistência do pedido final.

---

## Endpoints

### 1. POST /api/challenge2/checkout

Processa um pedido.

#### Campos esperados

```json
{
  "customerId": "customer-123",
  "items": [
    { "productId": "PROD001", "quantity": 1 },
    { "productId": "PROD002", "quantity": 2 }
  ],
  "couponCode": "DESC10",
  "shippingRegion": "SUDESTE",
  "expressShipping": false
}
```

#### Regras envolvidas
- validação de `customerId` e lista de itens;
- checagem de produto existente;
- verificação da quantidade solicitada;
- comparação com estoque disponível;
- cálculo de subtotal e peso;
- cálculo de frete conforme região e tipo de entrega;
- aplicação de cupom;
- desconto adicional para pedidos acima de 1000;
- atualização de estoque;
- gravação do pedido em JSON.

#### Problemas principais
- lógica de frete escrita em blocos aninhados com várias camadas `if/else`;
- baixa legibilidade e alta manutenção;
- baixa modularização;
- risco de regressão durante alterações na regra de negócio;
- atualização de estoque e processamento do pedido em um mesmo fluxo, sem separação clara de responsabilidades.

---

### 2. GET /api/challenge2/orders

Lista os pedidos registrados.

#### Possível uso

```http
GET /api/challenge2/orders
```

Também aceita filtro por cliente:

```http
GET /api/challenge2/orders?customerId=customer-123
```

---

## Estruturas relevantes

### Catálogo de produtos

```js
PROD001: Notebook 3500
PROD002: Mouse 89.9
PROD003: Teclado 249.9
PROD004: Monitor 1200
PROD005: Webcam 399.9
```

### Cupons disponíveis

- `DESC10` — desconto de 10%;
- `DESC20` — desconto de 20%;
- `FRETEGRATIS` — frete grátis;
- `FIXO50` — desconto fixo de 50 reais.

---

## Melhoras esperadas

Uma refatoração adequada deve:

- extrair regras de frete em funções isoladas;
- extrair cálculo de cupom e desconto em utilitários;
- consolidar validação de itens em funções menores;
- evitar lógicas profundamente aninhadas;
- separar cálculos de ordem e persistência;
- manter a resposta final consistente e previsível;
- reduzir duplicação e aumentar testabilidade.

---

## Objetivo educacional

Este desafio enfatiza a importância da refatoração, da clareza de código e da organização da lógica de negócio. A correção do código deve priorizar legibilidade, manutenção e robustez sem alterar o comportamento esperado da API.
