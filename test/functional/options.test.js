import { expect } from 'chai';
import {
  withFixtures,
  deleteUsers,
  getWithUser,
  expectStatus,
  createUserWithRoles as createUser,
} from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

describe('Options API endpoint', () => {

  it('returns filter options', async () => {
    const res = await getWithUser(
      '/api/options',
      await createUser(['registryUser'])
    );
    expectStatus(res.status, 200);

    expect(res.body).to.be.an('array').with.length(3);
    expect(res.body[0]).to.have.property('property','village');
    expect(res.body[0]).to.have.property('value','Mallikylä');
    expect(res.body[1]).to.have.property('property','village');
    expect(res.body[1]).to.have.property('value','muu');
    expect(res.body[2]).to.have.property('property','campGroup');
    expect(res.body[2]).to.have.property('value','muu');
  });

  before(resetDatabase);
  withFixtures({
    'Option': [
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
    ],
  });
  afterEach(deleteUsers);

});
