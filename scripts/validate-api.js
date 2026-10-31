const http = require('http');

const DEFAULT_BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const baseUrl = getBaseUrl();

function getBaseUrl() {
  const arg = process.argv.find((value) => value.startsWith('--base-url='));
  if (arg) {
    return arg.split('=')[1];
  }

  const index = process.argv.indexOf('--base-url');
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }

  return DEFAULT_BASE_URL;
}

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

async function request(path, options = {}) {
  const url = new URL(path, baseUrl).toString();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data = text;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

async function runChecks() {
  const checks = [];

  const health = await request('/health');
  checks.push({ name: 'Health check', result: health });

  // Iniciando testes para Challenge 1:
  const uniqueEmail = `script_${Date.now()}@example.com`;
  const register = await request('/api/challenge1/register', {
    method: 'POST',
    body: {
      email: uniqueEmail,
      password: 'Senha@123',
      name: 'Script User'
    }
  });
  checks.push({ name: 'Challenge 1 - register', result: register });

  const login = await request('/api/challenge1/login', {
    method: 'POST',
    body: {
      email: 'admin@test.com',
      password: 'admin123'
    }
  });
  checks.push({ name: 'Challenge 1 - login', result: login });

  const token = login.ok && login.data && login.data.token ? login.data.token : null;

  if (token) {
    const profile = await request('/api/challenge1/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    checks.push({ name: 'Challenge 1 - profile', result: profile });
  }

  // Iniciando testes para Challenge 2:
  const checkout = await request('/api/challenge2/checkout', {
    method: 'POST',
    body: {
      customerId: 'customer-script-1',
      items: [
        { productId: 'PROD001', quantity: 1 },
        { productId: 'PROD002', quantity: 2 }
      ],
      couponCode: 'DESC10',
      shippingRegion: 'SUDESTE',
      expressShipping: false
    }
  });
  checks.push({ name: 'Challenge 2 - checkout', result: checkout });

  const orders = await request('/api/challenge2/orders?customerId=customer-script-1');
  checks.push({ name: 'Challenge 2 - orders', result: orders });

  // Iniciando testes para Challenge 3:
  const transfer = await request('/api/challenge3/transfer', {
    method: 'POST',
    body: {
      fromUserId: 'user1',
      toUserId: 'user2',
      amount: 100
    }
  });
  checks.push({ name: 'Challenge 3 - transfer', result: transfer });

  const balance = await request('/api/challenge3/balance/user1');
  checks.push({ name: 'Challenge 3 - balance', result: balance });

  let failures = 0;

  printHeader('Resultado da validação');

  for (const check of checks) {
    const ok = check.result && check.result.ok;
    const label = ok ? 'OK' : 'FAIL';
    console.log(`${label} - ${check.name} | status=${check.result.status}`);

    if (check.result && check.result.data) {
      console.log(JSON.stringify(check.result.data, null, 2));
    }

    if (!ok) {
      failures += 1;
    }
  }

  console.log(`\nResumo: ${checks.length - failures}/${checks.length} verificações concluídas com sucesso.`);
  return failures;
}

(async () => {
  console.log(`Validando APIs em: ${baseUrl}`);

  try {
    const failures = await runChecks();
    process.exitCode = failures === 0 ? 0 : 1;
  } catch (error) {
    console.error('Erro ao validar as APIs:', error);
    process.exitCode = 1;
  }
})();
