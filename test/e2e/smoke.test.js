import puppeteer from 'puppeteer';
import { waitForText, BASE_URL } from './e2e-utils.js';

describe('REKI', () =>
  it('should show a login button for unauthenticated users', async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await waitForText('Kirjaudu', page);

    await browser.close();
  })
);
