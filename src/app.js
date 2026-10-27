const express = require('express');

const CarRepository = require('./modules/cars/car.repository');
const CarService = require('./modules/cars/car.service');
const CarController = require('./modules/cars/car.controller');
const carRoutes = require('./modules/cars/car.routes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const carRepository = new CarRepository();
  const carService = new CarService(carRepository);

  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/cars', carRoutes(new CarController(carService)));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
