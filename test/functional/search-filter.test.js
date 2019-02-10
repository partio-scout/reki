import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import { models } from '../../src/server/models';

const expect = chai.expect;

describe('SearchFilter', () => {
  const searchFilterFixture = {
    name: 'asd',
    filter: '?filter=%7B"textSearch"%3A"durpdurp"%7D',
  };

  let user;

  before(resetDatabase);

  beforeEach(async () => user = await testUtils.createUserWithRoles(['registryUser']));

  afterEach(async () => {
    await testUtils.deleteFixturesIfExistSequelize('SearchFilter');
    await testUtils.deleteFixturesIfExist('RegistryUser');
  });

  it('GET SearchFilter returns a filter when not empty', async () => {
    await testUtils.createFixtureSequelize('SearchFilter', searchFilterFixture);
    const res = await testUtils.getWithUser('/api/searchfilters', user);
    testUtils.expectStatus(res.status, 200);

    expect(res.body).to.be.an('array').with.length(1);
    expect(res.body[0]).to.have.property('id').to.be.above(0);
    expect(res.body[0]).to.have.property('name', 'asd');
    expect(res.body[0]).to.have.property('filter', '?filter=%7B"textSearch"%3A"durpdurp"%7D');
  });

  it('GET SearchFilter returns empty array when there are no search filters', async () => {
    const res = await testUtils.getWithUser('/api/searchfilters', user);
    testUtils.expectStatus(res.status, 200);
    expect(res.body).to.be.an('array').with.length(0);
  });

  it('POST request to SearchFilter returns the filter and saves it to database', async () => {
    const res = await testUtils.postWithUser(
      '/api/searchfilters',
      user,
      {
        filter:'?filter=%7B%22textSearch%22%3A%22asd%22%7D',
        name:'ok',
      }
    );
    testUtils.expectStatus(res.status, 200);

    expect(res.body).to.have.property('id').to.be.above(0);
    expect(res.body).to.have.property('name', 'ok');
    expect(res.body).to.have.property('filter', '?filter=%7B%22textSearch%22%3A%22asd%22%7D');

    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(1);
  });

  it('DELETE request destroys the filter we tried to destroy from the database', async () => {
    const filter = await models.SearchFilter.create(searchFilterFixture);
    const res = await testUtils.deleteWithUser(`/api/searchfilters/${filter.id}`, user);
    testUtils.expectStatus(res.status, 200);

    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(0);
  });

  it('DELETE request returns 404 if filter is not found', async () => {
    const filter = await testUtils.createFixtureSequelize('SearchFilter', searchFilterFixture);
    const res = await testUtils.deleteWithUser(`/api/searchfilters/${filter.id+1}`, user);
    testUtils.expectStatus(res.status, 404);

    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(1);
  });

  it('DELETE request returns 404 for non-integer ids', async () => {
    const res = await testUtils.deleteWithUser('/api/searchfilters/hello', user);
    testUtils.expectStatus(res.status, 404);
  });

});
