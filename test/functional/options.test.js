import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;

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
  let user;

  beforeEach(async () => {
    await resetDatabase();
    await testUtils.createFixtureSequelize('Option', testOptions);
    user = await testUtils.createUserWithRoles(['registryUser']);
  });

  afterEach(resetDatabase);

  it('It returns filter options', async () => {
    const res = await testUtils.getWithUser('/api/options', user);
    testUtils.expectStatus(res.status, 200);

    expect(res.body).to.be.an('array').with.length(3);
    expect(res.body[0]).to.have.property('property','village');
    expect(res.body[0]).to.have.property('value','Mallikylä');
    expect(res.body[1]).to.have.property('property','village');
    expect(res.body[1]).to.have.property('value','muu');
    expect(res.body[2]).to.have.property('property','campGroup');
    expect(res.body[2]).to.have.property('value','muu');
  });

});
