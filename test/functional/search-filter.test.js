import { expect } from 'chai';
import {
  createFixture,
  getWithUser,
  postWithUser,
  deleteWithUser,
  expectStatus,
  createUserWithRoles,
  deleteUsers,
  deleteFixturesIfExist,
} from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import { models } from '../../src/server/models';

describe('Saved search filters API endpoint', () => {
  const searchFilter = {
    name: 'asd',
    filter: '?filter=%7B"textSearch"%3A"durpdurp"%7D',
  };

  let user;

  before(resetDatabase);

  beforeEach(async () => user = await createUserWithRoles(['registryUser']));

  afterEach(async () => {
    await deleteFixturesIfExist('SearchFilter');
    await deleteUsers;
  });

  it('returns the searchfilters in the database', async () => {
    await createFixture('SearchFilter', searchFilter);
    const res = await getWithUser('/api/searchfilters', user);
    expectStatus(res.status, 200);

    expect(res.body).to.be.an('array').with.length(1);
    expect(res.body[0]).to.have.property('id').to.be.above(0);
    expect(res.body[0]).to.have.property('name', 'asd');
    expect(res.body[0]).to.have.property('filter', '?filter=%7B"textSearch"%3A"durpdurp"%7D');
  });

  it('returns an empty array when there are no search filters', async () => {
    const res = await getWithUser('/api/searchfilters', user);
    expectStatus(res.status, 200);
    expect(res.body).to.be.an('array').with.length(0);
  });

  it('returns the filter and saves it to database when a filter is posted', async () => {
    const res = await postWithUser(
      '/api/searchfilters',
      user,
      {
        filter:'?filter=%7B%22textSearch%22%3A%22asd%22%7D',
        name:'ok',
      }
    );
    expectStatus(res.status, 200);

    expect(res.body).to.have.property('id').to.be.above(0);
    expect(res.body).to.have.property('name', 'ok');
    expect(res.body).to.have.property('filter', '?filter=%7B%22textSearch%22%3A%22asd%22%7D');

    //TODO check that filter was saved correctly
    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(1);
  });

  it('destroys the filter when a DELETE request is sent', async () => {
    const filter = await models.SearchFilter.create(searchFilter);
    const res = await deleteWithUser(`/api/searchfilters/${filter.id}`, user);
    expectStatus(res.status, 200);

    //TODO check it doesn't delete the wrong model

    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(0);
  });

  it('returns 404 when a DELETE request with an nonexistent id is sent', async () => {
    const filter = await createFixture('SearchFilter', searchFilter);
    const res = await deleteWithUser(`/api/searchfilters/${filter.id+1}`, user);
    expectStatus(res.status, 404);

    const filters = await models.SearchFilter.findAll();
    expect(filters).to.be.an('array').with.length(1);
  });

  it('returns 404 when a DELETE request with a non-integer id is sent', async () => {
    const res = await deleteWithUser('/api/searchfilters/hello', user);
    expectStatus(res.status, 404);
  });

});
