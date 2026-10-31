const fs = require('fs');
const path = require('path');

const SUBMISSIONS_DIR = path.resolve(__dirname, '../../results/raw_submissions');

if (!fs.existsSync(SUBMISSIONS_DIR)) {
  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

module.exports = {
  /**
   * Persiste submissão de participante com telemetria e histórico de prompts.
   * @param {Object} data Dados da submissão
   * @returns {string} Caminho absoluto do arquivo salvo
   */
  saveSubmission: (data) => {
    const filename = `${data.participantId}_${data.challengeId}_${Date.now()}.json`;
    const filePath = path.join(SUBMISSIONS_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  }
};
