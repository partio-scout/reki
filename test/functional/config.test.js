import configureApp from '../../src/server/server';
import request from 'supertest';
import chai from 'chai';
import { createConnection } from '../../src/server/database';
import { resetDatabase } from '../utils/test-utils';

const expect = chai.expect;

describe('Config api endpoint', () => {
  let app;
  let pool;

  before(async () => {
    pool = await createConnection();
    await resetDatabase(pool);

    app = configureApp(pool);
  });

  after(() => {
    pool.end();
  });

  it('has participant fields', async () =>
    await request(app)
    .get('/api/config')
    .expect(200)
    .expect(res => {
      expect(res.body).to.have.property('fields');
      expect(res.body.fields).to.be.an('array');
    })
  );

  it('has participants allwaysIncudedFields', async () =>
    await request(app)
    .get('/api/config')
    .expect(res => {
      expect(res.body.fields).to.deep.include('presence');
    })
  );

  it('participant has custom fields from config', async () =>
    await request(app)
    .get('/api/config')
    .expect(res => {
      expect(res.body.fields).to.deep.include('nickname');
    })
  );

  it('returns fields to show in participant table', async () =>
    await request(app)
    .get('/api/config')
    .expect(res => {
      expect(res.body.tableFields).to.be.an('array');
      expect(res.body.tableFields).to.include('firstName');
    })
  );

  it('returns detail page fields', async () =>
    await request(app)
    .get('/api/config')
    .expect(res => {
      expect(res.body.detailsPageFields).to.be.an('array');
      expect(res.body.detailsPageFields[0]).to.have.property('groupTitle', 'Yhteystiedot');
      expect(res.body.detailsPageFields[0]).to.have.property('fields');
    })
  );

  it('returns filters', async () =>
    await request(app)
    .get('/api/config')
    .expect(res => {
      expect(res.body.filters).to.be.an('array');
      expect(res.body.filters).to.deep.include({
        field: 'ageGroup',
        primary: true,
      });
    })
  );

});
