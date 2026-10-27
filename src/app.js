const express = require('express');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
