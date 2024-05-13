//main.js

const { app, Tray, Menu, dialog, shell, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require('axios');

const configFilePath = path.join(app.getPath("userData"), "config.json");
const themesFilePath = path.join(__dirname, "themes.json");
const currentVersion = require('./package.json').version;

let mainWindow;
let windowMaximized = false;

async function checkLatestVersion() {
  try {
    const response = await axios.get(`https://api.github.com/repos/prodbyeagle/BeatForge/releases`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const latestRelease = response.data[0];
    const latestVersion = latestRelease.tag_name;
    return latestVersion;
  } catch (error) {
    console.error('Fehler beim Abrufen der neuesten Version:', error);
    return null;
  }
}

async function checkForUpdates() {
  const latestVersion = await checkLatestVersion();
  if (latestVersion && compareVersions(latestVersion, currentVersion) === 1) {
    const latestRelease = await getLatestRelease();
    if (latestRelease) {
      const url = latestRelease.assets[0].browser_download_url;
      const changelog = latestRelease.body.split('**Full Changelog**:')[0].trim();
      const message = `There is a new Version ${currentVersion} -> ${latestVersion}. Would you like to update?\n\nChangelog:\n${changelog}`;
      const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        title: 'New Version Available',
        message: message,
      };

      const choice = await dialog.showMessageBox(null, options);
      if (choice.response === 0) {
        downloadAndInstallUpdate(url);
        console.log('User chose to update.');
      } else {
        console.log('User chose not to update.');
      }
    } else {
      console.log('Fehler beim Abrufen der neuesten Version.');
    }
  } else {
    console.log('Die aktuelle Version ist auf dem neuesten Stand.');
  }
}

async function getLatestRelease() {
  try {
    const response = await axios.get(`https://api.github.com/repos/prodbyeagle/BeatForge/releases`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const latestRelease = response.data[0];
    return latestRelease;
  } catch (error) {
    console.error('Fehler beim Abrufen der neuesten Version:', error);
    return null;
  }
}

async function downloadAndInstallUpdate(url) {
  try {
    const { download } = await import('electron-dl');

    const mainWindow = BrowserWindow.getFocusedWindow();

    const dl = await download(mainWindow, url, {
      directory: path.join(app.getPath('userData'), 'downloads')
    });

    dl.on('progress', (status) => {
      console.log(`Downloaded ${status.percent}%`);
    });

    await dl;

    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'Download Finished',
      message: 'Download finished. Do you want to install the version?',
    };

    const choice = await dialog.showMessageBox(null, options);
    if (choice.response === 0) {
      console.log('User chose to install.');
      shell.openPath(dl.getSavePath());
      app.quit();
    } else {
      console.log('User chose not to install.');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

function compareVersions(versionA, versionB) {
  const partsA = versionA.split('.');
  const partsB = versionB.split('.');

  for (let i = 0; i < 3; i++) {
    const partA = parseInt(partsA[i]);
    const partB = parseInt(partsB[i]);

    if (partA > partB) {
      return 1;
    } else if (partA < partB) {
      return -1;
    }
  }

  return 0;
}

checkForUpdates();

ipcMain.on("manualClose", () => {
  app.quit();
});

ipcMain.on("manualMinimize", () => {
  mainWindow.minimize();
});

ipcMain.on("manualMaximize", () => {
  if (windowMaximized) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  windowMaximized = !windowMaximized;
});

ipcMain.on("load-themes", (event) => {
  try {
    if (mainWindow) {
      const themes = loadThemes();
      mainWindow.webContents.send("load-themes", themes);
    } else {
      throw new Error("mainWindow ist nicht definiert");
    }
  } catch (error) {
    console.error("Fehler beim Laden der Themes:", error.message);
    console.error("Fehlerdetails:", error);
    event.sender.send(
      "load-themes-error",
      "Fehler beim Laden der Themes: " + error.message
    );
  }
});

ipcMain.on("perform-debug-actions", () => {
  console.log("Debug-Aktionen werden ausgeführt...");
  performDebugActions();
});


function loadConfig() {
  try {
    const data = fs.readFileSync(configFilePath);
    return JSON.parse(data);
  } catch (err) {
    console.error(
      "Konfigurationsdatei konnte nicht geladen werden:",
      err.message
    );
    return {};
  }
}

function saveConfig(config) {
  fs.writeFileSync(configFilePath, JSON.stringify(config));
}

function createConfigFile() {
  if (!fs.existsSync(configFilePath)) {
    const initialConfig = {
      onboardingCompleted: false,
    };
    saveConfig(initialConfig);
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    dialog.showMessageBox({
      type: "info",
      title: "Hey!",
      message: "The App is already open.",
    });
  });

  app.on("ready", async () => {

    //* Check Latest Version
    const latestVersion = await checkLatestVersion();
    if (latestVersion) {
      console.log('Die neueste Version ist:', latestVersion);
    } else {
      console.log('Fehler beim Abrufen der neuesten Version.');
    }

    //* Tray
    tray = new Tray(path.join(__dirname, 'assets', 'testicon.png'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Beatforge v0.2.3',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open Beatforge',
        click: () => {
          if (mainWindow === null) {
            createMainWindow();
          } else {
            mainWindow.show();
          }
        }
      },
      {
        label: 'Close Beatforge',
        click: () => {
          app.quit();
        }
      }
    ]);
    tray.on('click', () => {
      if (mainWindow === null) {
        createMainWindow();
      } else {
        mainWindow.show();
      }
    });
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Beatforge');

    createConfigFile();

    ipcMain.on("onboarding-complete", (_, userData) => {
      const config = loadConfig();

      config.onboardingCompleted = true;

      saveConfig(config);

      if (userData.relaunchApp) {
        console.log("App wird neu gestartet...");
        app.relaunch();
        app.quit();
      }
    });

    const config = loadConfig();
    if (config.onboardingCompleted) {
      mainWindow = new BrowserWindow({
        width: 1280,
        height: 1000,
        maxWidth: 1920,
        maxHeight: 1080,
        minWidth: 800,
        minHeight: 1000,
        autoHideMenuBar: true,
        fullscreenable: false,
        frame: false,
        icon: path.join(__dirname, "assets", "testicon.png"),
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, "preload.js"),
        },
      });

      mainWindow.once("ready-to-show", () => {
        sendThemesToRenderer();
      });

      mainWindow.loadFile(path.join(__dirname, "sites", "home.html"));

      mainWindow.on("close", () => {
        mainWindow = null;
      });
    } else {
      let mainWindow = new BrowserWindow({
        width: 1280,
        height: 1000,
        maxWidth: 1920,
        maxHeight: 1080,
        minWidth: 800,
        minHeight: 1000,
        autoHideMenuBar: true,
        fullscreenable: false,
        frame: false,
        icon: path.join(__dirname, "assets", "testicon.png"),
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, "preload.js"),
        },
      });

      mainWindow.loadFile("index.html");

      mainWindow.once("ready-to-show", () => {
        sendThemesToRenderer();
      });

      mainWindow.loadFile(path.join(__dirname, "sites", "intro.html"));

      mainWindow.on("close", () => {
        app.quit();
      });
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function loadThemes() {
  try {
    if (!fs.existsSync(themesFilePath)) {
      fs.writeFileSync(themesFilePath, "[]");
    }
    const data = fs.readFileSync(themesFilePath);
    return JSON.parse(data);
  } catch (error) {
    console.error("Fehler beim Laden der Themes:", error);
    return [];
  }
}

function sendThemesToRenderer() {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isDestroyed()) {
    return;
  }

  const currentURL = mainWindow.webContents.getURL();

  if (currentURL.endsWith("intro.html")) {
    return;
  }

  try {
    const themes = loadThemes();
    mainWindow.webContents.send("load-themes", themes);
  } catch (error) {
    mainWindow.webContents.send("load-themes", []);
  }
}

function deleteConfigFile() {
  try {
    fs.unlinkSync(configFilePath);
  } catch (error) {
    console.error("Error deleting config.json:", error);
  }
}

function restartApp() {
  app.relaunch();
  app.quit();
}

function performDebugActions() {
  deleteConfigFile();
  restartApp();
}