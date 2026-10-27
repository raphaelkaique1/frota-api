const { randomUUID } = require('node:crypto');

/**
 * Repositório genérico em memória. Sempre devolve cópias dos registros
 * para que quem chama não altere o estado interno sem passar pelo update.
 */
class InMemoryRepository {
  constructor() {
    this.items = new Map();
  }

  create(data) {
    const item = { id: randomUUID(), ...data };
    this.items.set(item.id, item);
    return { ...item };
  }

  findById(id) {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  findAll(predicate = () => true) {
    return [...this.items.values()].filter(predicate).map((item) => ({ ...item }));
  }

  findOne(predicate) {
    const item = [...this.items.values()].find(predicate);
    return item ? { ...item } : null;
  }

  update(id, data) {
    const current = this.items.get(id);
    if (!current) return null;

    const updated = { ...current, ...data, id };
    this.items.set(id, updated);
    return { ...updated };
  }

  delete(id) {
    return this.items.delete(id);
  }
}

module.exports = InMemoryRepository;
