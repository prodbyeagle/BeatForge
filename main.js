const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const configFilePath = path.join(app.getPath('userData'), 'config.json');
const themesFilePath = path.join(__dirname, 'themes.json');
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

function loadConfig() {
    try {
        const data = fs.readFileSync(configFilePath);
        return JSON.parse(data);
    } catch (err) {
        console.error("Konfigurationsdatei konnte nicht geladen werden:", err.message);
        return {};
    }
}

function saveConfig(config) {
    fs.writeFileSync(configFilePath, JSON.stringify(config));
}

function createConfigFile() {
    if (!fs.existsSync(configFilePath)) {
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

        // Laden der Konfiguration
        const config = loadConfig();

        // Markierung setzen, dass das Onboarding abgeschlossen wurde
        config.onboardingCompleted = true;

        // Konfiguration speichern
        saveConfig(config);
    });

    // Weiterleitung zum Hauptfenster, wenn das Onboarding bereits abgeschlossen wurde
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
            icon: path.join(__dirname, 'assets', 'testicon.png'),
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        // Ereignis abhören, wenn das Hauptfenster bereit ist
        mainWindow.once('ready-to-show', () => {
            sendThemesToRenderer(); // Hier wird sendThemesToRenderer nur aufgerufen, wenn mainWindow vollständig initialisiert wurde
        });


        // HTML-Datei im Hauptfenster laden
        mainWindow.loadFile(path.join(__dirname, 'sites', 'home.html'));

        // Ereignishandler für Steuerungsschaltflächen im Hauptfenster registrieren
        mainWindow.on('close', () => {
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
            icon: path.join(__dirname, 'assets', 'testicon.png'),
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        // Ereignis abhören, wenn das Hauptfenster bereit ist
        mainWindow.once('ready-to-show', () => {
            sendThemesToRenderer(); // Hier wird sendThemesToRenderer nur aufgerufen, wenn mainWindow vollständig initialisiert wurde
        });

        // HTML-Datei im Onboarding-Fenster laden
        mainWindow.loadFile(path.join(__dirname, 'sites', 'intro.html'));

        // Ereignishandler für Steuerungsschaltflächen im Onboarding-Fenster registrieren
        mainWindow.on('close', () => {
            app.quit();
        });
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

ipcMain.on('load-themes', (event) => {
    try {
        if (mainWindow) { // Sicherstellen, dass mainWindow definiert ist
            const themes = loadThemes(); // Funktion, um die Themes zu laden
            mainWindow.webContents.send('load-themes', themes); // mainWindow ist Ihre BrowserWindow-Instanz
        } else {
            throw new Error('mainWindow ist nicht definiert');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Themes:', error.message);
        console.error('Fehlerdetails:', error);
        event.sender.send('load-themes-error', 'Fehler beim Laden der Themes: ' + error.message); // Fehlermeldung zurücksenden
    }
});

function loadThemes() {
    try {
        // Check if the file exists
        if (!fs.existsSync(themesFilePath)) {
            fs.writeFileSync(themesFilePath, '[]');
        }

        // Read the file contents
        const data = fs.readFileSync(themesFilePath);

        // Parse and return the JSON data
        return JSON.parse(data);
    } catch (error) {
        console.error('Fehler beim Laden der Themes:', error);
        return [];
    }
}

// console.log(loadThemes());

function sendThemesToRenderer() {
    if (!mainWindow) { // Wenn mainWindow nicht definiert ist
        const errorMessage = 'Kein mainWindow gefunden';
        console.error(errorMessage);
        ipcMain.emit('mainWindow-error', errorMessage);
        return; // Beenden der Funktion, um zu verhindern, dass der Rest des Codes ausgeführt wird
    }

    console.log('Lade Themes...');
    try {
        const themes = loadThemes();
        console.log('Themes erfolgreich geladen');
        mainWindow.webContents.send('load-themes', themes);
    } catch (error) {
        console.error('Fehler beim Laden der Themes:', error.message);
        console.error('Fehlerdetails:', error);
        mainWindow.webContents.send('load-themes', []);
    }
}