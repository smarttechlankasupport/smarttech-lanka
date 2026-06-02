#!/usr/bin/env node
// Comprehensive API Test Suite for SmartTech Lanka

const http = require('http');
const querystring = require('querystring');

const API_BASE = 'http://localhost:5000/api';
let adminToken = '';

function request(method, path, data = null, auth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (auth && adminToken) {
      options.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('\n=== SmartTech Lanka API Audit ===\n');

  // 1. Test Registration
  console.log('1. Testing Registration...');
  const regRes = await request('POST', '/auth/register', {
    name: 'Audit User',
    email: `audit-${Date.now()}@test.com`,
    password: 'Test@1234'
  });
  console.log(`   Status: ${regRes.status} ${regRes.status === 201 ? '✅' : '❌'}`);

  // 2. Test Admin Login
  console.log('\n2. Testing Admin Login...');
  const loginRes = await request('POST', '/auth/login', {
    email: 'smarttechee2026@gmail.com',
    password: 'Admin@2025!'
  });
  if (loginRes.status === 200) {
    adminToken = loginRes.data.token;
    console.log(`   Status: ${loginRes.status} ✅`);
    console.log(`   Role: ${loginRes.data.user.role}`);
  } else {
    console.log(`   Status: ${loginRes.status} ❌`);
    console.log(`   Message: ${loginRes.data.message}`);
  }

  // 3. Test Products List
  console.log('\n3. Testing Products List...');
  const prodsRes = await request('GET', '/products?limit=1');
  console.log(`   Status: ${prodsRes.status} ${prodsRes.status === 200 ? '✅' : '❌'}`);
  console.log(`   Total: ${prodsRes.data.total}`);

  // 4. Test Categories
  console.log('\n4. Testing Categories List...');
  const catsRes = await request('GET', '/categories');
  console.log(`   Status: ${catsRes.status} ${catsRes.status === 200 ? '✅' : '❌'}`);
  console.log(`   Total: ${catsRes.data.categories.length}`);

  // 5. Test Users (Admin)
  console.log('\n5. Testing Users List (Admin)...');
  const usersRes = await request('GET', '/users', null, true);
  console.log(`   Status: ${usersRes.status} ${usersRes.status === 200 ? '✅' : '❌'}`);
  console.log(`   Total: ${usersRes.data.total}`);

  // 6. Test Admin Stats
  console.log('\n6. Testing Admin Stats...');
  const statsRes = await request('GET', '/admin/stats', null, true);
  console.log(`   Status: ${statsRes.status} ${statsRes.status === 200 ? '✅' : '❌'}`);
  if (statsRes.status === 200) {
    console.log(`   Total Orders: ${statsRes.data.stats.totalOrders}`);
    console.log(`   Total Customers: ${statsRes.data.stats.totalCustomers}`);
    console.log(`   Total Revenue: Rs. ${statsRes.data.stats.totalRevenue}`);
  }

  // 7. Test Order Creation
  console.log('\n7. Testing Order Creation...');
  const prodRes = await request('GET', '/products?limit=1');
  if (prodRes.data.products.length > 0) {
    const ordRes = await request('POST', '/orders', {
      items: [{ product: prodRes.data.products[0]._id, qty: 1 }],
      shippingAddress: { line1: 'Test Address', city: 'Colombo', phone: '0771234567' },
      paymentMethod: 'cod'
    });
    console.log(`   Status: ${ordRes.status} ${ordRes.status === 201 ? '✅' : '❌'}`);
    if (ordRes.status === 201) {
      console.log(`   Order Number: ${ordRes.data.order.orderNumber}`);
    }
  }

  // 8. Test Coupons
  console.log('\n8. Testing Coupons List...');
  const coupsRes = await request('GET', '/coupons');
  console.log(`   Status: ${coupsRes.status} ${coupsRes.status === 200 ? '✅' : '❌'}`);
  if (coupsRes.status === 200) {
    console.log(`   Total: ${coupsRes.data.coupons.length}`);
  }

  console.log('\n=== Audit Complete ===\n');
}

test().catch(console.error);
