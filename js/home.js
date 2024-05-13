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
    const latestBeats = [];
    latestBeats.forEach((beat) => {
        const li = document.createElement("li");
        li.textContent = beat;
        latestBeatsElement.appendChild(li);
    });


    function updateUI(userData) {
        const accentColor = userData.accentColor || "#000000";
        const sidebarText = document.querySelectorAll(".sidebar a");
        const loaderIcon = document.querySelector(".loader-icon l-line-wobble");
        usernameElement.textContent = userData.username;
        usernameElement.style.color = accentColor;

        loaderIcon.setAttribute("color", accentColor);

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
        debug_modal.style.display = "none"
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

function updateMemoryUsage() {
    var appMemoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
    document.getElementById("app-memory-usage").innerText = "Memory Usage: " + appMemoryUsage.toFixed(2) + " MB";
}
setInterval(updateMemoryUsage, 250);


function updateDeviceInfo() {
    document.getElementById("device-os").innerText = "OS: " + navigator.userAgentData.platform;
}


function updateCpuInfo() {

    var start = performance.now();
    var iterations = 1000000;


    for (var i = 0; i < iterations; i++) {
        Math.sqrt(i);
    }

    var end = performance.now();
    var duration = end - start;

    var cpuUsage = (duration / iterations) * 100;


    document.getElementById("cpu-usage").innerText = "CPU Usage: " + cpuUsage.toFixed(2) + "%";
}


function updateGpuInfo() {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        document.getElementById("gpu-name").innerText = "GPU Name: WebGL not supported by the browser";
        return;
    }

    var rendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
    var renderer = gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);


    var gpuName = renderer;


    if (renderer.includes("NVIDIA")) {
        gpuName = renderer.substring(renderer.indexOf("NVIDIA")).trim();
    } else if (renderer.includes("AMD")) {
        gpuName = renderer.substring(renderer.indexOf("AMD")).trim();
    } else if (renderer.includes("Intel")) {
        gpuName = renderer.substring(renderer.indexOf("Intel")).trim();
    } else if (renderer.includes("Qualcomm")) {
        gpuName = renderer.substring(renderer.indexOf("Qualcomm")).trim();
    }


    var bracketIndex = gpuName.indexOf("(");
    if (bracketIndex !== -1) {
        gpuName = gpuName.substring(0, bracketIndex).trim();
    }


    document.getElementById("gpu-name").innerText = "GPU Name: " + gpuName;
}

function toggleDebugMenu() {
    var debug_modal = document.getElementById("debug_modal");
    var overlay = document.getElementById("overlay");
    if (debug_modal.style.display === "none") {
        debug_modal.style.display = "block";
        overlay.classList.add("show");
        updateMemoryUsage();
        updateDeviceInfo();
        updateCpuInfo();
        updateGpuInfo();
    } else {
        debug_modal.style.display = "none";
        overlay.classList.remove("show");
    }
}

function openCustomConfirm(message, onConfirm) {
    const confirm = document.getElementById('confirm');
    const confirmationText = document.getElementById('confirmation_text');

    confirmationText.textContent = message;
    confirm.style.display = 'block';
    confirm.style.zIndex = '9999'

    const confirmButton = document.getElementById('confirm_button');
    const cancelButton = document.getElementById('cancel_button');

    confirmButton.onclick = function () {
        confirm.style.display = 'none';
        onConfirm();
    }

    cancelButton.onclick = function () {
        confirm.style.display = 'none';
    }
}

document.getElementById('debug-button').addEventListener('click', () => {
    openCustomConfirm(`Are you sure to clear the UserData?`, () => {
        localStorage.clear();
        ipcRenderer.send('perform-debug-actions');
    });
});

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.shiftKey && event.key === "D") {
        toggleDebugMenu();
    }
});

      window.addEventListener("focus", () => {
        document.documentElement.style.transition = "filter 0.5s";
        document.documentElement.style.filter =
          "grayscale(0%) brightness(100%)";
      });

      window.addEventListener("blur", () => {
        document.documentElement.style.transition = "filter 0.5s";
        document.documentElement.style.filter =
          "grayscale(60%) brightness(60%)";
      });

      //* Scroll Code

var modal = document.getElementById('modal');
var isScrolling = false;
var startY;
var startScrollTop;

modal.addEventListener('mousedown', function(e) {
    isScrolling = true;
    startY = e.pageY;
    startScrollTop = modal.scrollTop;
});

modal.addEventListener('mousemove', function(e) {
    if (!isScrolling) return;
    var delta = startY - e.pageY;
    modal.scrollTop = startScrollTop + delta;
});

modal.addEventListener('mouseup', function() {
    isScrolling = false;
});

modal.addEventListener('mouseleave', function() {
    isScrolling = false;
});