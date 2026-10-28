class DriverController {
  constructor(driverService) {
    this.driverService = driverService;
  }

  create = (req, res) => {
    const driver = this.driverService.create(req.body);
    res.status(201).json(driver);
  };

  update = (req, res) => {
    const driver = this.driverService.update(req.params.id, req.body);
    res.json(driver);
  };

  delete = (req, res) => {
    this.driverService.delete(req.params.id);
    res.status(204).send();
  };

  show = (req, res) => {
    res.json(this.driverService.getById(req.params.id));
  };

  list = (req, res) => {
    res.json(this.driverService.list({ name: req.query.name }));
  };
}

module.exports = DriverController;
