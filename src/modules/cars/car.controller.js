class CarController {
  constructor(carService) {
    this.carService = carService;
  }

  create = (req, res) => {
    const car = this.carService.create(req.body);
    res.status(201).json(car);
  };

  update = (req, res) => {
    const car = this.carService.update(req.params.id, req.body);
    res.json(car);
  };

  delete = (req, res) => {
    this.carService.delete(req.params.id);
    res.status(204).send();
  };

  show = (req, res) => {
    res.json(this.carService.getById(req.params.id));
  };

  list = (req, res) => {
    const { color, brand } = req.query;
    res.json(this.carService.list({ color, brand }));
  };
}

module.exports = CarController;
