//titlebar.js

// Funktionen für die Steuerungsschaltflächen

document.querySelector('#minimize').addEventListener('click', () => {
    console.log('minimize');
    ipcRenderer.send('manualMinimize');
});

document.querySelector('#maximize').addEventListener('click', () => {
    console.log('maximize');
    ipcRenderer.send('manualMaximize');
});

document.querySelector('#close').addEventListener('click', () => {
    console.log('close');
    ipcRenderer.send('manualClose');
});

// Funktion zum Hinzufügen des Hover-Effekts
function addHoverEffect(selector, color) {
    const button = document.querySelector(selector);
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = color;
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '';
    });
}

// Hover-Effekt für jedes Steuerungselement hinzufügen
addHoverEffect('.control-button.minimize', '#ff4d4d');
addHoverEffect('.control-button.maximize', '#ffff66');
addHoverEffect('.control-button.close', '#99ff99');