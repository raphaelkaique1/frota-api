const UsageService = require('../../src/modules/usages/usage.service');
const UsageRepository = require('../../src/modules/usages/usage.repository');
const CarRepository = require('../../src/modules/cars/car.repository');
const DriverRepository = require('../../src/modules/drivers/driver.repository');
const { ValidationError, NotFoundError, ConflictError } = require('../../src/errors');

describe('UsageService', () => {
  let usageService;
  let carRepository;
  let driverRepository;
  let car;
  let driver;

  beforeEach(() => {
    carRepository = new CarRepository();
    driverRepository = new DriverRepository();
    usageService = new UsageService(new UsageRepository(), carRepository, driverRepository);

    car = carRepository.create({ plate: 'ABC1234', color: 'Preto', brand: 'Fiat' });
    driver = driverRepository.create({ name: 'João' });
  });

  describe('start', () => {
    it('registra a utilização com os dados do motorista e do automóvel', () => {
      const usage = usageService.start({
        carId: car.id,
        driverId: driver.id,
        reason: 'Visita a cliente',
        startDate: '2026-10-27T08:00:00.000Z',
      });

      expect(usage).toEqual({
        id: expect.any(String),
        reason: 'Visita a cliente',
        startDate: '2026-10-27T08:00:00.000Z',
        endDate: null,
        driver: { id: driver.id, name: 'João' },
        car: { id: car.id, plate: 'ABC1234', color: 'Preto', brand: 'Fiat' },
      });
    });

    it('usa a data atual quando a data de início não é informada', () => {
      const before = Date.now();
      const usage = usageService.start({ carId: car.id, driverId: driver.id, reason: 'Entrega' });

      expect(new Date(usage.startDate).getTime()).toBeGreaterThanOrEqual(before);
    });

    it('exige o motivo da utilização', () => {
      expect(() => usageService.start({ carId: car.id, driverId: driver.id })).toThrow(
        "O campo 'reason' é obrigatório",
      );
    });

    it('rejeita data de início inválida', () => {
      expect(() =>
        usageService.start({ carId: car.id, driverId: driver.id, reason: 'x', startDate: 'ontem' }),
      ).toThrow(ValidationError);
    });

    it('lança NotFoundError para automóvel ou motorista inexistente', () => {
      expect(() =>
        usageService.start({ carId: 'nao-existe', driverId: driver.id, reason: 'x' }),
      ).toThrow('Automóvel não encontrado');
      expect(() => usageService.start({ carId: car.id, driverId: 'nao-existe', reason: 'x' })).toThrow(
        NotFoundError,
      );
    });

    it('não permite que o automóvel seja usado por dois motoristas ao mesmo tempo', () => {
      const otherDriver = driverRepository.create({ name: 'Maria' });
      usageService.start({ carId: car.id, driverId: driver.id, reason: 'Entrega' });

      expect(() =>
        usageService.start({ carId: car.id, driverId: otherDriver.id, reason: 'Reunião' }),
      ).toThrow(new ConflictError('Automóvel já está em uso por outro motorista'));
    });

    it('não permite que o motorista use dois automóveis ao mesmo tempo', () => {
      const otherCar = carRepository.create({ plate: 'XYZ9876', color: 'Branco', brand: 'VW' });
      usageService.start({ carId: car.id, driverId: driver.id, reason: 'Entrega' });

      expect(() =>
        usageService.start({ carId: otherCar.id, driverId: driver.id, reason: 'Reunião' }),
      ).toThrow(new ConflictError('Motorista já está utilizando outro automóvel'));
    });

    it('libera automóvel e motorista depois que a utilização é finalizada', () => {
      const first = usageService.start({ carId: car.id, driverId: driver.id, reason: 'Entrega' });
      usageService.finish(first.id);

      const second = usageService.start({ carId: car.id, driverId: driver.id, reason: 'Retorno' });

      expect(second.endDate).toBeNull();
      expect(usageService.list()).toHaveLength(2);
    });
  });

  describe('finish', () => {
    let usage;

    beforeEach(() => {
      usage = usageService.start({
        carId: car.id,
        driverId: driver.id,
        reason: 'Entrega',
        startDate: '2026-10-27T08:00:00.000Z',
      });
    });

    it('grava a data de término informada', () => {
      const finished = usageService.finish(usage.id, { endDate: '2026-10-27T12:30:00.000Z' });
      expect(finished.endDate).toBe('2026-10-27T12:30:00.000Z');
    });

    it('usa a data atual quando a data de término não é informada', () => {
      const finished = usageService.finish(usage.id);
      expect(finished.endDate).not.toBeNull();
    });

    it('não aceita data de término anterior ao início', () => {
      expect(() => usageService.finish(usage.id, { endDate: '2026-10-26T08:00:00.000Z' })).toThrow(
        ValidationError,
      );
    });

    it('não finaliza a mesma utilização duas vezes', () => {
      usageService.finish(usage.id);
      expect(() => usageService.finish(usage.id)).toThrow(ConflictError);
    });

    it('lança NotFoundError para utilização inexistente', () => {
      expect(() => usageService.finish('nao-existe')).toThrow(NotFoundError);
    });
  });
});
