//titlebar.js
// const { ipcRenderer } = require('electron') is in preload.js defined;

document.addEventListener("DOMContentLoaded", function () {
    let closeAction = localStorage.getItem("closeAction");

    if (!closeAction) {
        closeAction = "close";
        localStorage.setItem("closeAction", closeAction);
    }

    document.querySelector("#toggleApp").addEventListener("click", () => {
        closeAction = (closeAction === "close") ? "minimize" : "close";
        document.querySelector("#toggleApp").innerText = (closeAction === "close") ? "Close App" : "Minimize App";
        localStorage.setItem("closeAction", closeAction);
    });

    document.querySelector("#close").addEventListener("click", () => {
        if (closeAction === "close") {
            ipcRenderer.send("manualClose");
        } else if (closeAction === "minimize") {
            ipcRenderer.send("manualMinimize");
        }
    });

    document.querySelector("#minimize").addEventListener("click", () => {
        ipcRenderer.send("manualMinimize");
    });

    document.querySelector("#maximize").addEventListener("click", () => {
        ipcRenderer.send("manualMaximize");
    });
});