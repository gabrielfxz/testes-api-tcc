const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const logger = require('./utils/logger');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/challenge1', require('./routes/challenge1'));
app.use('/api/challenge2', require('./routes/challenge2'));
app.use('/api/challenge3', require('./routes/challenge3'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[TC II] Servidor de Testes Experimental em Execução`);
  console.log(`Porta: ${PORT}`);
  console.log(`Endpoints Ativos:`);
  console.log(` - /api/challenge1`);
  console.log(` - /api/challenge2`);
  console.log(` - /api/challenge3`);
  console.log(`====================================================`);
});
