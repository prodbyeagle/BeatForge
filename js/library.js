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

// SONGS

function createLibraryItem(data, filePath) {
    const li = document.createElement("li");
    li.classList.add("library-item");

    const h2 = document.createElement("h2");
    h2.textContent = data.title;

    const p1 = document.createElement("p");
    p1.textContent = "Artist: " + data.artist;

    const p2 = document.createElement("p");
    p2.textContent = "Album: " + data.album;

    const p3 = document.createElement("p");
    p3.textContent = "Length: " + data.length;

    const playButton = document.createElement("button");
    playButton.textContent = "⏯️";
    playButton.classList.add("play-button");
    playButton.addEventListener('click', function(event) {
        const audioPlayer = document.getElementById('audio-player');

        if (audioPlayer.paused || audioPlayer.ended) {
            playAudioFile(filePath);
            playButton.textContent = "⏸️";
        } else {
            audioPlayer.pause();
            playButton.textContent = "⏯️";
        }

        const libraryItem = playButton.closest('.library-item');
        if (libraryItem) {
            updateNowPlaying(libraryItem.dataset.songTitle, libraryItem.dataset.artist);
        }
    });

    li.dataset.songTitle = data.title;
    li.dataset.artist = data.artist;
    li.dataset.album = data.album;
    li.dataset.length = data.length;
    li.dataset.filePath = filePath; // Add filePath to dataset

    li.appendChild(h2);
    li.appendChild(p1);
    li.appendChild(p2);
    li.appendChild(p3);
    li.appendChild(playButton);

    li.addEventListener('contextmenu', showContextMenu);

    return li;
}

async function getFoldersFromMainProcess() {
    try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const folders = userData.folders || [];
    return folders;
    } catch (error) {
        console.error('Fehler beim Abrufen der Ordnerpfade vom Hauptprozess:', error);
        return [];
    }
}

async function importFilesFromFolders() {
    try {
        const folders = await getFoldersFromMainProcess();
        await importFilesFromFoldersHelper(folders);
    } catch (error) {
        console.error('Fehler beim Importieren von Dateien aus den Ordnern:', error);
    }
}

async function importFilesFromFoldersHelper(folderPaths) {
    try {
        if (Array.isArray(folderPaths)) {
            for (const folderPath of folderPaths) {
                const files = await window.fileSystem.readDirectory(folderPath);
                for (const file of files) {
                    if (file.endsWith('.mp3') || file.endsWith('.wav')) {
                        const filePath = folderPath + '/' + file;
                        const artist = await window.audioMetadata.extractArtist(filePath);
                        const album = await window.audioMetadata.extractAlbum(filePath);
                        const length = await window.audioMetadata.extractDuration(filePath);

                        const fileInfo = {
                            title: file.replace(/\.[^/.]+$/, ''),
                            location: folderPath,
                            album: album,
                            artist: artist,
                            length: length,
                            filePath: filePath
                        };

                        const libraryItem = createLibraryItem(fileInfo, filePath);
                        const songsList = document.getElementById("songs-list");
                        songsList.appendChild(libraryItem);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Fehler beim Importieren von Dateien aus den Ordnern:', error);
    }
}

importFilesFromFolders();

async function togglePlayPause(event, filePath) {
    const audioPlayer = document.getElementById('audio-player');
    const playButton = event.target;

    if (!playButton) return;

    try {
        if (audioPlayer.paused || audioPlayer.ended) {
            await playAudioFile(filePath); // Hier wird der Song nur gespielt, wenn er pausiert oder beendet ist
            playButton.textContent = '⏯️';
        } else {
            audioPlayer.pause();
            playButton.textContent = '⏸️';
        }

        const libraryItem = playButton.closest('.library-item');
        if (libraryItem) {
            updateNowPlaying(libraryItem.dataset.songTitle, libraryItem.dataset.artist);
        }
    } catch (error) {
        console.error('Error toggling playback:', error);
    }
}

async function playAudioFile(filePath) {
    try {
        const audioPlayer = document.getElementById('audio-player');
        const playButton = document.querySelector('.play-button');
        
        if (audioPlayer.src !== filePath) {
            audioPlayer.src = filePath;
            await audioPlayer.load(); // Neues Laden des Audio-Elements, um sicherzustellen, dass die Metadaten aktualisiert werden
            playButton.textContent = "⏯️"; // Setze den Button-Text zurück, wenn eine neue Datei geladen wird
        }
        
        if (audioPlayer.paused || audioPlayer.ended) {
            await audioPlayer.play();
            playButton.textContent = "⏸️";
            togglePlayerControls(true);
            updateTotalTime(formatTime(audioPlayer.duration));
        } else {
            audioPlayer.pause();
            playButton.textContent = "⏯️";
        }
    } catch (error) {
        console.error('Error playing audio file:', error);
    }
}

function updateNowPlaying(songTitle, artist) {
    const nowPlayingElement = document.getElementById('now-playing');
    if (nowPlayingElement) {
        nowPlayingElement.textContent = `Now Playing: ${songTitle} - ${artist}`;
    } else {
        console.error("Element with ID 'now-playing' not found.");
    }
}

function updateMusicUI() {
    updateCurrentTime();
}

function updateCurrentTime() {
    const audioPlayer = document.getElementById('audio-player');
    const currentTimeElement = document.getElementById('current-time');
    currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateTotalTime(newTime) {
    const totalTimeElement = document.getElementById('total-time');
    totalTimeElement.textContent = newTime;
}

function togglePlayerControls(visible) {
    const playerControls = document.getElementById('player-controls');
    playerControls.style.transform = visible ? 'translateY(0%)' : 'translateY(350%)';
}

document.addEventListener('DOMContentLoaded', () => {
    const volumeRange = document.getElementById('volumeRange');
    volumeRange.addEventListener('input', () => {
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.volume = volumeRange.value / 100;
    });

    const progressRange = document.getElementById('progressRange');
    progressRange.addEventListener('input', () => {
        const audioPlayer = document.getElementById('audio-player');
        const seekTime = (progressRange.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
});

setInterval(updateMusicUI, 500);

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