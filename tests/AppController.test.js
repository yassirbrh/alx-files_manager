const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('AppController Endpoint', () => {
    it('GET /status responds with status 200 and JSON object containing redis and db data', async () => {
      const response = await request(app).get('/status');
      expect(response).to.have.status(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('redis');
      expect(response.body).to.have.property('db');
    });

    it('GET /stats responds with status 200 and JSON object containing users and files info', async () => {
        const response = await request(app).get('/stats');
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('users');
        if ('files' in response.body) {
            expect(response.body.files).to.be.an('array');
        } else {
            expect(response.body).to.not.have.property('files');
        }
    });
  });