process.env.NODE_ENV = 'test';
const request = require('supertest');
const { MongoClient } = require('mongodb');
const constants = require('./../utils/constants');
const { app } = require('./../server');
const logger = require('./../utils/logger');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    + '.eyJ1c2VyIjoiYXNodmluIiwicGFzcyI6InBhc3MiLCJpYXQiOjE1MzQ2OTc2OTB9'
    + '.oRjLaGGXdC-P7LtlhS7PokdjPfs-HjmiILa2WKzEvHM';
const falseToken = 'false_token';

// eslint-disable-next-line
before(function (done) {
  this.timeout(10000); // 10 second timeout for setup
  logger.debug('Listening for app to start');
  app.on('appStarted', () => {
    done();
  });
});

describe('Generating Tokens', () => {
  const user = 'test';
  const pass = 'pass';

  it('Generates a jwt using username and password', (done) => {
    request(app)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ user, pass })
      .expect(200)
      .expect(/((User exists already)|(token))/, done);
  });

  it('Generates an error when given only username', (done) => {
    request(app)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ user })
      .expect(200)
      .expect(/(error)/, done);
  });

  it('Generates an error when given only password', (done) => {
    request(app)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ pass })
      .expect(200)
      .expect(/(error)/, done);
  });

  it('Generates an error when given nothing', (done) => {
    request(app)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send()
      .expect(200)
      .expect(/(error)/, done);
  });

  it('Generates an error when user already exists in the database', (done) => {
    request(app)
      .post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        user: 'ashvin',
        pass: 'pass',
      })
      .expect(200)
      .expect(/(error)/, done);
  });

  after((done) => {
    MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }).then((database) => {
      const db = database.db('socialcops');
      db.collection(constants.COLLECTION_TOKENS).deleteOne({ user }).catch(logger);
      done();
    });
  });
});

describe('JSON Patching', () => {
  const object = '{ "baz": "qux",  "foo": "bar"}';
  const patch = '[  { "op": "replace", "path": "/baz", "value": "boo" },'
      + '  { "op": "add", "path": "/hello", "value": ["world"] },'
      + '  { "op": "remove", "path": "/foo" }]';

  it('Patching with multiple operations', (done) => {
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, object, patch })
      .expect(200)
      .expect('{"result":{"baz":"boo","hello":["world"]}}', done);
  });

  it('Patching with just one operation', (done) => {
    const singleOp = '{"op":"replace","path":"/baz","value":"boo"}';
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, object, patch: singleOp })
      .expect(200)
      .expect('{"result":{"baz":"boo","foo":"bar"}}', done);
  });

  it('Generates error on wrong auth-token', (done) => {
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token: falseToken, object, patch })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on when object is not given', (done) => {
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, patch })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on when patch is not given', (done) => {
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, object })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on when object and patch are not given', (done) => {
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on wrong JSON format of object', (done) => {
    const badObject = '{ "baz": "qux",  {"foo": "bar"}';
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, object: badObject, patch })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on wrong JSON format of the patch', (done) => {
    const badOp = '{"op":"[replace","path":"/baz","value":"boo"}';
    request(app)
      .post('/json_patch')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, object, patch: badOp })
      .expect(200)
      .expect(/error/, done);
  });
});

describe('Thumbnail Generation', () => {
  const img = 'https://s.gravatar.com/avatar/48fa294e3cd41680b80d3ed6345c7b4d?size=100&default=retro';

  it('Takes an image and generate its thumbnail of size 50x50', (done) => {
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, img })
      .expect(200)
      .expect(/image/, done);
  });

  it('Generates error when no img is given', (done) => {
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error when no token is given', (done) => {
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ img })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on non-image', (done) => {
    const wrongImg = 'https://google.com';
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, img: wrongImg })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error on wrong auth-token', (done) => {
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token: falseToken, img })
      .expect(200)
      .expect(/error/, done);
  });

  it('Generates error when given gif', (done) => {
    const imgUrl = 'https://i.gifer.com/D446.gif';
    request(app)
      .post('/thumbnail')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ token, img: imgUrl })
      .expect(200)
      .expect(/error/, done);
  });
});
