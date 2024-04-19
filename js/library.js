const userData = JSON.parse(localStorage.getItem("userData"));

// Funktion zum Aktualisieren der Benutzeroberfläche
function updateUI(userData) {
    const accentColor = userData.accentColor || "#000000";
    const sidebarIcons = document.querySelectorAll(".sidebar a i");
    const sidebarText = document.querySelectorAll(".sidebar a");

    sidebarText.forEach((item) => {
        item.addEventListener("mouseenter", handleSidebarHover);
        item.addEventListener("mouseleave", handleSidebarLeave);
    });

    // Profilbild aktualisieren
    profilePicImg.src = userData.profilePic;
}

// Ereignislistener für die Sidebar-Elemente
function handleSidebarHover(event) {
    const accentColor = localStorage.getItem("userData")
        ? JSON.parse(localStorage.getItem("userData")).accentColor || "#000000"
        : "#000000";
    const element = event.currentTarget;
    const icon = element.querySelector("i");
    element.style.color = accentColor;
    icon.style.color = accentColor;
}

function handleSidebarLeave(event) {
    const element = event.currentTarget;
    const icon = element.querySelector("i");
    element.style.color = "#d1d5db";
    icon.style.color = "#d1d5db";
}

// Lokalen Speicher nach Benutzerdaten überprüfen
const savedUserData = localStorage.getItem("userData");
if (savedUserData) {
    const userData = JSON.parse(savedUserData);
    updateUI(userData);
}

const versionElement = document.querySelector(".sidebar a.title");
const overlay = document.querySelector(".overlay");
const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector(".close-modal");

// Version anklickbar machen und Update-Logs anzeigen
versionElement.addEventListener("click", function () {
    // Hintergrund verschwommen und dunkler machen
    overlay.classList.add("show");
    modal.classList.add("show");
});

// Schließen des modalen Popups
closeModalButton.addEventListener("click", function () {
    // Hintergrund wiederherstellen
    overlay.classList.remove("show");
    modal.classList.remove("show");
});

// Klicken auf das Overlay zum Schließen des Modals
overlay.addEventListener("click", function () {
    overlay.classList.remove("show");
    modal.classList.remove("show");
});

document.addEventListener('auxclick', function (event) {
    if (event.button === 1) {
        event.preventDefault(); // Verhindert das Standardverhalten der mittleren Maustaste
    }
});