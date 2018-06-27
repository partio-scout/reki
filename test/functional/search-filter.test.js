import app from '../../src/server/server';
import request from 'supertest';
import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import { models } from '../../src/server/models';

const expect = chai.expect;

describe('SearchFilter', () => {
  let accessToken;

  const searchFilterFixture = [
    {
      name: 'asd',
      filter: '?filter=%7B"textSearch"%3A"durpdurp"%7D',
    }];

  beforeEach( async () => {
    await resetDatabase();
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser']);
    accessToken = accessToken.id;
  });
  afterEach(() => testUtils.deleteFixturesIfExistSequelize('SearchFilter'));

  it('GET SearchFilter returns a filter when not empty', async () => {
    await testUtils.createFixtureSequelize('SearchFilter', searchFilterFixture);
    return request(app).get(`/api/searchfilters?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(1);
      expect(res.body[0]).to.have.property('id').to.be.above(0);
      expect(res.body[0]).to.have.property('name', 'asd');
      expect(res.body[0]).to.have.property('filter', '?filter=%7B"textSearch"%3A"durpdurp"%7D');
    });
  });

  it('GET SearchFilter returns empty array when there are no search filters', async () =>
    request(app).get(`/api/searchfilters?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(0);
    })
  );

  it('POST request to SearchFilter returns the filter and saves it to database', async () => {
    await request(app).post('/api/searchfilters')
    .set('Authorization', accessToken)
    .send({
      filter:'?filter=%7B%22textSearch%22%3A%22asd%22%7D',
      name:'ok',
    })
    .expect(200)
    .expect(res => {
      expect(res.body).to.have.property('id').to.be.above(0);
      expect(res.body).to.have.property('name', 'ok');
      expect(res.body).to.have.property('filter', '?filter=%7B%22textSearch%22%3A%22asd%22%7D');
    });
    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(1);
  });

  it('DELETE request destroys the filter we tried to destroy from the database', async () => {
    await testUtils.createFixtureSequelize('SearchFilter', searchFilterFixture);
    await request(app).delete('/api/searchfilters/1')
      .set('Authorization', accessToken)
      .expect(200);
    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(0);
  });

  it('DELETE request returns 404 if filter is not found', async () => {
    await testUtils.createFixtureSequelize('SearchFilter', searchFilterFixture);
    await request(app).delete('/api/searchfilters/3')
      .set('Authorization', accessToken)
      .expect(404);
    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(1);
  });

  it('DELETE request returns 404 for non-integer ids', () =>
    request(app).delete('/api/searchfilters/hello')
      .set('Authorization', accessToken)
      .expect(404)
  );

});
