import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Confiq api endpoint', () => {

  let accessToken = null;

  before(resetDatabase);

  beforeEach( async () => {
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser']);
    accessToken = accessToken.id;
  });

  afterEach( async () => {
    await testUtils.deleteFixturesIfExist('RegistryUser');
  });

  it('has participant fields', async () =>
    await request(app)
    .get(`/api/config/?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.have.property('fields');
      expect(res.body.fields).to.be.an('array');
    })
  );

  it('has participants allwaysIncudedFields', async () =>
    await request(app)
    .get(`/api/config/?access_token=${accessToken}`)
    .expect(res => {
      expect(res.body.fields).to.deep.include(  {
        name: 'presence',
        type: 'mandatory_field',
        dataType: 'integer',
        nullable: true,
      });
    })
  );

  it('participant has custom fields form confiq', async () =>
    await request(app)
    .get(`/api/config/?access_token=${accessToken}`)
    .expect(res => {
      expect(res.body.fields).to.deep.include({
        name: 'nickname',
        type: 'participant_field',
        dataType: 'string',
        nullable: true,
      });
    })
  );

  it('returns fields to show in participant table', async () =>
    await request(app)
    .get(`/api/config/?access_token=${accessToken}`)
    .expect(res => {
      expect(res.body.tableFields).to.be.an('array');
      expect(res.body.tableFields).to.include('firstName');
    })
  );

  it('returns detail page fields', async () =>
    await request(app)
    .get(`/api/config/?access_token=${accessToken}`)
    .expect(res => {
      expect(res.body.detailsPageFields).to.be.an('array');
      expect(res.body.detailsPageFields[0]).to.have.property('groupTitle', 'Yhteystiedot');
      expect(res.body.detailsPageFields[0]).to.have.property('fields');
    })
  );

  it('returns filters', async () =>
    await request(app)
    .get(`/api/config/?access_token=${accessToken}`)
    .expect(res => {
      expect(res.body.filters).to.be.an('array');
      expect(res.body.filters).to.deep.include({
        field: 'ageGroup',
        primary: true,
      });
    })
  );

});
