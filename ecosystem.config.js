module.exports = {
  apps: [
    {
      name: 'alibobo-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: process.env.MONGODB_URI,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      combine_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};