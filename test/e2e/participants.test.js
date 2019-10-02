import puppeteer from 'puppeteer';
import { expect } from 'chai';
import { withFixtures, createUserWithRoles, deleteUsers } from '../utils/test-utils';
import { waitForText, clickLinkText, type, BASE_URL } from './e2e-utils';

describe('Participants', () => {
  it('should be searchable', async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    await page.authenticate({
      username: 'test@example.org',
      password: 'Pa$$word123',
    });
    await page.goto(`${BASE_URL}/login/password`, { waitUntil: 'networkidle2' });

    await waitForText('Leiriläiset', page);
    await clickLinkText('Leiriläiset', page);
    await waitForText('Hakutulokset', page);

    // FIXME: it seems to be impossible to search with two criteria at once
    // even though it clearly works when running the app manually

    //Search matches both Teemus
    await type('Teemu', 'input[label=Tekstihaku]', page);
    //Village selection should limit to just the first Teemu
    await page.select('select[label=Kylä]', 'Kattivaara');
    await waitForText('Testihenkilö', page);
    await page.screenshot({ path: 'debug.png' });

    expect((await page.$$('tbody tr')).length).to.equal(1);

    await browser.close();
  });

  beforeEach(async () => {
    await createUserWithRoles(['registryUser'], {
      email: 'test@example.org',
      password: 'Pa$$word123',
    });
  });

  afterEach(deleteUsers);

  withFixtures({
    'Participant': [
      {
        'participantId': 1,
        'firstName': 'Teemu',
        'lastName': 'Testihenkilö',
        'nonScout': false,
        'localGroup': 'Testilippukunta',
        'campGroup': 'Leirilippukunta',
        'village': 'Kattivaara',
        'subCamp': 'Alaleiri',
        'ageGroup': 'sudenpentu',
        'memberNumber': 123,
        'presence': 0,
        'internationalGuest': false,
        'dateOfBirth': new Date(),
      },
      {
        'participantId': 2,
        'firstName': 'Teemu',
        'lastName': 'Esimerkki',
        'nonScout': false,
        'localGroup': 'Testilippukunta',
        'campGroup': 'Leirilippukunta',
        'village': 'Testikylä',
        'subCamp': 'Alaleiri',
        'ageGroup': 'sudenpentu',
        'memberNumber': 345,
        'presence': 0,
        'internationalGuest': false,
        'dateOfBirth': new Date(),
      },
      {
        'participantId': 3,
        'firstName': 'Jussi',
        'lastName': 'Jukola',
        'nonScout': false,
        'localGroup': 'Testilippukunta',
        'campGroup': 'Leirilippukunta',
        'village': 'Kattivaara',
        'subCamp': 'Alaleiri',
        'ageGroup': 'seikkailija',
        'memberNumber': 859,
        'presence': 0,
        'internationalGuest': false,
        'dateOfBirth': new Date(),
      },
    ],
    'Option': [
      {
        property: 'village',
        value: 'Testikylä',
      },
      {
        property: 'village',
        value: 'Kattivaara',
      },
      {
        property: 'village',
        value: 'Mallikylä',
      },
    ],
    'ParticipantDate': [
      { participantId: 1, date: new Date(2016,6,20) },
      { participantId: 1, date: new Date(2016,6,21) },
      { participantId: 1, date: new Date(2016,6,23) },
    ],
  });
});
