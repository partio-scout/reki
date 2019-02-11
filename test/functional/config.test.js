import chai from 'chai';
import {
  createUserWithRoles as createUser,
  getWithUser,
  expectStatus,
} from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;

describe('Config API endpoint', () => {
  let response;

  after(resetDatabase);

  beforeEach(async() => {
    const user = await createUser(['registryUser']);
    response = await getWithUser('/api/config', user);
    expectStatus(response.status, 200);
  });

  it('has participant fields', async () => {
    expect(response.body).to.have.property('fields');
    expect(response.body.fields).to.be.an('array');
  });

  it('has participants allwaysIncudedFields', async () =>
    expect(response.body.fields).to.deep.include({
      name: 'presence',
      type: 'mandatory_field',
      dataType: 'integer',
      nullable: true,
    })
  );

  it('participant has custom fields from config', async () =>
    expect(response.body.fields).to.deep.include({
      name: 'nickname',
      type: 'participant_field',
      dataType: 'string',
      nullable: true,
    })
  );

  it('returns fields to show in participant table', async () => {
    expect(response.body.tableFields).to.be.an('array');
    expect(response.body.tableFields).to.include('firstName');
  });

  it('returns detail page fields', async () => {
    expect(response.body.detailsPageFields).to.be.an('array');
    expect(response.body.detailsPageFields[0]).to.have.property('groupTitle', 'Yhteystiedot');
    expect(response.body.detailsPageFields[0]).to.have.property('fields');
  });

  it('returns filters', async () => {
    expect(response.body.filters).to.be.an('array');
    expect(response.body.filters).to.deep.include({
      field: 'ageGroup',
      primary: true,
    });
  });

});
