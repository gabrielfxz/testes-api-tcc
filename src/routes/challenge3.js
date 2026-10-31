const express = require('express');
const jsonDb = require('../utils/jsonDb');

const router = express.Router();

const DB_FILE = 'wallet_challenge3.json';

const DEFAULT_WALLET = {
  dailyLimit: 2000,
  accounts: [
    { userId: 'user1', balance: 1000, dailyTransferTotal: 0, lastTransferDate: null },
    { userId: 'user2', balance: 500, dailyTransferTotal: 0, lastTransferDate: null },
    { userId: 'user3', balance: 2500, dailyTransferTotal: 0, lastTransferDate: null }
  ]
};

function getWallet() {
  return jsonDb.readData(DB_FILE, DEFAULT_WALLET);
}

function saveWallet(wallet) {
  jsonDb.writeData(DB_FILE, wallet);
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function findAccount(wallet, userId) {
  return wallet.accounts.find((a) => a.userId === userId);
}

/**
 * POST /transfer
 */
router.post('/transfer', (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  if (!fromUserId || !toUserId || amount === undefined) {
    return res.status(400).json({
      error: 'Campos obrigatórios: fromUserId, toUserId, amount.'
    });
  }

  if (fromUserId === toUserId) {
    return res.status(400).json({ error: 'Não é possível transferir para a mesma conta.' });
  }

  const transferAmount = parseFloat(amount);
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ error: 'Valor de transferência inválido.' });
  }

  const wallet = getWallet();
  const fromAccount = findAccount(wallet, fromUserId);
  const toAccount = findAccount(wallet, toUserId);

  if (!fromAccount) {
    return res.status(404).json({ error: `Conta de origem '${fromUserId}' não encontrada.` });
  }
  if (!toAccount) {
    return res.status(404).json({ error: `Conta de destino '${toUserId}' não encontrada.` });
  }

  const today = getTodayDateString();

  if (fromAccount.lastTransferDate !== today) {
    fromAccount.dailyTransferTotal = 0;
    fromAccount.lastTransferDate = today;
  }

  if (fromAccount.dailyTransferTotal + transferAmount > wallet.dailyLimit) {
    return res.status(400).json({
      error: 'Limite diário de transferência excedido.',
      dailyLimit: wallet.dailyLimit,
      dailyTransferTotal: fromAccount.dailyTransferTotal,
      requestedAmount: transferAmount
    });
  }

  if (fromAccount.balance < transferAmount) {
    return res.status(400).json({
      error: 'Saldo insuficiente.',
      currentBalance: fromAccount.balance,
      requestedAmount: transferAmount
    });
  }

  fromAccount.balance = fromAccount.balance - transferAmount;
  fromAccount.dailyTransferTotal = fromAccount.dailyTransferTotal + transferAmount;
  toAccount.balance = toAccount.balance + transferAmount;

  saveWallet(wallet);

  return res.status(200).json({
    message: 'Transferência realizada com sucesso.',
    transfer: {
      fromUserId,
      toUserId,
      amount: transferAmount,
      fromBalance: fromAccount.balance,
      toBalance: toAccount.balance,
      dailyTransferTotal: fromAccount.dailyTransferTotal,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * GET /balance/:userId
 */
router.get('/balance/:userId', (req, res) => {
  const { userId } = req.params;
  const wallet = getWallet();
  const account = findAccount(wallet, userId);

  if (!account) {
    return res.status(404).json({ error: `Conta '${userId}' não encontrada.` });
  }

  const today = getTodayDateString();
  let dailyTransferTotal = account.dailyTransferTotal;

  if (account.lastTransferDate !== today) {
    dailyTransferTotal = 0;
  }

  return res.status(200).json({
    userId: account.userId,
    balance: account.balance,
    dailyLimit: wallet.dailyLimit,
    dailyTransferTotal,
    dailyRemaining: wallet.dailyLimit - dailyTransferTotal,
    lastTransferDate: account.lastTransferDate
  });
});

module.exports = router;
