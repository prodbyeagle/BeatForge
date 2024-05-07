const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const configFilePath = path.join(app.getPath("userData"), "config.json");
const themesFilePath = path.join(__dirname, "themes.json");
const langDir = path.join(__dirname, "language");
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

app.on("ready", () => {
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
      height: 900,
      maxWidth: 1920,
      maxHeight: 1080,
      minWidth: 800,
      minHeight: 900,
      autoHideMenuBar: true,
      fullscreenable: false,
      frame: false,
      icon: path.join(__dirname, "assets", "icon.png"),
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    loadLanguageFile(langDir)
      .then((langData) => {
        // Serialisieren der Sprachdaten, bevor sie gesendet werden
        const serializedLangData = JSON.stringify(langData);
        mainWindow.webContents.send("language-loaded", serializedLangData);
      })
      .catch((error) => {
        console.error(
          "defaultLangData: Fehler beim Laden der Standardsprache:",
          error.message
        );
      });

    mainWindow.once("ready-to-show", () => {
      sendThemesToRenderer();
      loadLanguageFile("en")
        .then((langData) => {
          mainWindow.webContents.send("language-loaded", langData);
        })
        .catch((error) => {
          console.error(
            "Home:  Fehler beim Laden der Standardsprache:",
            error.message
          );
        });
    });

    mainWindow.loadFile(path.join(__dirname, "sites", "home.html"));

    mainWindow.on("close", () => {
      mainWindow = null;
    });
  } else {
    let mainWindow = new BrowserWindow({
      width: 1280,
      height: 900,
      maxWidth: 1920,
      maxHeight: 1080,
      minWidth: 800,
      minHeight: 900,
      autoHideMenuBar: true,
      fullscreenable: false,
      frame: false,
      icon: path.join(__dirname, "assets", "icon.png"),
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    const defaultLangData = loadLanguageFile("en");
    mainWindow.loadFile("index.html");

    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send("language-loaded", defaultLangData);
    });

    mainWindow.once("ready-to-show", () => {
      sendThemesToRenderer();
      loadLanguageFile("en")
        .then((langData) => {
          mainWindow.webContents.send("language-loaded", langData);
        })
        .catch((error) => {
          console.error(
            "Intro: Fehler beim Laden der Standardsprache:",
            error.message
          );
        });
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
  console.log("Beginne mit dem Senden von Themes an den Renderer...");
  if (!mainWindow) {
    const errorMessage = "Kein mainWindow gefunden";
    console.error(errorMessage);

    return;
  }
  console.log("mainWindow gefunden.");

  if (mainWindow.isDestroyed()) {
    console.log(
      "mainWindow wurde zerstört. Die Funktion sendThemesToRenderer() wird nicht ausgeführt."
    );
    return;
  }
  console.log("mainWindow ist intakt.");

  const currentURL = mainWindow.webContents.getURL();
  console.log("Aktuell geladene HTML-Datei:", currentURL);

  if (currentURL.endsWith("intro.html")) {
    console.log(
      "Intro-Datei geladen. Die Funktion sendThemesToRenderer() wird nicht ausgeführt."
    );
    return;
  }
  console.log("Keine Intro-Datei geladen.");

  console.log("Lade Themes...");
  try {
    const themes = loadThemes();
    mainWindow.webContents.send("load-themes", themes);
    console.log("Themes an Renderer gesendet.");
  } catch (error) {
    console.error("Fehler beim Laden der Themes:", error.message);
    console.error("Fehlerdetails:", error);
    mainWindow.webContents.send("load-themes", []);
    console.log("Leere Themes an Renderer gesendet.");
  }
  console.log("Ende des Sendens von Themes an den Renderer.");
}

function deleteConfigFile() {
  try {
    fs.unlinkSync(configFilePath);
    console.log("config.json deleted successfully.");
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

ipcMain.on("load-language", async (event, language) => {
  try {
    const langFilePath = path.join(langDir, `${language}.json`);
    console.log("Sprachdatei laden:", langFilePath);
    const langData = await loadLanguageFile(langFilePath);
    if (Object.keys(langData).length === 0) {
      throw new Error("Leere Sprachdaten empfangen.");
    }
    console.log(
      langData.settings ? langData.settings.title : "settings.title is none"
    );
    console.log(
      langData.settings && langData.settings.labels
        ? langData.settings.labels.changeUsername
        : "settings.labels.changeUsername is none"
    );
    event.sender.send("language-data", langData);
  } catch (error) {
    console.error("Fehler beim Laden der Sprachdatei:", error.message);
    event.sender.send("language-data", {});
  }
});

async function loadLanguageFile(langFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(langFilePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

ipcMain.on("change-language", async (event, language) => {
  try {
    const langFilePath = path.join(langDir, `${language}.json`);
    const langData = await loadLanguageFile(langFilePath);
    event.sender.send("language-loaded", langData);
  } catch (error) {
    console.error("Fehler beim Laden der Sprachdatei:", error.message);
    event.sender.send("language-loaded", {});
  }
});