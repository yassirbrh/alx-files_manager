#!/usr/bin/node

import AppController from '../controllers/AppController';

function loadRoutes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
}

module.exports = loadRoutes;
