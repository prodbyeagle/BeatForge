document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("settings-form");

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

        // Formularfelder aktualisieren
        form.username.value = userData.username;
        form["accent-color"].value = userData.accentColor;
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

    function saveSettings(event) {
        event.preventDefault();
        const username = form.username.value;
        const profilePic = form["profile-pic"].files[0].path;
        const accentColor = form["accent-color"].value;
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (username !== "" && username !== userData.username) {
            userData.username = username;
        }
        if (profilePic && profilePic !== userData.profilePic) {
            userData.profilePic = profilePic;
        }
        if (accentColor !== "" && accentColor !== userData.accentColor) {
            userData.accentColor = accentColor;
        }

        localStorage.setItem("userData", JSON.stringify(userData));

        updateUI(userData);

        Toastify({
            text: "Settings saved successfully!",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            stopOnFocus: true
        }).showToast();
    }

    form.addEventListener("submit", saveSettings);

    document.addEventListener("auxclick", function (event) {
        if (event.button === 1) {
            event.preventDefault(); // Verhindert das Standardverhalten der mittleren Maustaste
        }
    });

    // Lokalen Speicher nach Benutzerdaten überprüfen
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        updateUI(userData);
    }
});