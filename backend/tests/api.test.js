// tests/api.test.js
// Automated verification tests for BlushBites backend APIs:
// - Auth (signup & login)
// - Menu & Categories
// - Cart Sync
// - Real-time Stock Verification & Order Placement
// - Order Status Updates
// - Admin RBAC Guarding
process.env.PORT = '5055';
process.env.NODE_ENV = 'test';

const http = require('http');

let server;
let app;
const BASE_URL = 'http://localhost:5055/api';

// Simple test runner helpers
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n🚀 Starting BlushBites Backend API Test Suite...\n');

  // Start server
  app = require('../src/server');
  // Wait a moment for server initialization
  await new Promise((r) => setTimeout(r, 800));

  let customerToken = '';
  let adminToken = '';
  let sampleItem = null;
  let createdOrderId = '';

  // 1. Health check
  await test('GET /api/health returns success', async () => {
    const res = await request('/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Expected success: true');
  });

  // 2. Fetch categories
  await test('GET /api/menu/categories returns category list', async () => {
    const res = await request('/menu/categories');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.data), 'Expected data to be an array');
    assert(res.data.data.length > 0, 'Expected at least 1 category');
  });

  // 3. Fetch menu items
  await test('GET /api/menu/items returns in-stock items with veg filters', async () => {
    const res = await request('/menu/items');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.length > 0, 'Expected items in database');
    sampleItem = res.data.data[0];
    assert(typeof sampleItem.price === 'number', 'Expected item price to be number');
  });

  // 4. Admin Login
  await test('POST /api/auth/login works for seeded admin', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@blushbites.com',
        password: 'admin123',
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Expected JWT token');
    assert(res.data.user.role === 'admin', 'Expected admin role');
    adminToken = res.data.token;
  });

  // 5. Customer Signup
  const testEmail = `testuser_${Date.now()}@example.com`;
  await test('POST /api/auth/signup registers a new customer', async () => {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Customer',
        email: testEmail,
        password: 'password123',
        phone: '1234567890',
        address: '777 Strawberry Lane, Blossom City',
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.token, 'Expected JWT token');
    assert(res.data.user.role === 'customer', 'Expected customer role');
    customerToken = res.data.token;
  });

  // 6. Cart Sync
  await test('POST /api/cart/sync stores customer cart', async () => {
    const res = await request('/cart/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        items: [{ itemId: sampleItem.id, quantity: 2 }],
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Expected success: true');
  });

  // 7. Place Order (Real-time Stock Verification)
  await test('POST /api/orders places order successfully when items are in stock', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        items: [
          {
            itemId: sampleItem.id,
            name: sampleItem.name,
            price: sampleItem.price,
            quantity: 2,
          },
        ],
        deliveryAddress: '777 Strawberry Lane, Blossom City, Apt 4B',
        deliveryNotes: 'Please ring bell',
        paymentMethod: 'Card',
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.data.orderId, 'Expected orderId in response');
    createdOrderId = res.data.data.orderId;
  });

  // 8. Prevent Order for Out of Stock items
  await test('POST /api/orders rejects order if item is out of stock', async () => {
    // Admin toggles sample item out of stock
    await request(`/menu/items/${sampleItem.id}/stock`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Customer tries to order out-of-stock item
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        items: [
          {
            itemId: sampleItem.id,
            name: sampleItem.name,
            price: sampleItem.price,
            quantity: 1,
          },
        ],
        deliveryAddress: '777 Strawberry Lane, Blossom City, Apt 4B',
        paymentMethod: 'COD',
      }),
    });

    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(
      res.data.message.toLowerCase().includes('stock'),
      'Expected out of stock message'
    );

    // Toggle back in stock
    await request(`/menu/items/${sampleItem.id}/stock`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  // 9. Customer gets their orders
  await test('GET /api/orders returns user order history', async () => {
    const res = await request('/orders', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.data), 'Expected array of orders');
    assert(res.data.data.length >= 1, 'Expected at least 1 order');
  });

  // 10. Admin updates order status
  await test('PATCH /api/orders/:id/status updates status to "Preparing"', async () => {
    const res = await request(`/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'Preparing' }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.status === 'Preparing', 'Expected Preparing status');
  });

  // 11. Customer tracking reflects updated status
  await test('GET /api/orders/:id returns updated status for customer', async () => {
    const res = await request(`/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.status === 'Preparing', 'Expected Preparing status');
  });

  // 12. Security: Customer cannot access admin dashboard
  await test('GET /api/admin/dashboard blocks regular customer (403)', async () => {
    const res = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  // 13. Admin Dashboard returns stats
  await test('GET /api/admin/dashboard returns operational analytics for admin', async () => {
    const res = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert('todayRevenue' in res.data.data, 'Expected todayRevenue field');
    assert('totalOrders' in res.data.data, 'Expected totalOrders field');
  });

  console.log('\n─────────────────────────────────────────────');
  console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('─────────────────────────────────────────────\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
