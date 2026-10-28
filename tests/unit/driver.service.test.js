const DriverService = require('../../src/modules/drivers/driver.service');
const DriverRepository = require('../../src/modules/drivers/driver.repository');
const UsageRepository = require('../../src/modules/usages/usage.repository');
const { ValidationError, NotFoundError, ConflictError } = require('../../src/errors');

describe('DriverService', () => {
  let driverService;
  let usageRepository;

  beforeEach(() => {
    usageRepository = new UsageRepository();
    driverService = new DriverService(new DriverRepository(), usageRepository);
  });

  it('cadastra um motorista', () => {
    const driver = driverService.create({ name: ' João Silva ' });
    expect(driver).toEqual({ id: expect.any(String), name: 'João Silva' });
  });

  it('exige o nome do motorista', () => {
    expect(() => driverService.create({})).toThrow(ValidationError);
    expect(() => driverService.create({ name: '' })).toThrow(ValidationError);
  });

  it('atualiza o nome do motorista', () => {
    const { id } = driverService.create({ name: 'João' });

    driverService.update(id, { name: 'João Pedro' });

    expect(driverService.getById(id).name).toBe('João Pedro');
  });

  it('lança NotFoundError ao buscar motorista inexistente', () => {
    expect(() => driverService.getById('nao-existe')).toThrow(NotFoundError);
  });

  it('exclui o motorista', () => {
    const { id } = driverService.create({ name: 'Maria' });

    driverService.delete(id);

    expect(driverService.list()).toHaveLength(0);
  });

  it('não exclui motorista com histórico de utilização', () => {
    const { id } = driverService.create({ name: 'Maria' });
    usageRepository.create({ carId: 'qualquer', driverId: id, endDate: null });

    expect(() => driverService.delete(id)).toThrow(ConflictError);
  });

  it('filtra a listagem por parte do nome', () => {
    driverService.create({ name: 'Ana Souza' });
    driverService.create({ name: 'Carlos Souza' });
    driverService.create({ name: 'Bruno Lima' });

    expect(driverService.list({ name: 'souza' })).toHaveLength(2);
    expect(driverService.list({ name: 'Bruno' })[0].name).toBe('Bruno Lima');
    expect(driverService.list()).toHaveLength(3);
  });
});
