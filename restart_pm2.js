const { execSync } = require('child_process');
try {
  execSync('pm2 restart all');
} catch (e) {
  console.log(e);
}
