import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const VUS = 100; // Virtual Users
const DURATION = '10m'; // Test duration

// Custom metrics
let errorCount = new Counter('errors');
let successRate = new Rate('successful_requests');

// Test data
const testProduct = {
  name: `Load Test Product ${Math.floor(Math.random() * 1000000)}`,
  price: 99.99,
  description: 'Load test product',
  category: 'load-test',
  stock: 1000
};

// Test options
export const options = {
  stages: [
    // Ramp-up period: 2 minutes to reach full load
    { duration: '2m', target: VUS },
    // Stay at full load for 6 minutes
    { duration: '6m', target: VUS },
    // Ramp-down period: 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'], // Less than 10% of requests should fail
  },
};

// Helper function to generate random user data
function generateUserData() {
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    email: `testuser_${randomId}@example.com`,
    password: 'test123',
    name: `Test User ${randomId}`
  };
}

// Test scenario
export default function () {
  // Step 1: Get all products
  const getProductsRes = http.get(`${BASE_URL}/products`);
  
  check(getProductsRes, {
    'Get products status is 200': (r) => r.status === 200,
    'Products list received': (r) => r.json().length > 0,
  }) || errorCount.add(1);

  // If we got products, use one for order creation
  let product = null;
  if (getProductsRes.status === 200) {
    const products = getProductsRes.json();
    product = products[Math.floor(Math.random() * products.length)];
  }

  // Step 2: Create a test user
  const userData = generateUserData();
  const signupRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
  });

  let authToken = '';
  if (signupRes.status === 201) {
    const loginRes = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (loginRes.status === 200) {
      authToken = loginRes.json().token;
    }
  }

  // Step 3: If we have a product and a valid token, create an order
  if (product && authToken) {
    const orderData = {
      items: [
        {
          productId: product._id,
          quantity: Math.floor(Math.random() * 5) + 1, // Random quantity between 1-5
        },
      ],
      shippingAddress: {
        street: '123 Load Test St',
        city: 'Test City',
        state: 'Madhya Pradesh',
        postalCode: '500001',
        country: 'India',
      },
    };

    const createOrderRes = http.post(
      `${BASE_URL}/order`,
      JSON.stringify(orderData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    check(createOrderRes, {
      'Create order status is 201': (r) => r.status === 201,
    }) || errorCount.add(1);
  }

  // Track success rate
  successRate.add(true);
  
  // Add a small delay between iterations
  sleep(1);
}
