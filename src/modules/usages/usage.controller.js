class UsageController {
  constructor(usageService) {
    this.usageService = usageService;
  }

  start = (req, res) => {
    const usage = this.usageService.start(req.body);
    res.status(201).json(usage);
  };

  finish = (req, res) => {
    const usage = this.usageService.finish(req.params.id, req.body);
    res.json(usage);
  };

  list = (req, res) => {
    res.json(this.usageService.list());
  };
}

module.exports = UsageController;
