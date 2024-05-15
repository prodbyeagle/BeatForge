//titlebar.js
// const { ipcRenderer } = require('electron') is in preload.js defined;

document.addEventListener("DOMContentLoaded", function () {
    let userData = JSON.parse(localStorage.getItem("userData"));
    let closeAction = userData.closeAction;

    if (!closeAction) {
        closeAction = "close";
        userData.closeAction = closeAction;
        localStorage.setItem("userData", JSON.stringify(userData));
    }

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