process.env.NODE_ENV = 'test';
const request = require('supertest');
const { app } = require('./../server');
const logger = require('./../utils/logger');

// eslint-disable-next-line
before(function (done) {
  this.timeout(10000); // 10 second timeout for setup
  logger.debug('Listening for app to start.');
  app.on('appStarted', () => {
    done();
  });
});

describe('Generating Tokens', () => {
  it('Generate a jwt using username and password.', (done) => {
    request(app)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        user: 'ashvin2',
        pass: 'pass',
      })
      .expect(200)
      .expect(/((User exists already)|(token))/, done);
  });
});

describe('JSON Patching', () => {
  it('Applies patch to a JSON object.', (done) => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNodmluIiwicGFzcyI6InBhc3MiLCJpYXQiOjE1MzQ2MjAxMzN9.qiV9BUTurnMf4EDt8Fg2F2rGPG5bz4tLM-t8rR4GVgE';
    const object = '{ "baz": "qux",  "foo": "bar"}';
    const patch = '[  { "op": "replace", "path": "/baz", "value": "boo" },'
        + '  { "op": "add", "path": "/hello", "value": ["world"] },'
        + '  { "op": "remove", "path": "/foo" }]';
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, object, patch })
      .expect(200)
      .expect(/result/, done);
  });
});

describe('Thumbnail Generation', () => {
  it('Takes an image and generate its thumbnail of size 50x50.', (done) => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNodmluIiwicGFzcyI6InBhc3MiLCJpYXQiOjE1MzQ2MjAxMzN9.qiV9BUTurnMf4EDt8Fg2F2rGPG5bz4tLM-t8rR4GVgE';
    const img = 'https://s.gravatar.com/avatar/48fa294e3cd41680b80d3ed6345c7b4d?size=100&default=retro';
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, img })
      .expect(200)
      .expect(/image/, done);
  });
});
