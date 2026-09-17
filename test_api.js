const axios = require('axios');

async function test() {
  const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
    email: 'admin@tekyad.com', password: 'password123'
  });
  
  const cookie = res.headers['set-cookie'][0].split(';')[0];
  
  const statsRes = await axios.get('http://localhost:5000/api/v1/admin/dashboard', {
    headers: { Cookie: cookie }
  });
  
  console.log("Stats Response Keys:", Object.keys(statsRes.data));
  console.log("Stats Data Keys:", Object.keys(statsRes.data.data));
}
test();
