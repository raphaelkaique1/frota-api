const { NotFoundError } = require('../../errors');
const { requireString } = require('../../shared/validators');

class DriverService {
  constructor(driverRepository) {
    this.driverRepository = driverRepository;
  }

  create(data) {
    return this.driverRepository.create(this.validate(data));
  }

  update(id, data) {
    this.getById(id);
    return this.driverRepository.update(id, this.validate(data));
  }

  delete(id) {
    this.getById(id);
    this.driverRepository.delete(id);
  }

  getById(id) {
    const driver = this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundError('Motorista não encontrado');
    }
    return driver;
  }

  list({ name } = {}) {
    if (!name) return this.driverRepository.findAll();

    const search = name.toLowerCase();
    return this.driverRepository.findAll((driver) => driver.name.toLowerCase().includes(search));
  }

  validate({ name } = {}) {
    return { name: requireString(name, 'name') };
  }
}

module.exports = DriverService;
