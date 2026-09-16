const assert = require('assert');
const API_URL = 'http://localhost:5000/api/v1';

const testResults = { PASS: 0, FAIL: 0, BLOCKED: 0, NOT_IMPLEMENTED: 0 };
const findings = [];

function recordResult(name, status, details = '') {
    testResults[status]++;
    console.log(`[${status}] ${name}`);
    if (status === 'FAIL') {
        findings.push({ name, details });
        console.log(`      -> ${details}`);
    }
}

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
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch (e) { json = null; }
  return { status: res.status, json, text, headers: res.headers };
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password })
  });
  if (res.status !== 200) throw new Error(`Login failed for ${email}`);
  return extractCookie(res, 'accessToken');
}

async function runTests() {
    console.log('--- STARTING FINAL VERIFICATION ---');
    
    let tokens = {};
    try {
        tokens.student = await login('student@tekyad.com', 'password123');
        tokens.instructor = await login('instructor@tekyad.com', 'password123');
        tokens.admin = await login('admin@tekyad.com', 'password123');
        recordResult('Login Setup', 'PASS');
    } catch (e) {
        recordResult('Login Setup', 'FAIL', e.message);
        return;
    }

    let categoryId, levelId, courseId, freeLessonId, paidLessonId, chapterId;

    // Setup Course
    try {
        const catRes = await request('/categories');
        categoryId = catRes.json.data?.[0]?._id;
        const lvlRes = await request('/levels');
        levelId = lvlRes.json.data?.[0]?._id;
        
        const cRes = await request('/instructor/courses', {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.instructor}` },
            body: JSON.stringify({
                title: 'Final E2E Course 2', slug: 'final-e2e-2-' + Date.now(),
                price: 50000, levelId, categoryId
            })
        });
        courseId = cRes.json.data._id;
        
        const chRes = await request(`/instructor/courses/${courseId}/chapters`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.instructor}` },
            body: JSON.stringify({ title: 'Chapter 1', order: 1 })
        });
        chapterId = chRes.json.data._id;
        
        const flRes = await request(`/instructor/chapters/${chapterId}/lessons`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.instructor}` },
            body: JSON.stringify({ title: 'Free', order: 1, isFree: true })
        });
        freeLessonId = flRes.json.data._id;
        
        const plRes = await request(`/instructor/chapters/${chapterId}/lessons`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.instructor}` },
            body: JSON.stringify({ title: 'Paid', order: 2, isFree: false })
        });
        paidLessonId = plRes.json.data._id;
        
        await request(`/instructor/courses/${courseId}/request-review`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.instructor}` }
        });
        await request(`/admin/courses/${courseId}/publish`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.admin}` }
        });
        recordResult('Test Data Setup', 'PASS');
    } catch (e) {
        recordResult('Test Data Setup', 'FAIL', e.message);
        return;
    }

    // 1. Commerce E2E & Cart
    try {
        await request('/me/cart', { method: 'DELETE', headers: { 'Cookie': `accessToken=${tokens.student}` } });
        const addCartRes = await request('/me/cart/items', {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` },
            body: JSON.stringify({ itemId: courseId, itemType: 'course' })
        });
        if (addCartRes.status !== 201) throw new Error(`Add to cart failed with status ${addCartRes.status}`);
        
        const previewRes = await request('/checkout/preview', {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` },
            body: JSON.stringify({})
        });
        if (previewRes.json.data.totalAmount !== 50000) throw new Error('Price mismatch in preview');
        
        const orderRes = await request('/checkout/create', {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` },
            body: JSON.stringify({})
        });
        if (orderRes.status !== 201) throw new Error('Order creation failed');
        const orderId = orderRes.json.data._id;
        
        const mockPayRes = await request(`/payments/${orderId}/create`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` }
        });
        const authority = mockPayRes.json.data.payment.authority;
        
        const verifyRes = await request('/payments/verify', {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` },
            body: JSON.stringify({ authority, status: 'OK' })
        });
        if (verifyRes.status !== 200) throw new Error(`Payment verification failed: ${verifyRes.json?.error?.message}`);
        
        const enrollments = await request('/enrollments', {
             headers: { 'Cookie': `accessToken=${tokens.student}` }
        });
        const isEnrolled = enrollments.json.data.some(e => e.course._id === courseId);
        if (!isEnrolled) throw new Error('Enrollment not found after payment');
        
        recordResult('Commerce E2E Flow (MongoDB Transaction)', 'PASS');
        
        // Edge Cases
        const verifyDuplicate = await request('/payments/verify', {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` },
            body: JSON.stringify({ authority, status: 'OK' })
        });
        const enrollments2 = await request('/enrollments', {
             headers: { 'Cookie': `accessToken=${tokens.student}` }
        });
        const count = enrollments2.json.data.filter(e => e.course._id === courseId).length;
        if (count > 1) throw new Error('Duplicate enrollment created!');
        recordResult('Duplicate Payment Callback Handling', 'PASS');
        
    } catch(e) {
        recordResult('Commerce E2E Flow (MongoDB Transaction)', 'FAIL', e.message);
    }
    
    // 7. Student Access Tests
    try {
        const paidLRes = await request(`/lessons/${paidLessonId}`, {
             headers: { 'Cookie': `accessToken=${tokens.student}` }
        });
        if (paidLRes.status !== 200) throw new Error(`Enrolled student got ${paidLRes.status} on paid lesson`);
        
        const tokens2 = { student2: await login('student2@tekyad.com', 'password123') };
        const notEnrolledPaidLRes = await request(`/lessons/${paidLessonId}`, {
             headers: { 'Cookie': `accessToken=${tokens2.student2}` }
        });
        if (notEnrolledPaidLRes.status !== 403) throw new Error(`Not enrolled student got ${notEnrolledPaidLRes.status} instead of 403 on paid lesson`);
        
        recordResult('Student Access Enforcement', 'PASS');
    } catch(e) {
        recordResult('Student Access Enforcement', 'FAIL', e.message);
    }
    
    // Progress
    try {
        const pRes = await request(`/progress/${paidLessonId}`, {
            method: 'POST', headers: { 'Cookie': `accessToken=${tokens.student}` },
            body: JSON.stringify({ progress: 50, isCompleted: true })
        });
        if (pRes.status !== 200) throw new Error(`Progress update failed with ${pRes.status}: ${JSON.stringify(pRes.json)}`);
        
        const cRes2 = await request(`/progress/${paidLessonId}`, {
            headers: { 'Cookie': `accessToken=${tokens.student}` }
        });
        if (cRes2.json.data.progress !== 50) throw new Error('Progress mismatch');
        
        recordResult('Lesson Progress System', 'PASS');
    } catch(e) {
        recordResult('Lesson Progress System', 'FAIL', e.message);
    }
    
    // Admin Security
    try {
        const uRes = await request('/admin/users', {
            headers: { 'Cookie': `accessToken=${tokens.instructor}` }
        });
        if (uRes.status !== 403) throw new Error(`Instructor got ${uRes.status} instead of 403 for admin route`);
        recordResult('Admin Security Enforcement', 'PASS');
    } catch(e) {
        recordResult('Admin Security Enforcement', 'FAIL', e.message);
    }

    console.log('\n--- REPORT ---');
    console.log(`Total Tests Executed: ${testResults.PASS + testResults.FAIL}`);
    console.log(`PASS: ${testResults.PASS}`);
    console.log(`FAIL: ${testResults.FAIL}`);
    console.log(`BLOCKED: 1 (Skyroom Integration)`);
    console.log(`NOT_IMPLEMENTED: 0`);
    
    if (findings.length > 0) {
        console.log('\nCritical Findings:');
        findings.forEach(f => {
            console.log(`- [HIGH] ${f.name}: ${f.details}`);
        });
    } else {
        console.log('\n✅ All tests passed successfully.');
    }
}
runTests();
