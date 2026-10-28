const CarService = require('../../src/modules/cars/car.service');
const CarRepository = require('../../src/modules/cars/car.repository');
const UsageRepository = require('../../src/modules/usages/usage.repository');
const { ValidationError, NotFoundError, ConflictError } = require('../../src/errors');

describe('CarService', () => {
  let carService;
  let usageRepository;

  beforeEach(() => {
    usageRepository = new UsageRepository();
    carService = new CarService(new CarRepository(), usageRepository);
  });

  describe('create', () => {
    it('cadastra um automóvel e normaliza a placa', () => {
      const car = carService.create({ plate: 'abc-1d23', color: 'Prata', brand: 'Fiat' });

      expect(car).toEqual({
        id: expect.any(String),
        plate: 'ABC1D23',
        color: 'Prata',
        brand: 'Fiat',
      });
    });

    it.each([
      [{ color: 'Prata', brand: 'Fiat' }, 'plate'],
      [{ plate: 'ABC1234', brand: 'Fiat' }, 'color'],
      [{ plate: 'ABC1234', color: 'Prata', brand: '  ' }, 'brand'],
    ])('rejeita quando falta o campo obrigatório (%o)', (data, field) => {
      expect(() => carService.create(data)).toThrow(`O campo '${field}' é obrigatório`);
    });

    it('rejeita placa em formato inválido', () => {
      expect(() => carService.create({ plate: '1234ABC', color: 'Preto', brand: 'VW' })).toThrow(
        ValidationError,
      );
    });

    it('não permite placa duplicada', () => {
      carService.create({ plate: 'ABC1234', color: 'Preto', brand: 'VW' });

      expect(() => carService.create({ plate: 'abc-1234', color: 'Branco', brand: 'Fiat' })).toThrow(
        ConflictError,
      );
    });
  });

  describe('update', () => {
    it('atualiza os dados do automóvel', () => {
      const { id } = carService.create({ plate: 'ABC1234', color: 'Preto', brand: 'VW' });

      const updated = carService.update(id, { plate: 'ABC1234', color: 'Azul', brand: 'VW' });

      expect(updated.color).toBe('Azul');
      expect(carService.getById(id).color).toBe('Azul');
    });

    it('não permite trocar para uma placa de outro automóvel', () => {
      carService.create({ plate: 'AAA1111', color: 'Preto', brand: 'VW' });
      const { id } = carService.create({ plate: 'BBB2222', color: 'Preto', brand: 'VW' });

      expect(() => carService.update(id, { plate: 'AAA1111', color: 'Preto', brand: 'VW' })).toThrow(
        ConflictError,
      );
    });

    it('lança NotFoundError para id inexistente', () => {
      expect(() =>
        carService.update('nao-existe', { plate: 'ABC1234', color: 'Preto', brand: 'VW' }),
      ).toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('exclui o automóvel', () => {
      const { id } = carService.create({ plate: 'ABC1234', color: 'Preto', brand: 'VW' });

      carService.delete(id);

      expect(() => carService.getById(id)).toThrow(NotFoundError);
    });

    it('não exclui automóvel com histórico de utilização', () => {
      const { id } = carService.create({ plate: 'ABC1234', color: 'Preto', brand: 'VW' });
      usageRepository.create({ carId: id, driverId: 'qualquer', endDate: null });

      expect(() => carService.delete(id)).toThrow(ConflictError);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      carService.create({ plate: 'AAA1111', color: 'Preto', brand: 'Fiat' });
      carService.create({ plate: 'BBB2222', color: 'Branco', brand: 'Fiat' });
      carService.create({ plate: 'CCC3333', color: 'Preto', brand: 'Volkswagen' });
    });

    it('lista todos sem filtro', () => {
      expect(carService.list()).toHaveLength(3);
    });

    it('filtra por cor ignorando maiúsculas', () => {
      const cars = carService.list({ color: 'preto' });
      expect(cars.map((car) => car.plate)).toEqual(['AAA1111', 'CCC3333']);
    });

    it('filtra por marca', () => {
      expect(carService.list({ brand: 'FIAT' })).toHaveLength(2);
    });

    it('combina os filtros de cor e marca', () => {
      const cars = carService.list({ color: 'Preto', brand: 'Fiat' });
      expect(cars).toHaveLength(1);
      expect(cars[0].plate).toBe('AAA1111');
    });
  });
});
