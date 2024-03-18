const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('AuthController Endpoint', () => {
    it('GET /connect responds with status 401 when the authorization header is missing', async () => {
      const response = await request(app).get('/connect');
      expect(response).to.have.status(401);
    });

    it('GET /disconnect responds with status 401 when the X-Token header is missing', async () => {
      const response = await request(app).get('/disconnect');
      expect(response).to.have.status(401);
    });
  });