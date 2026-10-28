#!/usr/bin/env node

import path from 'node:path';
import url from 'node:url';

import { app, Menu, ipcMain, shell } from 'electron';

import appMenuTemplate from './menu/app_menu_template';
import editMenuTemplate from './menu/edit_menu_template';
import devMenuTemplate from './menu/dev_menu_template';
import createWindow from './helpers/window';

import env from 'env';

if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
  console.log('User data path set to:', app.getPath('userData'));
}

const setApplicationMenu = () => {
  const menus = [appMenuTemplate, editMenuTemplate];
  if (env.name !== 'production') {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

const initIpc = () => {
  ipcMain.on('need-app-path', (event, arg) => {
    event.reply('app-path', app.getAppPath());
  });
  ipcMain.on('open-external-link', (event, href) => {
    shell.openExternal(href);
  });
};

app.on('ready', () => {
  setApplicationMenu();
  initIpc();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true, // Always enable for testing
    },
  });

  const appUrl = url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(appUrl);

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window content loaded');
  });

  if (env.name === 'development' || env.name === 'test') {
    mainWindow.openDevTools();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
