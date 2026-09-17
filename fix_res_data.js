const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let code = fs.readFileSync(filePath, 'utf8');
    if (code.includes('res.data?.data')) {
      code = code.replace(/res\.data\?\.data/g, 'res.data');
      fs.writeFileSync(filePath, code);
      console.log('Fixed', filePath);
    }
  }
});
console.log('Done');
