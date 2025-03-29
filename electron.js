const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = !app.isPackaged; // Check if running in development mode

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const startURL = isDev
    ? "http://localhost:3000/PlayStationFrontend" // Development mode (when running `npm start`)
    : `file://${path.join(__dirname, "../build/index.html")}`; // Load built React app

  mainWindow.loadURL(startURL);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
});
