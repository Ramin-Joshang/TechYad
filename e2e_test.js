const axios = require('axios');

async function runTests() {
  const baseURL = 'http://localhost:5000/api/v1'; // Assuming backend runs on 5000, or we can use 3000/api/v1
  const client = axios.create({ baseURL, validateStatus: () => true });

  console.log('--- STARTING E2E TESTS ---');

  // 1. Auth Test (Register / Login)
  const userPayload = {
    firstName: 'Test',
    lastName: 'Student',
    email: `test_student_${Date.now()}@example.com`,
    password: 'Password123!',
    phone: '0912' + Math.floor(1000000 + Math.random() * 9000000)
  };

  console.log('1. Registering user:', userPayload.email);
  let res = await client.post('/auth/register', userPayload);
  let token = '';
  
  if (res.status === 201 || res.status === 200) {
    console.log('REGISTER: PASS');
    token = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
    // if token is in body (often the case)
    if (res.data.token) {
        token = `token=${res.data.token}`;
    }
    // Set cookie for auth
    if (token) client.defaults.headers.Cookie = token;
  } else {
    console.log('REGISTER: FAIL', res.status, res.data);
    return;
  }
  
  // 2. Fetching Courses
  console.log('2. Fetching courses');
  res = await client.get('/courses');
  let courses = res.data.data || res.data; // adjust based on envelope
  if (res.status === 200 && courses.length >= 0) {
     console.log('FETCH COURSES: PASS');
  } else {
     console.log('FETCH COURSES: FAIL', res.status);
  }

  // 3. Create a test course if none exists to buy
  let courseId = courses.length > 0 ? courses[0]._id : null;
  if (!courseId) {
     console.log('No courses found. Cannot test commerce E2E properly, need to seed or mock a course.');
     return;
  }
  
  console.log('Course ID selected:', courseId);

  // 4. Add to cart
  console.log('3. Adding to cart');
  res = await client.post('/commerce/cart', { itemId: courseId, itemType: 'course' });
  if (res.status === 200) {
      console.log('ADD TO CART: PASS');
  } else {
      console.log('ADD TO CART: FAIL', res.status, res.data);
  }

  // 5. View Cart
  console.log('4. View Cart');
  res = await client.get('/commerce/cart');
  if (res.status === 200) {
      console.log('VIEW CART: PASS');
  } else {
      console.log('VIEW CART: FAIL', res.status, res.data);
  }

  // 6. Checkout
  console.log('5. Checkout Checkout');
  res = await client.post('/commerce/checkout', { gateway: 'zarinpal' });
  if (res.status === 200) {
      console.log('CHECKOUT: PASS');
      console.log('Redirect URL:', res.data.paymentUrl);
  } else {
      console.log('CHECKOUT: FAIL', res.status, res.data);
  }

}

runTests().catch(console.error);
