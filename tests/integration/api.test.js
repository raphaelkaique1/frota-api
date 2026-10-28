const request = require('supertest');
const createApp = require('../../src/app');

describe('API', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  const createCar = (data = {}) =>
    request(app)
      .post('/cars')
      .send({ plate: 'ABC1D23', color: 'Prata', brand: 'Fiat', ...data });

  const createDriver = (name = 'João') => request(app).post('/drivers').send({ name });

  describe('/cars', () => {
    it('faz o CRUD completo de automóvel', async () => {
      const created = await createCar();
      expect(created.status).toBe(201);

      const { id } = created.body;

      const found = await request(app).get(`/cars/${id}`);
      expect(found.status).toBe(200);
      expect(found.body.plate).toBe('ABC1D23');

      const updated = await request(app)
        .put(`/cars/${id}`)
        .send({ plate: 'ABC1D23', color: 'Vermelho', brand: 'Fiat' });
      expect(updated.status).toBe(200);
      expect(updated.body.color).toBe('Vermelho');

      const deleted = await request(app).delete(`/cars/${id}`);
      expect(deleted.status).toBe(204);

      const notFound = await request(app).get(`/cars/${id}`);
      expect(notFound.status).toBe(404);
    });

    it('filtra por cor e marca via query string', async () => {
      await createCar({ plate: 'AAA1111', color: 'Preto', brand: 'Fiat' });
      await createCar({ plate: 'BBB2222', color: 'Preto', brand: 'Honda' });

      const res = await request(app).get('/cars').query({ color: 'preto', brand: 'honda' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].plate).toBe('BBB2222');
    });

    it('retorna 400 com payload inválido', async () => {
      const res = await request(app).post('/cars').send({ color: 'Preto' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("O campo 'plate' é obrigatório");
    });

    it('retorna 400 quando o corpo não é um JSON válido', async () => {
      const res = await request(app)
        .post('/cars')
        .set('Content-Type', 'application/json')
        .send('{"plate": ');

      expect(res.status).toBe(400);
    });
  });

  describe('/drivers', () => {
    it('faz o CRUD completo de motorista', async () => {
      const created = await createDriver('Maria');
      expect(created.status).toBe(201);

      const { id } = created.body;

      const updated = await request(app).put(`/drivers/${id}`).send({ name: 'Maria Clara' });
      expect(updated.body.name).toBe('Maria Clara');

      const found = await request(app).get(`/drivers/${id}`);
      expect(found.body.name).toBe('Maria Clara');

      expect((await request(app).delete(`/drivers/${id}`)).status).toBe(204);
      expect((await request(app).get(`/drivers/${id}`)).status).toBe(404);
    });

    it('filtra por nome', async () => {
      await createDriver('Ana Souza');
      await createDriver('Bruno Lima');

      const res = await request(app).get('/drivers?name=ana');

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Ana Souza');
    });
  });

  describe('/usages', () => {
    it('inicia, lista e finaliza uma utilização', async () => {
      const car = (await createCar()).body;
      const driver = (await createDriver()).body;

      const started = await request(app).post('/usages').send({
        carId: car.id,
        driverId: driver.id,
        reason: 'Visita técnica',
        startDate: '2026-10-27T09:00:00.000Z',
      });
      expect(started.status).toBe(201);

      const finished = await request(app)
        .patch(`/usages/${started.body.id}/finish`)
        .send({ endDate: '2026-10-27T11:00:00.000Z' });
      expect(finished.status).toBe(200);
      expect(finished.body.endDate).toBe('2026-10-27T11:00:00.000Z');

      const list = await request(app).get('/usages');
      expect(list.body).toEqual([
        {
          id: started.body.id,
          reason: 'Visita técnica',
          startDate: '2026-10-27T09:00:00.000Z',
          endDate: '2026-10-27T11:00:00.000Z',
          driver: { id: driver.id, name: 'João' },
          car: { id: car.id, plate: 'ABC1D23', color: 'Prata', brand: 'Fiat' },
        },
      ]);
    });

    it('retorna 409 quando o automóvel já está em uso', async () => {
      const car = (await createCar()).body;
      const joao = (await createDriver('João')).body;
      const maria = (await createDriver('Maria')).body;

      await request(app).post('/usages').send({ carId: car.id, driverId: joao.id, reason: 'Entrega' });
      const res = await request(app)
        .post('/usages')
        .send({ carId: car.id, driverId: maria.id, reason: 'Reunião' });

      expect(res.status).toBe(409);
    });

    it('retorna 409 ao excluir automóvel que já foi utilizado', async () => {
      const car = (await createCar()).body;
      const driver = (await createDriver()).body;
      await request(app).post('/usages').send({ carId: car.id, driverId: driver.id, reason: 'Entrega' });

      const res = await request(app).delete(`/cars/${car.id}`);

      expect(res.status).toBe(409);
    });
  });

  it('retorna 404 para rota inexistente', async () => {
    const res = await request(app).get('/nao-existe');
    expect(res.status).toBe(404);
  });
});
