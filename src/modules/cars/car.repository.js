const InMemoryRepository = require('../../shared/InMemoryRepository');

class CarRepository extends InMemoryRepository {
  findByPlate(plate) {
    return this.findOne((car) => car.plate === plate);
  }
}

module.exports = CarRepository;
