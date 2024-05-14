document.addEventListener("DOMContentLoaded", function () {
    const greetingElement = document.getElementById("greeting");
    const sortButton = document.getElementById("sort-random-beat");
    const versionElement = document.querySelector(".sidebar a.title");
    const overlay = document.querySelector(".overlay");
    const modal = document.querySelector(".modal");
    const closeModalButton = document.querySelector(".close-modal");
    const latestBeatsElement = document.getElementById("latest-beats");
    const latestBeats = [];
    latestBeats.forEach((beat) => {
        const li = document.createElement("li");
        li.textContent = beat;
        latestBeatsElement.appendChild(li);

        updateGreeting();
    });

    const latestDateElement = document.getElementById("latest-date");
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
    latestDateElement.textContent = formattedDate;

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

    var isCooldown = false;
    sortButton.addEventListener("click", function () {

        if (isCooldown) {
            return;
        }

        Toastify({
            text: "Searching for files...",
            duration: 1500,
            gravity: "bottom",
            position: "right",
            style: {
                background: "var(--primary-color)"
            },
            stopOnFocus: true
        }).showToast();

        isCooldown = true;

        setTimeout(function () {
            var filesFound = false;

            if (!filesFound) {
                Toastify({
                    text: "No files found. Try again!",
                    duration: 2000,
                    gravity: "bottom",
                    position: "right",
                    style: {
                        background: "#ff6347"
                    },
                    stopOnFocus: true
                }).showToast();
            }
            isCooldown = false;
        }, 5000);
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

//* Scroll Code
//* Scroll Code
//* Scroll Code

var modal = document.getElementById('modal');
var isScrolling = false;
var startY;
var startScrollTop;

modal.addEventListener('mousedown', function (e) {
    isScrolling = true;
    startY = e.pageY;
    startScrollTop = modal.scrollTop;
});

modal.addEventListener('mousemove', function (e) {
    if (!isScrolling) return;
    var delta = startY - e.pageY;
    modal.scrollTop = startScrollTop + delta;
});

modal.addEventListener('mouseup', function () {
    isScrolling = false;
});

modal.addEventListener('mouseleave', function () {
    isScrolling = false;
});

//* Close or In Background
//* Close or In Background
//* Close or In Background

let closeAction = localStorage.getItem("closeAction");

if (!closeAction) {
    closeAction = "close";
    localStorage.setItem("closeAction", closeAction);
}

document.getElementById("close").addEventListener("click", () => {
    if (closeAction === "close") {
        ipcRenderer.send("manualClose");
    } else if (closeAction === "minimize") {
        ipcRenderer.send("manualMinimize");
    }
});