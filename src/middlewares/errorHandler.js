const { AppError } = require('../errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido no corpo da requisição' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor' });
}

module.exports = errorHandler;
