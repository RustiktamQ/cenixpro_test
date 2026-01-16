import fs from 'fs/promises';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import regions from './regions.js';

puppeteer.use(StealthPlugin());

const args = process.argv.slice(2);
const [url, regionName] = args;

const region = regions.find((r) => r.name === regionName);

if (!region) {
  console.error('Неверный регион');
  process.exit(1);
}

const main = async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  browser.setCookie({
    name: 'region',
    value: String(region.regionId),
    domain: '.vprok.ru',
    path: '/',
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForSelector('script[id="__NEXT_DATA__"]', {
    timeout: 10000,
    visible: false,
  });

  const pageData = await page.evaluate(() => {
    const script = document.querySelector('script[id="__NEXT_DATA__"]');
    const data = JSON.parse(script.textContent);
    const productBase = data.props.pageProps.initialStore.productPage;
    const product = productBase.product;
    const reviews = productBase.reviews;

    return {
      price: product.price,
      priceOld: product.oldPrice,
      rating: reviews.data.rating,
      reviewCount: reviews.data.numberOfReviews,
    };
  });

  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel({ deltaY: 500 });
  }

  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel({ deltaY: -500 });
  }

  const height = await page.evaluate(() => {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  });

  await page.setViewport({
    width: 1600,
    height,
  });

  await page.screenshot({
    path: 'output/screenshot.jpg',
  });

  await browser.close();

  const result = Object.entries(pageData)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile('output/product.txt', result);
  console.log('Ok!');
};

function errorHandler(e) {
  console.error(e);
  process.exit(1);
}

main().catch(errorHandler);
