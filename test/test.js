const { assert } = require('chai');
const request = require('supertest');
const app = require('./../server');

describe('Generating Tokens', () => {
  it('Generate a jwt using username and password', (done) => {
    request(app)
      .post('/login')
      // .expect(404, (err, res) => {
      //   console.error(err);
      //   console.log(res);
      // });
      .send({
        user: 'ashvin1',
        pass: 'pass',
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect(/token/, done);
  });
});
