module.exports = {
  apps: [
    {
      name: "tecyad-backend",
      cwd: "C:\\Users\\Administrator\\Desktop\\TechYad\\backend",
      script: "dist/server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "tecyad-frontend",
      cwd: "C:\\Users\\Administrator\\Desktop\\TechYad\\frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4000",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
