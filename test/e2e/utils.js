export async function waitForText(text, page) {
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("${text}")`,
  )
}
