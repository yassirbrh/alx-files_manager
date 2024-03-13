#!/usr/bin/node

import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

function loadRoutes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  //app.get('/disconnect', AuthController.getDisconnect);
  //app.get('/users/me', UsersController.getMe);
}

module.exports = loadRoutes;
