const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const configFilePath = path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
    try {
        const data = fs.readFileSync(configFilePath);
        return JSON.parse(data);
    } catch (err) {
        console.log("Konfigurationsdatei konnte nicht geladen werden:", err.message);
        return {};
    }
}

function saveConfig(config) {
    fs.writeFileSync(configFilePath, JSON.stringify(config));
}

function createConfigFile() {
    if (!fs.existsSync(configFilePath)) {
        console.log("Konfigurationsdatei nicht gefunden. Neue Datei wird erstellt.");
        const initialConfig = {
            onboardingCompleted: false
        };
        saveConfig(initialConfig); // Konfiguration mit dem Wert onboardingCompleted = false erstellen
    }
}

app.on('ready', () => {
    createConfigFile();

    // Ereignis abhören, wenn das Onboarding abgeschlossen wurde
    ipcMain.on('onboarding-complete', (_, userData) => {
        console.log("Onboarding abgeschlossen. Speichere Konfiguration und öffne Hauptfenster.");

        // Laden der Konfiguration
        const config = loadConfig();

        // Markierung setzen, dass das Onboarding abgeschlossen wurde
        config.onboardingCompleted = true;
        config.userData = userData;

        // Konfiguration speichern
        saveConfig(config);
    });

    // Weiterleitung zum Hauptfenster, wenn das Onboarding bereits abgeschlossen wurde
    const config = loadConfig();
    if (config.onboardingCompleted) {
        console.log("Onboarding bereits abgeschlossen. Öffne Hauptfenster.");
        const mainWindow = new BrowserWindow({
            width: 1280,
            height: 900,
            maxWidth: 1920,
            maxHeight: 1080,
            minWidth: 800,
            minHeight: 900,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // HTML-Datei im Hauptfenster laden
        mainWindow.loadFile(path.join(__dirname, 'sites', 'home.html'));
    } else {
        console.log("Onboarding noch nicht abgeschlossen. Öffne Onboarding-Fenster.");
        const onboardingWindow = new BrowserWindow({
            width: 1280,
            height: 900,
            maxWidth: 1920,
            maxHeight: 1080,
            minWidth: 800,
            minHeight: 900,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // HTML-Datei im Onboarding-Fenster laden
        onboardingWindow.loadFile(path.join(__dirname, 'sites', 'onboarding.html'));
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});