const InMemoryRepository = require('../../shared/InMemoryRepository');

const isActive = (usage) => usage.endDate === null;

class UsageRepository extends InMemoryRepository {
  findActiveByCar(carId) {
    return this.findOne((usage) => usage.carId === carId && isActive(usage));
  }

  findActiveByDriver(driverId) {
    return this.findOne((usage) => usage.driverId === driverId && isActive(usage));
  }

  existsByCar(carId) {
    return this.findOne((usage) => usage.carId === carId) !== null;
  }

  existsByDriver(driverId) {
    return this.findOne((usage) => usage.driverId === driverId) !== null;
  }
}

module.exports = UsageRepository;
