const express = require('express');

const CarRepository = require('./modules/cars/car.repository');
const CarService = require('./modules/cars/car.service');
const CarController = require('./modules/cars/car.controller');
const carRoutes = require('./modules/cars/car.routes');

const DriverRepository = require('./modules/drivers/driver.repository');
const DriverService = require('./modules/drivers/driver.service');
const DriverController = require('./modules/drivers/driver.controller');
const driverRoutes = require('./modules/drivers/driver.routes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const carRepository = new CarRepository();
  const driverRepository = new DriverRepository();

  const carService = new CarService(carRepository);
  const driverService = new DriverService(driverRepository);

  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/cars', carRoutes(new CarController(carService)));
  app.use('/drivers', driverRoutes(new DriverController(driverService)));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
