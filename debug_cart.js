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
    
    // get a course
    const cRes = await request('/courses');
    const courseId = cRes.json.data.courses[0]._id;
    
    console.log('Course ID:', courseId);
    
    await request('/me/cart', { method: 'DELETE', headers: { 'Cookie': `accessToken=${token}` } });
    
    const cartRes = await request('/me/cart/items', {
        method: 'POST', headers: { 'Cookie': `accessToken=${token}` },
        body: JSON.stringify({ itemId: courseId, itemType: 'course' })
    });
    console.log('Cart Status:', cartRes.status);
    console.log('Cart Response:', JSON.stringify(cartRes.json, null, 2));
    
    // Let's also debug the paid lesson 404
    const chRes = await request(`/courses/${courseId}/chapters`);
    const chapterId = chRes.json.data[0]._id;
    const lRes = await request(`/chapters/${chapterId}/lessons`);
    const paidLessonId = lRes.json.data.find(l => !l.isFree)._id;
    
    console.log('Paid Lesson ID:', paidLessonId);
    
    const securePaidLRes = await request(`/learning/lessons/${paidLessonId}`, {
        headers: { 'Cookie': `accessToken=${token}` }
    });
    console.log('Secure Paid Lesson Status:', securePaidLRes.status);
    console.log('Secure Paid Lesson Response:', securePaidLRes.json);
}
debug();
