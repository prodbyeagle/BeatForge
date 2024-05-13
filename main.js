//main.js

const { app, Tray, Menu, dialog, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const configFilePath = path.join(app.getPath("userData"), "config.json");
const themesFilePath = path.join(__dirname, "themes.json");

let mainWindow;
let windowMaximized = false;

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

  app.on("ready", () => {
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