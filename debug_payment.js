const assert = require('assert');
const API_URL = 'http://localhost:5000/api/v1';

function extractCookie(res, name) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch (e) { json = null; }
  return { status: res.status, json, text, headers: res.headers };
}

async function debug() {
    const res = await request('/auth/login', {
      method: 'POST', body: JSON.stringify({ email: 'student@tekyad.com', password: 'password123' })
    });
    const token = extractCookie(res, 'accessToken');
    
    const cRes = await request('/courses');
    const courseId = cRes.json.data.courses[0]._id;
    
    await request('/me/cart', { method: 'DELETE', headers: { 'Cookie': `accessToken=${token}` } });
    await request('/me/cart/items', {
        method: 'POST', headers: { 'Cookie': `accessToken=${token}` },
        body: JSON.stringify({ itemId: courseId, itemType: 'course' })
    });
    
    const orderRes = await request('/checkout/create', {
        method: 'POST', headers: { 'Cookie': `accessToken=${token}` },
        body: JSON.stringify({})
    });
    const orderId = orderRes.json.data._id;
    
    const mockPayRes = await request(`/payments/${orderId}/create`, {
        method: 'POST', headers: { 'Cookie': `accessToken=${token}` }
    });
    const paymentId = mockPayRes.json.data.paymentId;
    
    const verifyRes = await request('/payments/verify', {
        method: 'POST', headers: { 'Cookie': `accessToken=${token}` },
        body: JSON.stringify({ paymentId, status: 'success' })
    });
    console.log('Verify Status:', verifyRes.status);
    console.log('Verify Response:', verifyRes.json);
}
debug();
