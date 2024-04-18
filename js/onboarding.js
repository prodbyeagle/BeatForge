document.addEventListener("DOMContentLoaded", function () {
    const questions = document.querySelectorAll(".question");
    let currentQuestion = 0;

    function showQuestion(index) {
        questions.forEach((question, idx) => {
            if (idx === index) {
                question.classList.remove("hidden");
            } else {
                question.classList.add("hidden");
            }
        });
    }

    function nextQuestion() {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion(currentQuestion);
        }
    }

    function prevQuestion() {
        currentQuestion--;
        if (currentQuestion >= 0) {
            showQuestion(currentQuestion);
        }
    }

    document.getElementById("next-question-1").addEventListener("click", nextQuestion);
    document.getElementById("next-question-2").addEventListener("click", function () {
        const foldersInput = document.getElementById("folders");
        const folders = foldersInput.files[0].path;
        localStorage.setItem('foldersPath', folders);
        nextQuestion();
    });
    document.getElementById("next-question-4").addEventListener("click", nextQuestion);
    document.getElementById("next-question-5").addEventListener("click", nextQuestion);

    document.getElementById("prev-question-3").addEventListener("click", prevQuestion);
    document.getElementById("prev-question-4").addEventListener("click", prevQuestion);
    document.getElementById("prev-question-5").addEventListener("click", prevQuestion);

    document.getElementById("tags").addEventListener("input", function () {
        const tagsInput = this.value;
        const tagsArray = tagsInput.split(",").map((tag) => tag.trim());
        const tagBadgesContainer = document.getElementById("tag-badges");
        tagBadgesContainer.innerHTML = "";
        tagsArray.forEach((tag) => {
            if (tag !== "") {
                const tagBadge = document.createElement("span");
                tagBadge.classList.add(
                    "tag-badge",
                    "bg-gray-50",
                    "text-gray-600",
                    "ring-1",
                    "ring-inset",
                    "ring-gray-500/10"
                );
                tagBadge.textContent = tag;
                tagBadgesContainer.appendChild(tagBadge);
            }
        });
    });

    const accentColorInput = document.getElementById("accent-color");
    const accentColorValue = document.getElementById("accent-color-value");

    // Set initial color value
    accentColorValue.textContent = accentColorInput.value;

    // Update color value when color changes
    accentColorInput.addEventListener("input", function () {
        accentColorValue.textContent = this.value;
    });
});

async function saveUserData(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const tags = document.getElementById("tags").value;
    const profilePic = document.getElementById("profile-pic").files[0].path; // Direkter Zugriff auf den Dateinamen
    const accentColor = document.getElementById("accent-color").value;

    // Falls es ein Element mit der ID "folders" gibt
    const foldersInput = document.getElementById("folders");
    let folders;
    if (foldersInput) {
        folders = foldersInput.files[0].name; // Direkter Zugriff auf den Dateinamen
    }

    // Prüfen, ob das Onboarding bereits abgeschlossen wurde
    const config = loadConfig();
    if (config.onboardingCompleted) {
        // Falls das Onboarding bereits abgeschlossen wurde, direkt zur Hauptseite weiterleiten
        window.location.href = "home.html";
        return;
    }

    // Speichern der Benutzerdaten im Local Storage
    const userData = {
        username: username,
        folders: folders,
        tags: tags,
        profilePic: profilePic,
        accentColor: accentColor,
        onboarding_complete: true,
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    // Senden einer IPC-Nachricht an den Hauptprozess, um das Onboarding als abgeschlossen zu markieren
    if (window.ipcRenderer) {
        window.ipcRenderer.send('onboarding-complete', {
            username,
            tags,
            profilePic,
            accentColor
        });

    } else {
        console.error("ipcRenderer not initialized.");
    }

    // Setzen von onboardingCompleted auf true in der config.json-Datei
    try {
        config.onboardingCompleted = true;
        saveConfig(config);
        console.log("onboardingCompleted in config.json auf true gesetzt.");
    } catch (err) {
        console.error("Fehler beim Setzen von onboardingCompleted:", err.message);
    }

    // Formular leeren
    document.getElementById("onboarding-form").reset();

    // Anzeige einer Erfolgsmeldung
    const formContainer = document.querySelector('.max-w-md');
    formContainer.innerHTML = "<h1 class='text-4xl font-bold mb-8 text-center text-white'>✅ Thank You!</h1>";

    // Weiterleitung nach 5 Sekunden
    setTimeout(() => {
        window.location.href = "home.html";
    }, 3000);
}

document.getElementById("onboarding-form").addEventListener("submit", saveUserData);

// Definition der loadConfig()-Funktion
function loadConfig() {
    try {
        const data = localStorage.getItem('config');
        return JSON.parse(data) || {};
    } catch (err) {
        console.log("Fehler beim Laden der Konfigurationsdatei:", err.message);
        return {};
    }
}

// Definition der saveConfig()-Funktion
function saveConfig(config) {
    localStorage.setItem('config', JSON.stringify(config));
}

// Event-Listener für das Submit-Ereignis des Onboarding-Formulars
document.getElementById("onboarding-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const tags = document.getElementById("tags").value;
    const profilePic = document.getElementById("profile-pic").files[0].path; // Direkter Zugriff auf den Dateinamen
    const accentColor = document.getElementById("accent-color").value;

    // Abrufen des Ordnerpfads aus dem Local Storage
    const foldersPath = localStorage.getItem('foldersPath');

    // Speichern der Benutzerdaten im Local Storage
    const userData = {
        username: username,
        folders: foldersPath,
        tags: tags,
        profilePic: profilePic,
        accentColor: accentColor,
        onboarding_complete: true,
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log("set userData in localStorage")

    // Laden der Konfiguration
    const config = loadConfig();

    // Setzen von onboardingCompleted auf true in der Konfiguration
    config.onboardingCompleted = true;

    // Speichern der Konfiguration
    saveConfig(config);

    // Senden einer IPC-Nachricht an den Hauptprozess, um das Onboarding als abgeschlossen zu markieren
    if (window.ipcRenderer) {
        window.ipcRenderer.send('onboarding-complete', {
            username,
            tags,
            profilePic,
            accentColor
        });
    } else {
        console.error("ipcRenderer not initialized.");
    }

    // Weiterleitung zur Hauptseite
    window.location.href = "home.html";
});