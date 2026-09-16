const assert = require('assert');
const API_URL = 'http://localhost:5000/api/v1';

function extractCookie(res, name) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return null;
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = null; }
  return { status: res.status, json, text, headers: res.headers };
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.status !== 200) throw new Error(`Login failed for ${email}`);
  return extractCookie(res, 'accessToken');
}

async function testFreePreview() {
    const tokens = {};
    tokens.instructor = await login('instructor@tekyad.com', 'password123');
    tokens.student = await login('student@tekyad.com', 'password123');
    tokens.admin = await login('admin@tekyad.com', 'password123');
    
    // Create course, chapter, free lesson, paid lesson
    const catList = await request('/categories');
    let categoryId = catList.json.data?.[0]?._id;
    if (!categoryId) {
        const catRes = await request('/categories', { method: 'POST', headers: {'Cookie': `accessToken=${tokens.admin}`}, body: JSON.stringify({name:'Cat', slug:'cat1', order:1})});
        categoryId = catRes.json.data._id;
    }
    
    const lvlList = await request('/levels');
    let levelId = lvlList.json.data?.[0]?._id;
    if (!levelId) {
        const lvlRes = await request('/levels', { method: 'POST', headers: {'Cookie': `accessToken=${tokens.admin}`}, body: JSON.stringify({name:'Lvl', slug:'lvl1', order:1})});
        levelId = lvlRes.json.data._id;
    }

    const cRes = await request('/instructor/courses', {
      method: 'POST',
      headers: { 'Cookie': `accessToken=${tokens.instructor}` },
      body: JSON.stringify({
        title: 'Preview Test Course', slug: 'preview-test-' + Date.now(),
        price: 1000, levelId, categoryId
      })
    });
    
    if (cRes.status !== 201) return console.log('Course create failed', cRes.json);
    const courseId = cRes.json.data._id;
    
    const chRes = await request(`/instructor/courses/${courseId}/chapters`, {
      method: 'POST',
      headers: { 'Cookie': `accessToken=${tokens.instructor}` },
      body: JSON.stringify({ title: 'Chapter 1', order: 1 })
    });
    const chapterId = chRes.json.data._id;
    
    // Create Free Lesson
    const freeRes = await request(`/instructor/chapters/${chapterId}/lessons`, {
        method: 'POST',
        headers: { 'Cookie': `accessToken=${tokens.instructor}` },
        body: JSON.stringify({ title: 'Free Lesson', order: 1, isFree: true })
    });
    const freeLessonId = freeRes.json.data._id;

    // Create Paid Lesson
    const paidRes = await request(`/instructor/chapters/${chapterId}/lessons`, {
        method: 'POST',
        headers: { 'Cookie': `accessToken=${tokens.instructor}` },
        body: JSON.stringify({ title: 'Paid Lesson', order: 2, isFree: false })
    });
    const paidLessonId = paidRes.json.data._id;
    
    // Add video url to both by updating them
    await request(`/instructor/lessons/${freeLessonId}`, {
        method: 'PATCH',
        headers: { 'Cookie': `accessToken=${tokens.instructor}` },
        body: JSON.stringify({ videoUrl: 'free-vid' })
    });
    await request(`/instructor/lessons/${paidLessonId}`, {
        method: 'PATCH',
        headers: { 'Cookie': `accessToken=${tokens.instructor}` },
        body: JSON.stringify({ videoUrl: 'paid-vid' })
    });
    
    // Now publish course
    await request(`/instructor/courses/${courseId}/request-review`, {
        method: 'POST', headers: { 'Cookie': `accessToken=${tokens.instructor}` }
    });
    await request(`/admin/courses/${courseId}/publish`, {
        method: 'POST', headers: { 'Cookie': `accessToken=${tokens.admin}` }
    });

    console.log('Testing Public Course Fetch (should strip paid content)');
    // Get course chapters and lessons publicly
    const publicLRes = await request(`/chapters/${chapterId}/lessons`);
    
    const freePub = publicLRes.json.data.find(l => l._id === freeLessonId);
    const paidPub = publicLRes.json.data.find(l => l._id === paidLessonId);
    
    console.log(`Public Free Lesson Video: ${freePub?.videoUrl ? 'Exists' : 'Missing'} (Expected Exists)`);
    console.log(`Public Paid Lesson Video: ${paidPub?.videoUrl ? 'Exists' : 'Missing'} (Expected Missing)`);
    
    console.log('\nTesting Secure Lesson Endpoint');
    const secureFree = await request(`/lessons/${freeLessonId}`, {
        headers: { 'Cookie': `accessToken=${tokens.student}` }
    });
    console.log(`Secure Free Lesson: ${secureFree.status} (Expected 200)`);
    
    const securePaid = await request(`/lessons/${paidLessonId}`, {
        headers: { 'Cookie': `accessToken=${tokens.student}` }
    });
    console.log(`Secure Paid Lesson (No Enrollment): ${securePaid.status} (Expected 403)`);

    console.log('\n✅ Preview tests completed.');
}

testFreePreview();
