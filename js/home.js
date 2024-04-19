document.addEventListener("DOMContentLoaded", function () {
    const greetingElement = document.getElementById("greeting");
    const sortButton = document.getElementById("sort-random-beat");
    const usernameElement = document.getElementById("username");
    const profilePicImg = document.getElementById("profilePicImg");
    const versionElement = document.querySelector(".sidebar a.title");
    const overlay = document.querySelector(".overlay");
    const modal = document.querySelector(".modal");
    const closeModalButton = document.querySelector(".close-modal");

    // Dummy-Daten für die neuesten Beats
    const latestBeatsElement = document.getElementById("latest-beats");
    const latestBeats = ["Beat 1", "Beat 2", "Beat 3", "Beat 4", "Beat 5"];
    latestBeats.forEach((beat) => {
        const li = document.createElement("li");
        li.textContent = beat;
        latestBeatsElement.appendChild(li);
    });

    // Funktion zum Aktualisieren der Benutzeroberfläche
    function updateUI(userData) {
        const accentColor = userData.accentColor || "#000000";
        const sidebarIcons = document.querySelectorAll(".sidebar a i");
        const sidebarText = document.querySelectorAll(".sidebar a");
        usernameElement.textContent = userData.username;
        usernameElement.style.color = accentColor;
        sortButton.style.backgroundColor = accentColor;

        sidebarText.forEach((item) => {
            item.addEventListener("mouseenter", handleSidebarHover);
            item.addEventListener("mouseleave", handleSidebarLeave);
        });

        // Begrüßung aktualisieren
        updateGreeting();

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

    // Begrüßung aktualisieren basierend auf der Tageszeit
    function updateGreeting() {
        const time = new Date().getHours();
        if (time < 6) {
            greetingElement.textContent = "🌛 Good Night";
        } else if (time < 12) {
            greetingElement.textContent = "🌄 Good Morning";
        } else if (time < 18) {
            greetingElement.textContent = "🌞 Good Afternoon";
        } else {
            greetingElement.textContent = "🌆 Good Evening";
        }
    }

    // Lokalen Speicher nach Benutzerdaten überprüfen
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        updateUI(userData);
    }

    // Sortieren eines zufälligen Beats
    sortButton.addEventListener("click", function () {
        Toastify({
            text: "Searching for an beat...",
            duration: 1500,
            gravity: "bottom",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            stopOnFocus: true
        }).showToast();
    });

    document.addEventListener('auxclick', function (event) {
        if (event.button === 1) {
            event.preventDefault(); // Verhindert das Standardverhalten der mittleren Maustaste
        }
    });

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
});