import { chromium } from 'playwright';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fetch, { FormData } from 'node-fetch';

const TARGET_URL = 'https://www.karzanddolls.com/details/pre-orders/pre-order-minigt/MTcx';
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const screenshotDir = './screenshots';
const lastPath = `${screenshotDir}/last.png`;
const newPath = `${screenshotDir}/new.png`;
const diffPath = `${screenshotDir}/diff.png`;

if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
await page.screenshot({ path: newPath, fullPage: true });
await browser.close();

if (!fs.existsSync(lastPath)) {
  fs.copyFileSync(newPath, lastPath);
  console.log('Initialized with first screenshot. No comparison yet.');
  process.exit(0);
}

const img1 = PNG.sync.read(fs.readFileSync(lastPath));
const img2 = PNG.sync.read(fs.readFileSync(newPath));
const { width, height } = img1;

const diff = new PNG({ width, height });

const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
  threshold: 0.1
});

if (diffPixels === 0) {
  console.log('No visual changes detected.');
  process.exit(0);
}

fs.writeFileSync(diffPath, PNG.sync.write(diff));
fs.copyFileSync(newPath, lastPath);

const timestamp = new Date().toISOString();
const message = `⚠️ *Visual Change Detected*
URL: ${TARGET_URL}
Time: ${timestamp}
Changed Pixels: ${diffPixels}`;

const sendPhotoUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;

const formData = new FormData();
formData.append('chat_id', TELEGRAM_CHAT_ID);
formData.append('caption', message);
formData.append('parse_mode', 'Markdown');
formData.append('photo', fs.createReadStream(diffPath));

await fetch(sendPhotoUrl, {
  method: 'POST',
  body: formData
});

console.log('Telegram alert sent.');
