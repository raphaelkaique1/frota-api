const { Router } = require('express');

function usageRoutes(controller) {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.start);
  router.patch('/:id/finish', controller.finish);

  return router;
}

module.exports = usageRoutes;
