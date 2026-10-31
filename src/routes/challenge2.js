const express = require('express');
const jsonDb = require('../utils/jsonDb');

const router = express.Router();

const DB_FILE = 'orders_challenge2.json';

const PRODUCT_CATALOG = {
  PROD001: { name: 'Notebook', price: 3500, stock: 10 },
  PROD002: { name: 'Mouse', price: 89.9, stock: 50 },
  PROD003: { name: 'Teclado', price: 249.9, stock: 30 },
  PROD004: { name: 'Monitor', price: 1200, stock: 15 },
  PROD005: { name: 'Webcam', price: 399.9, stock: 25 }
};

const COUPONS = {
  DESC10: { type: 'percent', value: 10 },
  DESC20: { type: 'percent', value: 20 },
  FRETEGRATIS: { type: 'free_shipping', value: 0 },
  FIXO50: { type: 'fixed', value: 50 }
};

const DEFAULT_ORDERS = [];

function getOrders() {
  return jsonDb.readData(DB_FILE, DEFAULT_ORDERS);
}

function saveOrders(orders) {
  jsonDb.writeData(DB_FILE, orders);
}

/**
 * POST /checkout
 */
router.post('/checkout', (req, res) => {
  const { customerId, items, couponCode, shippingRegion, expressShipping } = req.body;

  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerId e items são obrigatórios.' });
  }

  let subtotal = 0;
  let totalWeight = 0;
  let orderItems = [];
  let stockErrors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = PRODUCT_CATALOG[item.productId];

    if (!product) {
      stockErrors.push({ productId: item.productId, error: 'Produto não encontrado.' });
    } else {
      if (item.quantity <= 0) {
        stockErrors.push({ productId: item.productId, error: 'Quantidade inválida.' });
      } else {
        if (product.stock < item.quantity) {
          stockErrors.push({
            productId: item.productId,
            error: `Estoque insuficiente. Disponível: ${product.stock}`
          });
        } else {
          const lineTotal = product.price * item.quantity;
          subtotal = subtotal + lineTotal;
          totalWeight = totalWeight + item.quantity * 0.5;
          orderItems.push({
            productId: item.productId,
            name: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal
          });
        }
      }
    }
  }

  if (stockErrors.length > 0) {
    return res.status(400).json({ error: 'Erros de estoque.', details: stockErrors });
  }

  let shippingCost = 0;
  let discountAmount = 0;
  let freeShippingApplied = false;

  if (shippingRegion) {
    if (shippingRegion === 'NORTE') {
      if (expressShipping) {
        if (subtotal > 500) {
          shippingCost = 45;
        } else {
          if (subtotal > 200) {
            shippingCost = 55;
          } else {
            shippingCost = 65;
          }
        }
      } else {
        if (subtotal > 500) {
          shippingCost = 25;
        } else {
          if (subtotal > 200) {
            shippingCost = 35;
          } else {
            shippingCost = 45;
          }
        }
      }
    } else {
      if (shippingRegion === 'NORDESTE') {
        if (expressShipping) {
          if (subtotal > 500) {
            shippingCost = 40;
          } else {
            if (subtotal > 200) {
              shippingCost = 50;
            } else {
              shippingCost = 60;
            }
          }
        } else {
          if (subtotal > 500) {
            shippingCost = 22;
          } else {
            if (subtotal > 200) {
              shippingCost = 32;
            } else {
              shippingCost = 42;
            }
          }
        }
      } else {
        if (shippingRegion === 'CENTRO-OESTE') {
          if (expressShipping) {
            shippingCost = subtotal > 300 ? 35 : 48;
          } else {
            shippingCost = subtotal > 300 ? 18 : 28;
          }
        } else {
          if (shippingRegion === 'SUDESTE') {
            if (expressShipping) {
              if (subtotal > 400) {
                shippingCost = 20;
              } else {
                if (subtotal > 150) {
                  shippingCost = 30;
                } else {
                  shippingCost = 38;
                }
              }
            } else {
              if (subtotal > 400) {
                shippingCost = 10;
              } else {
                if (subtotal > 150) {
                  shippingCost = 18;
                } else {
                  shippingCost = 25;
                }
              }
            }
          } else {
            if (shippingRegion === 'SUL') {
              if (expressShipping) {
                shippingCost = subtotal > 350 ? 28 : 42;
              } else {
                shippingCost = subtotal > 350 ? 15 : 22;
              }
            } else {
              shippingCost = 50;
            }
          }
        }
      }
    }
  } else {
    shippingCost = 50;
  }

  if (totalWeight > 10) {
    shippingCost = shippingCost + 15;
  } else {
    if (totalWeight > 5) {
      shippingCost = shippingCost + 8;
    }
  }

  if (couponCode) {
    const coupon = COUPONS[couponCode];
    if (coupon) {
      if (coupon.type === 'percent') {
        discountAmount = subtotal * (coupon.value / 100);
      } else {
        if (coupon.type === 'fixed') {
          discountAmount = coupon.value;
        } else {
          if (coupon.type === 'free_shipping') {
            freeShippingApplied = true;
            discountAmount = shippingCost;
          }
        }
      }
    } else {
      return res.status(400).json({ error: 'Cupom inválido.' });
    }
  }

  if (subtotal > 1000 && !couponCode) {
    discountAmount = discountAmount + subtotal * 0.05;
  }

  let total = subtotal - discountAmount;
  if (!freeShippingApplied) {
    total = total + shippingCost;
  }

  if (total < 0) {
    total = 0;
  }

  for (let j = 0; j < orderItems.length; j++) {
    const orderItem = orderItems[j];
    PRODUCT_CATALOG[orderItem.productId].stock =
      PRODUCT_CATALOG[orderItem.productId].stock - orderItem.quantity;
  }

  const orders = getOrders();
  const order = {
    id: orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
    customerId,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: freeShippingApplied ? 0 : Math.round(shippingCost * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    couponCode: couponCode || null,
    shippingRegion: shippingRegion || 'NAO_INFORMADO',
    expressShipping: !!expressShipping,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  saveOrders(orders);

  return res.status(201).json({
    message: 'Pedido processado com sucesso.',
    order
  });
});

/**
 * GET /orders
 */
router.get('/orders', (req, res) => {
  const orders = getOrders();
  const { customerId } = req.query;

  if (customerId) {
    const filtered = orders.filter((o) => o.customerId === customerId);
    return res.status(200).json({ count: filtered.length, orders: filtered });
  }

  return res.status(200).json({ count: orders.length, orders });
});

module.exports = router;
