const {
  app,
  Tray,
  Menu,
  dialog,
  shell,
  ipcMain,
  BrowserWindow,
} = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const configFilePath = path.join(app.getPath("userData"), "config.json");
const themesFilePath = path.join(__dirname, "themes.json");
const currentVersion = require("./package.json").version;

let mainWindow;
let windowMaximized = false;
let lastUpdateCheckTime = null;

async function checkLatestVersion() {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/prodbyeagle/BeatForge/releases`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return response.data[0];
  } catch (error) {
    console.error("Fehler beim Abrufen der neuesten Version:", error);
    return null;
  }
}

async function checkForUpdates() {
  const cooldownPeriod = 5 * 60 * 1000; // 5 Minuten in Millisekunden

  if (
    lastUpdateCheckTime &&
    Date.now() - lastUpdateCheckTime < cooldownPeriod
  ) {
    const remainingMinutes = Math.ceil(
      (cooldownPeriod - (Date.now() - lastUpdateCheckTime)) / 1000 / 60
    );
    return dialog.showMessageBoxSync({
      type: "info",
      buttons: ["OK"],
      title: "Cooldown Period",
      message: `Please wait ${remainingMinutes} minute(s) before checking for updates again.`,
    });
  }

  const latestRelease = await checkLatestVersion();
  if (
    latestRelease &&
    compareVersions(latestRelease.tag_name, currentVersion) === 1
  ) {
    const url = latestRelease.assets[0]?.browser_download_url;
    const changelog = latestRelease.body.split("**Full Changelog**:")[0].trim();
    const message = `A new version (${latestRelease.tag_name}) is available. Would you like to update?\n\nChangelog:\n${changelog}`;

    const choice = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["Yes", "No"],
      title: "New Version Available",
      message,
    });

    if (choice === 0 && url) {
      downloadAndInstallUpdate(url);
    }
  } else {
    dialog.showMessageBoxSync({
      type: "info",
      buttons: ["OK"],
      title: "No Updates Available",
      message: "You are already using the latest version.",
    });
  }

  lastUpdateCheckTime = Date.now();
}

async function downloadAndInstallUpdate(url) {
  try {
    const { download } = await import("electron-dl");
    const dl = await download(mainWindow, url, {
      directory: path.join(app.getPath("userData"), "downloads"),
    });

    dl.on("progress", (status) => {
      console.log(`Downloaded ${status.percent}%`);
    });

    const choice = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["Yes", "No"],
      title: "Download Finished",
      message: "Download finished. Do you want to install the update now?",
    });

    if (choice === 0) {
      shell.openPath(dl.getSavePath());
      app.quit();
    }
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

function compareVersions(versionA, versionB) {
  const partsA = versionA.split(".").map(Number);
  const partsB = versionB.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    if ((partsA[i] || 0) > (partsB[i] || 0)) return 1;
    if ((partsA[i] || 0) < (partsB[i] || 0)) return -1;
  }

  return 0;
}

function loadConfig() {
  if (fs.existsSync(configFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
    } catch (err) {
      console.error("Failed to load config file:", err.message);
    }
  }
  return {};
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save config file:", err.message);
  }
}

function createConfigFile() {
  if (!fs.existsSync(configFilePath)) {
    saveConfig({ onboardingCompleted: false });
  }
}

app.on("ready", () => {
  createConfigFile();

  const tray = new Tray(path.join(__dirname, "assets", "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: `Beatforge ${currentVersion}`, enabled: false },
    { type: "separator" },
    {
      label: "Check for Updates",
      click: () => checkForUpdates(),
    },
    {
      label: "Debug",
      submenu: [
        {
          label: "Reload",
          click: () => app.relaunch() && app.quit(),
        },
        {
          label: "Clear Data and Restart",
          click: () => {
            dialog.showMessageBoxSync({
              type: "question",
              buttons: ["Yes", "No"],
              title: "Confirm Data Clearing",
              message: "Are you sure you want to clear your data?",
            }) === 0 &&
              deleteConfigFile() &&
              app.relaunch() &&
              app.quit();
          },
        },
      ],
    },
    { type: "separator" },
    // {
    //   label: "Open Beatforge",
    //   click: () => (mainWindow ? mainWindow.show() : createMainWindow()),
    // },
    {
      label: "Exit",
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Beatforge");

  const config = loadConfig();
  createMainWindow(config.onboardingCompleted ? "home.html" : "intro.html");
});

function createMainWindow(file) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    minWidth: 700,
    minHeight: 700,
    autoHideMenuBar: true,
    fullscreenable: false,
    frame: false,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "functions", "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "html", file));
  mainWindow.once("ready-to-show", () => sendThemesToRenderer());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function sendThemesToRenderer() {
  if (
    !mainWindow ||
    mainWindow.isDestroyed() ||
    mainWindow.webContents.getURL().endsWith("intro.html")
  )
    return;

  try {
    const themes = loadThemes();
    mainWindow.webContents.send("load-themes", themes);
  } catch (error) {
    console.error("Fehler beim Senden der Themes:", error);
  }
}

function loadThemes() {
  if (!fs.existsSync(themesFilePath)) {
    fs.writeFileSync(themesFilePath, "[]");
  }
  try {
    return JSON.parse(fs.readFileSync(themesFilePath, "utf-8"));
  } catch (error) {
    console.error("Fehler beim Laden der Themes:", error);
    return [];
  }
}

function deleteConfigFile() {
  try {
    fs.unlinkSync(configFilePath);
  } catch (error) {
    console.error("Error deleting config.json:", error);
  }
}

ipcMain.on("manualClose", () => app.quit());
ipcMain.on("manualMinimize", () => mainWindow.minimize());
ipcMain.on("manualMaximize", () => {
  windowMaximized ? mainWindow.unmaximize() : mainWindow.maximize();
  windowMaximized = !windowMaximized;
});

ipcMain.on("load-themes", (event) => {
  try {
    if (mainWindow) {
      const themes = loadThemes();
      mainWindow.webContents.send("load-themes", themes);
    } else {
      throw new Error("mainWindow is not defined or destroyed");
    }
  } catch (error) {
    console.error("Fehler beim Laden der Themes:", error);
  }
});

ipcMain.on("save-themes", (event, themes) => {
  try {
    fs.writeFileSync(themesFilePath, JSON.stringify(themes, null, 2));
    sendThemesToRenderer();
  } catch (error) {
    console.error("Fehler beim Speichern der Themes:", error);
  }
});
