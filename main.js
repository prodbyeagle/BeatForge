const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Electron-App initialisieren
app.on('ready', () => {
    // Hauptfenster erstellen
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 900,
        maxWidth: 1920,
        maxHeight: 1080,
        minWidth: 400,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: true // Zugriff auf Node.js-Module im Renderer-Prozess aktivieren
        }
    });

    // HTML-Datei im Hauptfenster laden
    mainWindow.loadFile(path.join(__dirname, 'sites', 'onboarding.html'));

    // IPC-Ereignislistener für Anforderungen des Renderer-Prozesses hinzufügen
    ipcMain.on('check-onboarding', (event) => {
        // Überprüfen, ob die Benutzerdaten vorhanden sind
        const userDataPath = path.join(app.getPath('userData'), 'userData.json');
        if (fs.existsSync(userDataPath)) {
            // Benutzerdaten vorhanden, JSON-Datei lesen
            const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
            if (userData.onboarding_complete) {
                // Onboarding abgeschlossen, an Renderer-Prozess senden
                event.reply('onboarding-status', true);
            } else {
                // Onboarding nicht abgeschlossen, an Renderer-Prozess senden
                event.reply('onboarding-status', false);
            }
        } else {
            // Benutzerdaten nicht vorhanden, an Renderer-Prozess senden
            event.reply('onboarding-status', false);
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        // Wenn keine Fenster offen sind, erneut Hauptfenster erstellen
        createWindow();
    }
});