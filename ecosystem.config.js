module.exports = {
  apps: [
    {
      name: "tecyad-frontend",
      cwd: "C:\\Users\\Administrator\\Desktop\\TechYad\\frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4000",
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
