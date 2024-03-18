const request = require('supertest');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);

describe('UsersController Endpoint', () => {
  it('POST /users should return 400 when email is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ password: 'testPassword' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Missing email');
  });

  it('POST /users should return 400 when password is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Missing password');
  });

  it('POST /users should return 400 when user already exists', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'testPassword' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Already exist');
  });
});