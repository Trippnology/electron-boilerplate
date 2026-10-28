import path from 'path';
import { Application } from 'spectron';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const beforeEach = function () {
  this.timeout(30000); // Increased timeout

  console.log('Setting up Spectron application...');
  const appPath = path.join(__dirname, '..'); // Path to the project root
  const mainPath = path.join(appPath, 'app', 'main.js'); // Path to main.js
  console.log(`App path: ${appPath}`);
  console.log(`Main path: ${mainPath}`);
  console.log(
    `Directory contents of app folder: ${fs.readdirSync(path.join(appPath, 'app'))}`,
  );

  this.app = new Application({
    path: require('electron'),
    args: [mainPath], // Point directly to main.js
    env: {
      ELECTRON_ENABLE_LOGGING: true,
      ELECTRON_ENABLE_STACK_DUMPING: true,
      NODE_ENV: 'test',
    },
    startTimeout: 20000,
    waitTimeout: 20000,
  });

  console.log('Starting application...');
  return this.app
    .start()
    .then(() => {
      console.log('Application started. Waiting for window to load...');
      return this.app.client.waitUntilWindowLoaded();
    })
    .then(() => {
      console.log('Window loaded. Getting window bounds...');
      return this.app.browserWindow.getBounds();
    })
    .then((bounds) => {
      console.log('Window bounds:', bounds);
      console.log('Setup complete.');
    })
    .catch((error) => {
      console.error('Error during setup:', error);
      if (error.message.includes('timeout')) {
        console.error(
          'Timeout error. Current app state:',
          this.app.isRunning() ? 'running' : 'not running',
        );
        console.error('Electron path:', this.app.electron);
        console.error(
          'Main process pid:',
          this.app.mainProcess ? this.app.mainProcess.pid : 'unknown',
        );
      }
      throw error;
    });
};

const afterEach = function () {
  this.timeout(30000); // Increased timeout

  if (this.app && this.app.isRunning()) {
    console.log('Stopping application...');
    return this.app
      .stop()
      .then(() => {
        console.log('Application stopped.');
      })
      .catch((error) => {
        console.error('Error stopping application:', error);
        throw error;
      });
  }
  console.log('Application was not running.');
  return Promise.resolve();
};

export default {
  beforeEach,
  afterEach,
};
