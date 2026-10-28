const { ValidationError, NotFoundError, ConflictError } = require('../../errors');
const { requireString, parseDate } = require('../../shared/validators');

class UsageService {
  constructor(usageRepository, carRepository, driverRepository) {
    this.usageRepository = usageRepository;
    this.carRepository = carRepository;
    this.driverRepository = driverRepository;
  }

  start({ carId, driverId, reason, startDate } = {}) {
    requireString(carId, 'carId');
    requireString(driverId, 'driverId');
    const validReason = requireString(reason, 'reason');
    const start = parseDate(startDate, 'startDate') ?? new Date();

    if (!this.carRepository.findById(carId)) {
      throw new NotFoundError('Automóvel não encontrado');
    }
    if (!this.driverRepository.findById(driverId)) {
      throw new NotFoundError('Motorista não encontrado');
    }

    if (this.usageRepository.findActiveByCar(carId)) {
      throw new ConflictError('Automóvel já está em uso por outro motorista');
    }
    if (this.usageRepository.findActiveByDriver(driverId)) {
      throw new ConflictError('Motorista já está utilizando outro automóvel');
    }

    const usage = this.usageRepository.create({
      carId,
      driverId,
      reason: validReason,
      startDate: start.toISOString(),
      endDate: null,
    });

    return this.toResponse(usage);
  }

  finish(id, { endDate } = {}) {
    const usage = this.usageRepository.findById(id);
    if (!usage) {
      throw new NotFoundError('Registro de utilização não encontrado');
    }
    if (usage.endDate) {
      throw new ConflictError('Utilização já foi finalizada');
    }

    const end = parseDate(endDate, 'endDate') ?? new Date();
    if (end < new Date(usage.startDate)) {
      throw new ValidationError('A data de término não pode ser anterior à data de início');
    }

    const finished = this.usageRepository.update(id, { endDate: end.toISOString() });
    return this.toResponse(finished);
  }

  list() {
    return this.usageRepository.findAll().map((usage) => this.toResponse(usage));
  }

  toResponse({ carId, driverId, ...usage }) {
    const driver = this.driverRepository.findById(driverId);
    const car = this.carRepository.findById(carId);

    return {
      ...usage,
      driver: { id: driver.id, name: driver.name },
      car: { id: car.id, plate: car.plate, color: car.color, brand: car.brand },
    };
  }
}

module.exports = UsageService;
