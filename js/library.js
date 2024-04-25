const userData = JSON.parse(localStorage.getItem("userData"));


function updateUI(userData) {
    const accentColor = userData.accentColor || "#000000";
    const sidebarIcons = document.querySelectorAll(".sidebar a i");
    const sidebarText = document.querySelectorAll(".sidebar a");

    sidebarText.forEach((item) => {
        item.addEventListener("mouseenter", handleSidebarHover);
        item.addEventListener("mouseleave", handleSidebarLeave);
    });


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


const savedUserData = localStorage.getItem("userData");
if (savedUserData) {
    const userData = JSON.parse(savedUserData);
    updateUI(userData);
}

document.addEventListener('auxclick', function (event) {
    if (event.button === 1) {
        event.preventDefault();
    }
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
                background: "linear-gradient(to right, #FF5733, #FFB833)",
            },
            stopOnFocus: true,
        }).showToast();
    }
});