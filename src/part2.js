import fs from 'fs/promises';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const args = process.argv.slice(2);
const inputUrl = new URL(args[0]);

const [, categoryId, categorySlug] = inputUrl.pathname.split('/').filter(Boolean);
const API_URL = `https://www.vprok.ru/web/api/v1/catalog/category/${categoryId}?sort=popularity_desc&limit=30&page=1`;
const categoryPath = `/catalog/${categoryId}/${categorySlug}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto('https://www.vprok.ru', {
    waitUntil: 'networkidle2',
  });

  await sleep(3000);

  const responsePromise = page.waitForResponse(
    (res) => res.url().includes(`/web/api/v1/catalog/category/${categoryId}`) && res.request().method() === 'POST',
  );

  await page.evaluate(
    (apiUrl, categoryPath) => {
      fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ url: categoryPath }),
      });
    },
    API_URL,
    categoryPath,
  );

  const response = await responsePromise;
  const data = await response.json();

  await browser.close();

  const products = data.products;

  if (!products) {
    console.log('Неудачно');
    process.exit(1);
  }

  const result = products
    .map((p) => {
      const hasDiscount = p.oldPrice > 0;

      return [
        `Название товара: ${p.name}`,
        `Ссылка на страницу товара: https://www.vprok.ru${p.url}`,
        `Рейтинг: ${p.rating}`,
        `Количество отзывов: ${p.reviews}`,
        `Цена: ${p.price}`,
        `Акционная цена: ${hasDiscount ? p.price : '-'}`,
        `Цена до акции: ${hasDiscount ? p.oldPrice : '-'}`,
        `Размер скидки: ${hasDiscount ? p.discount : '-'}`,
        '',
      ].join('\n');
    })
    .join('\n');

  await fs.writeFile('output/products-api.txt', result);
  console.log('Ok!');
};

function errorHandler(e) {
  console.error(e);
  process.exit(1);
}

main().catch(errorHandler);
