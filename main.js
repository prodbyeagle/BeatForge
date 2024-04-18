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
        minWidth: 800,
        minHeight: 900,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true // Zugriff auf Node.js-Module im Renderer-Prozess aktivieren
        }
    });

    // HTML-Datei im Hauptfenster laden
    mainWindow.loadFile(path.join(__dirname, 'sites', 'onboarding.html'));
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