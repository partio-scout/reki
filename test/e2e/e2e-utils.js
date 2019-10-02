export const BASE_URL = `http://localhost:${process.env.PORT}`;

export async function waitForText(text, page) {
  await page.waitForFunction(
    `document.querySelector("body") && document.querySelector("body").innerText.includes("${text}")`
  );
}

export async function clickLinkText(text, page) {
  const matchingLinks = await page.$x(`//a[contains(text(), '${text}')]`);

  if (matchingLinks.length > 0) {
    await matchingLinks[0].click();
  } else {
    throw new Error(`Couldn't find <a> which would contain ${text}`);
  }
}

export async function type(text, selector, page) {
  const elem = await page.$(selector);
  await elem.focus();
  await elem.type(text);
}
