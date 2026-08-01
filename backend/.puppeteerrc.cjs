import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  // Tells Puppeteer to download Chrome directly inside your project folder
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};