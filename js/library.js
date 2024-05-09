// Globale Variablen
let activeContextMenu = null;

// Event-Listener
document.addEventListener("auxclick", function (event) {
    if (event.button === 1) {
        event.preventDefault();
    }
});

window.addEventListener("load", () => {
    const appliedTheme = JSON.parse(localStorage.getItem("appliedTheme"));
    if (appliedTheme) {
        applyTheme(appliedTheme);
    } else {
        showThemeNotFoundError();
    }
});

window.addEventListener("focus", () => {
    resetFilter();
});

window.addEventListener("blur", () => {
    applyBlurFilter();
});

const userData = JSON.parse(localStorage.getItem("userData"));

try {
  if (userData) {
    updateUI(userData);
  } else {
    throw new Error("User data not found in localStorage");
  }
} catch (error) {
  error(error.message);
}

function updateUI(userData) {
  const sidebarText = document.querySelectorAll(".sidebar a");

  sidebarText.forEach((item) => {
    item.addEventListener("mouseenter", handleSidebarHover);
    item.addEventListener("mouseleave", handleSidebarLeave);
  });
  profilePicImg.src = userData.profilePic;

  const libraryItems = document.querySelectorAll(".library-item");

  libraryItems.forEach((item) => {
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showContextMenu(event);
    });
  });
}

function applySidebarListeners() {
    const sidebarLinks = document.querySelectorAll(".sidebar a");
    sidebarLinks.forEach(link => {
        link.addEventListener("mouseenter", handleSidebarHover);
        link.addEventListener("mouseleave", handleSidebarLeave);
    });
}

function updateProfilePic(userData) {
    const profilePicImg = document.getElementById("profile-pic");
    profilePicImg.src = userData.profilePic;
}

function applyLibraryItemListeners() {
    const libraryItems = document.querySelectorAll(".library-item");
    libraryItems.forEach(item => {
        item.addEventListener("contextmenu", showContextMenu);
    });
}

// Sidebar Hover-Handling
function handleSidebarHover(event) {
    const accentColor = userData?.accentColor || "#000000";
    const element = event.currentTarget;
    const icon = element.querySelector("i");
    element.style.color = accentColor;
    if (icon) icon.style.color = accentColor;
}

function handleSidebarLeave(event) {
    const element = event.currentTarget;
    const icon = element.querySelector("i");
    element.style.color = "var(--tertiary-color)";
    if (icon) icon.style.color = "var(--tertiary-color)";
}

function showContextMenu(event) {
    hideContextMenu();
    if (event.button === 2) {
        const libraryItem = event.target.closest('.library-item');
        if (libraryItem) {
            const songName = libraryItem.querySelector('h2').textContent;
            const artistParagraph = libraryItem.querySelector('p');
            const artist = artistParagraph ? artistParagraph.textContent.replace('Artist: ', '').trim() : ''; // Extrahiere den Künstlernamen
            const contextMenuHTML = createContextMenuHTML(songName, artist);
            document.body.insertAdjacentHTML("beforeend", contextMenuHTML);
            activeContextMenu = document.querySelector(".context-menu");
            positionContextMenu(event);
            activateContextMenuListeners(libraryItem.dataset);
            document.addEventListener('click', hideContextMenuOnClickOutside);
        }
    }
}

function createContextMenuHTML(songName, artist) {
    return `
        <div class="context-menu">
            <ul>
                <li title="${songName}" class="context-menu-item-noninteractive">"${songName}" by @${artist}</li>
                <hr>
                <li title="Play" class="context-menu-item-noninteractive">Play</li>
                <li title="Add to Queue" class="context-menu-item">Add to Queue</li>
                <hr>
                <li title="Delete the Track" class="context-menu-item">Delete Track</li>
                <li title="Edit The Metadata" class="context-menu-item">Edit Track</li>
                <li title="Edit the Current Tags" class="context-menu-item">Edit Tags</li>
                <hr>
                <li title="Tags" class="context-menu-item-noninteractive">Tags Placeholder</li>
            </ul>
        </div>
    `;
}

function positionContextMenu(event) {
    const menuHeight = activeContextMenu.offsetHeight;
    const menuWidth = activeContextMenu.offsetWidth;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const mouseY = event.clientY + window.scrollY;
    const mouseX = event.clientX + window.scrollX;
    const remainingVerticalSpace = windowHeight - mouseY;
    const remainingHorizontalSpace = windowWidth - mouseX;

    activeContextMenu.style.top =
        mouseY + (remainingVerticalSpace < menuHeight ? -menuHeight : 0) + "px";
    activeContextMenu.style.left =
        mouseX + (remainingHorizontalSpace < menuWidth ? -menuWidth : 0) + "px";
}

function activateContextMenuListeners(data) {
    const contextMenuItems = document.querySelectorAll(".context-menu-item");
    contextMenuItems.forEach(item => {
        item.addEventListener("click", (event) => handleContextMenuItemClick(event, data));
    });
}

function handleContextMenuItemClick(event, data) {
    const action = event.target.textContent;
    hideContextMenu();
    const libraryItem = document.querySelector(`.library-item[data-song-title="${data.songTitle}"]`);
    if (libraryItem) {
        const songTitle = data.songTitle;
        if (songTitle) {
            const artist = data.artist;
            if (action === "Delete Track") {
                deleteTrack(songTitle, artist);
            } else if (action === "Edit Track") {
                editTrack(songTitle, artist);
            } else if (action === "Edit Tags") {
                editTags(songTitle);
            } else if (action === "Add to Queue") {
                addToQueue(songTitle);
            }
        } else {
            showError("Song title not found in dataset");
        }
    } else {
        showError("Library item not found");
        console.error("Library item not found. Event details:", "Data:", data);
    }
}

function hideContextMenuOnClickOutside(event) {
    if (activeContextMenu && !activeContextMenu.contains(event.target)) {
        hideContextMenu();
    }
}

function hideContextMenu() {
    if (activeContextMenu) {
        activeContextMenu.remove();
        activeContextMenu = null;
    }
}

// Toastify Error
function showError(message) {
    Toastify({
        text: message,
        duration: 5000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#ff0000",
        },
        stopOnFocus: true,
    }).showToast();
}

// Theme Handling
function applyTheme(theme) {
    theme.values.forEach(color => {
        document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
    });
    applyContextMenuTheme(theme);
}

function applyContextMenuTheme(theme) {
    const contextMenu = document.querySelector(".context-menu");
    if (contextMenu) {
        const secondaryColor = getColorByName(theme, "secondary");
        const tertiaryColor = getColorByName(theme, "tertiary");
        const quaternaryColor = getColorByName(theme, "quaternary");

        contextMenu.style.backgroundColor = secondaryColor;
        const menuItems = contextMenu.querySelectorAll(".context-menu-item");
        menuItems.forEach(item => {
            item.style.color = tertiaryColor;
        });
        const hr = contextMenu.querySelector("hr");
        if (hr) hr.style.borderColor = quaternaryColor;
    }
}

function getColorByName(theme, name) {
    return theme.values.find(color => color.name === name).color;
}

function showThemeNotFoundError() {
    Toastify({
        text: "The applied theme no longer exists.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "var(--primary-color)",
        },
        stopOnFocus: true,
    }).showToast();
}

// Filter Handling
function resetFilter() {
    document.documentElement.style.transition = "filter 0.3s";
    document.documentElement.style.filter = "grayscale(0%) brightness(100%)";
}

function applyBlurFilter() {
    document.documentElement.style.transition = "filter 0.3s";
    document.documentElement.style.filter = "grayscale(60%) brightness(60%)";
}

// Library Item Creation
function createLibraryItem(data) {
    const li = document.createElement("li");
    li.classList.add("library-item");

    const h2 = document.createElement("h2");
    h2.textContent = data.title;

    const p1 = document.createElement("p");
    p1.textContent = "Artist: " + data.artist;

    const p2 = document.createElement("p");
    p2.textContent = "Genre: " + data.genre;

    li.dataset.songTitle = data.title;
    li.dataset.artist = data.artist;
    li.dataset.genre = data.genre;

    li.appendChild(h2);
    li.appendChild(p1);
    li.appendChild(p2);

    li.addEventListener('contextmenu', showContextMenu);

    return li;
}

// Library Data Initialization
const libraryData = [
    { title: "WHAT??", location: "London", genre: "Rock", artist: "dwhincandi" },
    { title: "INDEED!", location: "Berlin", genre: "Pop", artist: "prodbyeagle" },
    { title: "Song Title 1", location: "New York", genre: "Hip Hop", artist: "artist1" },
    { title: "Song Title 2", location: "Los Angeles", genre: "R&B", artist: "artist2" },
    { title: "Song Title 3", location: "Chicago", genre: "Jazz", artist: "artist3" },
    { title: "Song Title 4", location: "Miami", genre: "Reggae", artist: "artist4" },
    { title: "Song Title 5", location: "Paris", genre: "Classical", artist: "artist5" },
    { title: "Song Title 6", location: "Tokyo", genre: "Electronic", artist: "artist6" },
    { title: "Song Title 7", location: "Sydney", genre: "Indie", artist: "artist7" },
    { title: "Song Title 8", location: "Toronto", genre: "Funk", artist: "artist8" },
    { title: "Song Title 9", location: "Rio de Janeiro", genre: "Samba", artist: "artist9" },
    { title: "Song Title 10", location: "Berlin", genre: "Techno", artist: "artist10" },
];

// Populate Songs List
const songsList = document.getElementById("songs-list");
libraryData.forEach(data => {
    const libraryItem = createLibraryItem(data);
    songsList.appendChild(libraryItem);
});

// Action Functions
function deleteTrack(songTitle, artist) {
    openCustomConfirm(
        `Are you sure you want to delete: "${songTitle}" by ${artist}?`,
        () => {
            Toastify({
                text: `${songTitle} Deleted!`,
                duration: 1500,
                gravity: "bottom",
                position: "right",
                style: {
                    background: "#00A36C",
                },
                stopOnFocus: true,
            }).showToast();
        }
    );
}

function editTrack(songTitle, artist) {
    Toastify({
        text: `Track "${songTitle}" by ${artist} edited successfully!`,
        duration: 1500,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#00A36C",
        },
        stopOnFocus: true,
    }).showToast();
}

function editTags(songTitle) {
    Toastify({
        text: `"${songTitle}" Tags edited successfully!`,
        duration: 1500,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#00A36C",
        },
        stopOnFocus: true,
    }).showToast();
}

function addToQueue(songTitle) {
    Toastify({
        text: `"${songTitle}" added successfully to Queue!`,
        duration: 1500,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#00A36C",
        },
        stopOnFocus: true,
    }).showToast();
}

function openCustomConfirm(message, onConfirm) {
    const overlay = document.querySelector(".confirm-overlay");
    overlay.classList.add("show");

    const confirm = document.getElementById("confirm");
    const confirmationText = document.getElementById("confirmation_text");

    confirmationText.textContent = message;
    confirm.style.display = "block";

    const confirmButton = document.getElementById("confirm_button");
    const cancelButton = document.getElementById("cancel_button");

    confirmButton.onclick = function () {
        confirm.style.display = "none";
        overlay.classList.remove("show");
        onConfirm();
    };

    cancelButton.onclick = function () {
        confirm.style.display = "none";
        overlay.classList.remove("show");
    };
}