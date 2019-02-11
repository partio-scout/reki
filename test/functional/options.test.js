import app from '../../src/server/server';
import request from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';

const expect = chai.expect;
chai.use(chaiAsPromised);

const testOptions = [
  {
    'property': 'village',
    'value': 'Mallikylä',
  },
  {
    'property': 'village',
    'value': 'muu',
  },
  {
    'property': 'campGroup',
    'value': 'muu',
  },
];

describe('Options', () => {
  before(async () => {
    const { pool } = app.locals;
    await testUtils.resetDatabase(pool);
    await testUtils.createOptionFixtures(pool, testOptions);
  });

  it('GET request to options', async () =>
    await request(app)
    .get('/api/options/')
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(3);
      expect(res.body[0]).to.have.property('property','village');
      expect(res.body[0]).to.have.property('value','Mallikylä');
      expect(res.body[1]).to.have.property('property','village');
      expect(res.body[1]).to.have.property('value','muu');
      expect(res.body[2]).to.have.property('property','campGroup');
      expect(res.body[2]).to.have.property('value','muu');
    })
  );

});
