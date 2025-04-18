const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "assets", "favicon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,

    },
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);
