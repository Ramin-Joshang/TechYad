const fs = require('fs');

let routes = fs.readFileSync('backend/src/routes/index.ts', 'utf8');

// Replace the health check to include DB status
routes = routes.replace(
  `router.get('/health', (req, res) => {
  sendSuccess(res, { timestamp: new Date().toISOString() }, 'System is healthy');
});`,
  `import mongoose from 'mongoose';

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : dbState === 3 ? 'disconnecting' : 'disconnected';
  
  sendSuccess(res, { 
    timestamp: new Date().toISOString(),
    api: 'ok',
    database: dbStatus,
    storage: 'Not Configured',
    externalIntegrations: 'Not Configured'
  }, 'System status retrieved');
});`
);

fs.writeFileSync('backend/src/routes/index.ts', routes);
console.log('Health check updated');
