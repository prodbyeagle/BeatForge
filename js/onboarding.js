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
    const profilePic = document.getElementById("profile-pic").files[0].path;
    const accentColor = document.getElementById("accent-color").value;
    const configFilePath = path.join(app.getPath('userData'), 'config.json');

    // Prüfen, ob das Onboarding bereits abgeschlossen wurde
    const config = loadConfig();
    if (config.onboardingCompleted) {
        // Falls das Onboarding bereits abgeschlossen wurde, direkt zur Hauptseite weiterleiten
        window.location.href = "home.html";
        return;
    }

    // Abrufen des Ordnerpfads aus dem Local Storage
    const foldersPath = localStorage.getItem('foldersPath');

    const userData = {
        username: username,
        folders: foldersPath,
        tags: tags,
        profilePic: profilePic,
        accentColor: accentColor,
        onboarding_complete: true,
    };

    // Speichern der Benutzerdaten im Local Storage
    localStorage.setItem('userData', JSON.stringify(userData));

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

document.getElementById("onboarding-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value
    const folders = document.getElementById("folders").files[0].path;
    const tags = document.getElementById("tags").value;
    const profilePic = document.getElementById("profile-pic").files[0].path;
    const accentColor = document.getElementById("accent-color").value;

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