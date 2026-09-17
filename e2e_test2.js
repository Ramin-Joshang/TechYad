const axios = require('axios');

async function runTests() {
  const baseURL = 'http://localhost:5000/api/v1'; 
  const client = axios.create({ baseURL, validateStatus: () => true });

  console.log('--- PRODUCT VERIFICATION TESTS ---');
  
  function logResult(name, status) {
    console.log(`${name}: ${status}`);
  }

  // AUTH TESTS
  const email = `student_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  // 1. Register
  let res = await client.post('/auth/register', {
    firstName: 'Test', lastName: 'User', email, password, phone: '09123456789'
  });
  let token = res.data?.token;
  logResult('Register', res.status === 201 || res.status === 200 ? 'PASS' : 'FAIL');

  // 2. Login
  res = await client.post('/auth/login', { email, password });
  token = res.data?.token || token;
  const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : (token ? `token=${token}` : '');
  if (cookie) client.defaults.headers.Cookie = cookie;
  if (token) client.defaults.headers.Authorization = `Bearer ${token}`;
  logResult('Login', res.status === 200 ? 'PASS' : 'FAIL');

  // 3. Invalid Credentials
  res = await client.post('/auth/login', { email, password: 'wrongpassword' });
  logResult('Invalid Credentials', res.status === 401 ? 'PASS' : 'FAIL');

  // 4. Missing Token
  const noAuthClient = axios.create({ baseURL, validateStatus: () => true });
  res = await noAuthClient.get('/auth/me');
  logResult('Missing Token', res.status === 401 ? 'PASS' : 'FAIL');

  // 5. Get Me
  res = await client.get('/auth/me');
  logResult('Get Me', res.status === 200 ? 'PASS' : 'FAIL');

  // COMMERCE
  res = await client.get('/courses');
  const courses = res.data.data || res.data;
  const courseId = courses.length > 0 ? (courses[0]._id || courses[0].id) : null;
  
  if (courseId) {
      logResult('Fetch Courses', 'PASS');
      
      // Add to Cart
      res = await client.post('/commerce/cart', { itemId: courseId, itemType: 'course' });
      logResult('Add to Cart', res.status === 200 ? 'PASS' : 'FAIL');

      // Cart
      res = await client.get('/commerce/cart');
      logResult('Cart', res.status === 200 ? 'PASS' : 'FAIL');

      // Checkout Preview
      // Based on API, the checkout might be a preview or direct
      res = await client.post('/commerce/checkout', { gateway: 'zarinpal' });
      logResult('Checkout Preview / Create Order', res.status === 200 || res.status === 201 ? 'PASS' : 'FAIL');
  } else {
      logResult('Fetch Courses', 'FAIL');
      logResult('Add to Cart', 'BLOCKED');
      logResult('Cart', 'BLOCKED');
      logResult('Checkout Preview / Create Order', 'BLOCKED');
  }

  // NOT IMPLEMENTED sections
  logResult('Apply Coupon', 'NOT_IMPLEMENTED');
  logResult('Verify Payment', 'BLOCKED'); // Needs actual redirect
}

runTests().catch(e => console.error('TEST ERROR:', e.message));
