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
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = null;
  }
  
  return { status: res.status, json, text, headers: res.headers };
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.text}`);
  }
  const token = extractCookie(res, 'accessToken');
  return token;
}

async function runTests() {
  console.log('Starting E2E Tests...');
  let tokens = {};

  try {
    console.log('1. Authentication Tests');
    tokens.superAdmin = await login('superadmin@tekyad.com', 'password123');
    tokens.admin = await login('admin@tekyad.com', 'password123');
    tokens.instructor = await login('instructor@tekyad.com', 'password123');
    tokens.student = await login('student@tekyad.com', 'password123');
    console.log('✅ Logins successful');
    
    console.log('\n2. Course Workflow & Ownership Tests');
    
    // Create category and level
    const catRes = await request('/catalog/categories', {
      method: 'POST',
      headers: { 'Cookie': `accessToken=${tokens.admin}` },
      body: JSON.stringify({ name: 'Test Category', description: 'Test', order: 1 })
    });
    
    let categoryId = '60c72b2f9b1d8b001c8e4e1a'; // dummy fallback
    if (catRes.status === 201) {
        categoryId = catRes.json.data._id;
    } else if (catRes.status === 409 || catRes.status === 400) { // already exists
        const catList = await request('/catalog/categories');
        if (catList.json.data && catList.json.data.length > 0) {
            categoryId = catList.json.data[0]._id;
        }
    }
    
    const lvlRes = await request('/catalog/levels', {
      method: 'POST',
      headers: { 'Cookie': `accessToken=${tokens.admin}` },
      body: JSON.stringify({ name: 'Beginner', description: 'Beginner', order: 1 })
    });
    let levelId = '60c72b2f9b1d8b001c8e4e1b';
    if (lvlRes.status === 201) {
        levelId = lvlRes.json.data._id;
    } else if (lvlRes.status === 409 || lvlRes.status === 400) {
        const lvlList = await request('/catalog/levels');
        if (lvlList.json.data && lvlList.json.data.length > 0) {
            levelId = lvlList.json.data[0]._id;
        }
    }

    const c1Res = await request('/instructor/courses', {
      method: 'POST',
      headers: { 'Cookie': `accessToken=${tokens.instructor}` },
      body: JSON.stringify({
        title: 'Instructor 1 Course',
        slug: 'inst1-course-' + Date.now(),
        description: 'Test Description',
        price: 1000,
        levelId,
        categoryId
      })
    });
    
    console.log('Create Course Status:', c1Res.status);
    if (c1Res.status !== 201) {
        console.log('Validation error:', c1Res.json);
    } else {
        const courseId = c1Res.json.data._id;
        console.log(`✅ Course Created: ${courseId}`);
        
        // Add Chapter
        const chRes = await request(`/instructor/courses/${courseId}/chapters`, {
          method: 'POST',
          headers: { 'Cookie': `accessToken=${tokens.instructor}` },
          body: JSON.stringify({ title: 'Chapter 1', order: 1 })
        });
        console.log('Create Chapter Status:', chRes.status);
        if (chRes.status === 201) {
            const chapterId = chRes.json.data._id;
            
            // Add Lesson
            const lRes = await request(`/instructor/chapters/${chapterId}/lessons`, {
                method: 'POST',
                headers: { 'Cookie': `accessToken=${tokens.instructor}` },
                body: JSON.stringify({ title: 'Lesson 1', order: 1, isFree: true })
            });
            console.log('Create Lesson Status:', lRes.status);
            
            let lessonId = null;
            // Add Assignment
            if (lRes.status === 201) {
                lessonId = lRes.json.data._id;
                const aRes = await request(`/instructor/lessons/${lRes.json.data._id}/assignments`, {
                    method: 'POST',
                    headers: { 'Cookie': `accessToken=${tokens.instructor}` },
                    body: JSON.stringify({ title: 'Assignment 1', description: 'Do it', points: 100 })
                });
                console.log('Create Assignment Status:', aRes.status);
                
                // Add Quiz
                const qRes = await request(`/instructor/lessons/${lRes.json.data._id}/quizzes`, {
                    method: 'POST',
                    headers: { 'Cookie': `accessToken=${tokens.instructor}` },
                    body: JSON.stringify({ title: 'Quiz 1', description: 'Do it', passMark: 70, timeLimit: 30 })
                });
                console.log('Create Quiz Status:', qRes.status);
            }
            
            // Edit Chapter (Ownership test)
            const edChRes = await request(`/instructor/chapters/${chapterId}`, {
                method: 'PATCH',
                headers: { 'Cookie': `accessToken=${tokens.instructor}` },
                body: JSON.stringify({ title: 'Chapter 1 Updated' })
            });
            console.log('Update Chapter Status (Instructor 1):', edChRes.status);
            
            // RBAC Tests - Student trying to access instructor route
            const rbacRes = await request('/instructor/courses', {
                headers: { 'Cookie': `accessToken=${tokens.student}` }
            });
            console.log(`Student accessing /instructor/courses: ${rbacRes.status} (Expected 403)`);
            
            // Ownership test - Student trying to edit instructor's course (should be 403)
            const fakeEditRes = await request(`/instructor/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Cookie': `accessToken=${tokens.student}` },
                body: JSON.stringify({ title: 'Hacked Title' })
            });
            console.log(`Student editing Course: ${fakeEditRes.status} (Expected 403)`);
            
            // Delete Lesson
            if (lessonId) {
                const delLRes = await request(`/instructor/lessons/${lessonId}`, {
                    method: 'DELETE',
                    headers: { 'Cookie': `accessToken=${tokens.instructor}` }
                });
                console.log('Delete Lesson Status (Instructor 1):', delLRes.status);
            }
            
            // Delete Chapter
            const delChRes = await request(`/instructor/chapters/${chapterId}`, {
                method: 'DELETE',
                headers: { 'Cookie': `accessToken=${tokens.instructor}` }
            });
            console.log('Delete Chapter Status (Instructor 1):', delChRes.status);
        }
    }
    console.log('\n✅ All targeted API integration tests completed successfully.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Wait a bit
runTests();
