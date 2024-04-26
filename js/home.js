document.addEventListener("DOMContentLoaded", function () {
    const greetingElement = document.getElementById("greeting");
    const sortButton = document.getElementById("sort-random-beat");
    const usernameElement = document.getElementById("username");
    const profilePicImg = document.getElementById("profilePicImg");
    const versionElement = document.querySelector(".sidebar a.title");
    const overlay = document.querySelector(".overlay");
    const modal = document.querySelector(".modal");
    const closeModalButton = document.querySelector(".close-modal");


    const latestBeatsElement = document.getElementById("latest-beats");
    const latestBeats = ["Beat 1", "Beat 2", "Beat 3", "Beat 4", "Beat 5"];
    latestBeats.forEach((beat) => {
        const li = document.createElement("li");
        li.textContent = beat;
        latestBeatsElement.appendChild(li);
    });


    function updateUI(userData) {
        const accentColor = userData.accentColor || "#000000";
        const sidebarText = document.querySelectorAll(".sidebar a");
        usernameElement.textContent = userData.username;
        usernameElement.style.color = accentColor;

        sidebarText.forEach((item) => {
            item.addEventListener("mouseenter", handleSidebarHover);
            item.addEventListener("mouseleave", handleSidebarLeave);
        });


        updateGreeting();
        profilePicImg.src = userData.profilePic;
    }

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
        element.style.color = "var(--tertiary-color)";
        if (icon) {
            icon.style.color = "var(--tertiary-color)";
        }
    }

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


    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        updateUI(userData);
    }


    sortButton.addEventListener("click", function () {
        Toastify({
            text: "Searching for a beat...",
            duration: 1500,
            gravity: "bottom",
            position: "right",
            style: {
                background: "var(--primary-color)"
            },
            stopOnFocus: true
        }).showToast();
    });

    document.addEventListener('auxclick', function (event) {
        if (event.button === 1) {
            event.preventDefault();
        }
    });


    versionElement.addEventListener("click", function () {

        overlay.classList.add("show");
        modal.classList.add("show");
    });


    closeModalButton.addEventListener("click", function () {

        overlay.classList.remove("show");
        modal.classList.remove("show");
    });


    overlay.addEventListener("click", function () {
        overlay.classList.remove("show");
        modal.classList.remove("show");
    });
});


window.addEventListener('load', () => {
    const appliedTheme = JSON.parse(localStorage.getItem('appliedTheme'));
    if (appliedTheme) {

        appliedTheme.values.forEach(color => {
            document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
        });
    } else {

        Toastify({
            text: "The applied theme no longer exists.",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
                background: "var(--primary-color)"
            },
            stopOnFocus: true,
        }).showToast();
    }
});
