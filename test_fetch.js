const axios = require('axios');
axios.get('http://localhost:5000/api/v1/admin/dashboard').then(res => {
  console.log(res.data);
}).catch(err => {
  console.log(err.response.data);
});
