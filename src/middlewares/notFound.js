function notFound(req, res) {
  res.status(404).json({ message: `Rota ${req.method} ${req.originalUrl} não encontrada` });
}

module.exports = notFound;
