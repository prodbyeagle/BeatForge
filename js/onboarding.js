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

    function checkAndToast(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "bottom",
            backgroundColor: "#ff4242",
            stopOnFocus: true
        }).showToast();
    }

    document.getElementById("next-question-1").addEventListener("click", nextQuestion);

    document.getElementById("next-question-4").addEventListener("click", function () {
        const profilePicInput = document.getElementById("profile-pic");
        if (profilePicInput.files.length > 0) {
            nextQuestion();
        } else {
            checkAndToast("You need to select a profile picture.");
        }
    });

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

    accentColorValue.textContent = accentColorInput.value;
    accentColorInput.addEventListener("input", function () {
        accentColorValue.textContent = this.value;
    });
});

async function saveUserData(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const tags = document.getElementById("tags").value;
    const profilePicInput = document.getElementById("profile-pic");
    const profilePic = profilePicInput.files.length ? profilePicInput.files[0].path : null;
    const accentColor = document.getElementById("accent-color").value;

    const foldersInput = document.getElementById("folders");
    if (!username) {
        checkAndToast("You need to enter a username.");
        return;
    } else if (foldersInput && !foldersInput.files.length) {
        checkAndToast("You need to select a folder.");
        return;
    } else if (!profilePic) {
        checkAndToast("You need to select a profile picture.");
        return;
    } else if (!accentColor) {
        checkAndToast("You need to select an accent color.");
        return;
    } else if (!tags) {
        checkAndToast("You need to enter at least one tag.");
        return;
    }

    const foldersPath = localStorage.getItem('foldersPath');

    const userData = {
        username: username,
        folders: foldersPath,
        tags: tags,
        profilePic: profilePic,
        accentColor: accentColor,
        onboarding_complete: true,
    };

    localStorage.setItem('userData', JSON.stringify(userData));
    const config = loadConfig();
    config.onboardingCompleted = true;
    saveConfig(config);

    if (window.ipcRenderer) {
        window.ipcRenderer.send('onboarding-complete', {
            username,
            tags,
            profilePic,
            accentColor,
            relaunchApp: true
        });
    } else {
        console.error("ipcRenderer not initialized.");
    }

    window.location.href = "home.html";
}

document.getElementById("onboarding-form").addEventListener("submit", saveUserData);


function loadConfig() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        return userData.config || {};
    } catch (err) {
        console.error("Fehler beim Laden der Konfigurationsdatei:", err.message);
        return {};
    }
}

function saveConfig(config) {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData.config = config;
    localStorage.setItem('userData', JSON.stringify(userData));
}

document.getElementById("onboarding-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const tags = document.getElementById("tags").value;
    const profilePic = document.getElementById("profile-pic").files[0].path;
    const accentColor = document.getElementById("accent-color").value;
    const foldersPath = localStorage.getItem('foldersPath');

    const userData = {
        username: username,
        folders: foldersPath,
        tags: tags,
        profilePic: profilePic,
        accentColor: accentColor,
        onboarding_complete: true,
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    const config = loadConfig();
    config.onboardingCompleted = true;
    saveConfig(config);

    if (window.ipcRenderer) {
        window.ipcRenderer.send('onboarding-complete', {
            username,
            tags,
            profilePic,
            accentColor,
            relaunchApp: true
        });
    } else {
        console.error("ipcRenderer not initialized.");
    }

    window.location.href = "home.html";
});

window.addEventListener('focus', () => {
    document.documentElement.style.transition = 'filter 0.5s';
    document.documentElement.style.filter = 'grayscale(0%) brightness(100%)';
});

window.addEventListener('blur', () => {
    document.documentElement.style.transition = 'filter 0.5s';
    document.documentElement.style.filter = 'grayscale(60%) brightness(60%)';
});