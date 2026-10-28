const { ValidationError, NotFoundError, ConflictError } = require('../../errors');
const { requireString } = require('../../shared/validators');

// Aceita tanto o padrão antigo (ABC1234) quanto o Mercosul (ABC1D23)
const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

const normalizePlate = (plate) => plate.toUpperCase().replace('-', '');
const equalsIgnoreCase = (a, b) => a.toLowerCase() === b.toLowerCase();

class CarService {
  constructor(carRepository, usageRepository) {
    this.carRepository = carRepository;
    this.usageRepository = usageRepository;
  }

  create(data) {
    const car = this.validate(data);
    this.ensurePlateIsAvailable(car.plate);

    return this.carRepository.create(car);
  }

  update(id, data) {
    this.getById(id);

    const car = this.validate(data);
    this.ensurePlateIsAvailable(car.plate, id);

    return this.carRepository.update(id, car);
  }

  delete(id) {
    this.getById(id);

    if (this.usageRepository.existsByCar(id)) {
      throw new ConflictError('Automóvel possui registros de utilização e não pode ser excluído');
    }

    this.carRepository.delete(id);
  }

  getById(id) {
    const car = this.carRepository.findById(id);
    if (!car) {
      throw new NotFoundError('Automóvel não encontrado');
    }
    return car;
  }

  list({ color, brand } = {}) {
    return this.carRepository.findAll(
      (car) =>
        (!color || equalsIgnoreCase(car.color, color)) &&
        (!brand || equalsIgnoreCase(car.brand, brand)),
    );
  }

  validate({ plate, color, brand } = {}) {
    const normalizedPlate = normalizePlate(requireString(plate, 'plate'));

    if (!PLATE_REGEX.test(normalizedPlate)) {
      throw new ValidationError('Placa inválida. Use o formato ABC1234 ou ABC1D23');
    }

    return {
      plate: normalizedPlate,
      color: requireString(color, 'color'),
      brand: requireString(brand, 'brand'),
    };
  }

  ensurePlateIsAvailable(plate, ignoreId) {
    const existing = this.carRepository.findByPlate(plate);
    if (existing && existing.id !== ignoreId) {
      throw new ConflictError('Já existe um automóvel cadastrado com essa placa');
    }
  }
}

module.exports = CarService;
