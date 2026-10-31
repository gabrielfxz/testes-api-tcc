# TC II - Servidor de Testes Experimental

Servidor Node.js/Express para experimentos com code agents. Três desafios modulares com persistência JSON local (sem SGBD externo).

## Requisitos

- Node.js 18+

## Instalação

```bash
npm install
cp .env.example .env
npm start
```

Servidor em `http://localhost:3000`.

## Endpoints

| Rota | Descrição |
|------|-----------|
| `GET /health` | Health check |
| `/api/challenge1` | Segurança e autenticação |
| `/api/challenge2` | Refatoração e complexidade |
| `/api/challenge3` | Regras globais e concorrência |
| `POST /api/submit-solution` | Coleta de telemetria e código final |

## Estrutura

- `src/db/` — dados simulados em JSON
- `src/routes/` — três desafios desacoplados
- `src/utils/` — persistência JSON e logger de submissões
- `results/` — submissões, relatórios SonarQube e Snyk

## Autor

Gabriel Gonçalves Perozim — UNIP, Ciência da Computação, 2026
