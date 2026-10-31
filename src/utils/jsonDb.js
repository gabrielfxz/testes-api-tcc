const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '../db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function resolveFilePath(filename) {
  return path.join(DB_DIR, filename);
}

module.exports = {
  /**
   * Lê os dados de um arquivo JSON. Se o arquivo não existir, cria-o com o estado padrão.
   * @param {string} filename Nome do arquivo (ex: 'users_challenge1.json')
   * @param {Array|Object} defaultData Dados iniciais
   * @returns {Array|Object}
   */
  readData: (filename, defaultData = []) => {
    const filePath = resolveFilePath(filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (error) {
      console.error(`[jsonDb] Erro ao ler arquivo ${filename}:`, error);
      return defaultData;
    }
  },

  /**
   * Escreve dados em formato JSON formatado.
   * @param {string} filename Nome do arquivo
   * @param {Array|Object} data Dados a persistir
   */
  writeData: (filename, data) => {
    const filePath = resolveFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
};
