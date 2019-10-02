export const BASE_URL = `http://localhost:${process.env.PORT}`;

export async function waitForText(text, page) {
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("${text}")`
  );
}
