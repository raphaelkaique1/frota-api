const { ValidationError } = require('../errors');

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`O campo '${field}' é obrigatório`);
  }
  return value.trim();
}

function parseDate(value, field) {
  if (value === undefined || value === null) return null;

  const date = new Date(value);
  if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
    throw new ValidationError(`O campo '${field}' deve ser uma data válida (ISO 8601)`);
  }
  return date;
}

module.exports = { requireString, parseDate };
