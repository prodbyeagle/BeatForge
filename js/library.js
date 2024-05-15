document.addEventListener("auxclick", function (event) {
    if (event.button === 1) {
        event.preventDefault();
    }
});

const userData = JSON.parse(localStorage.getItem("userData"));

//* Context Code
//* Context Code
//* Context Code

let activeContextMenu = null;

function applyLibraryItemListeners() {
    const libraryItems = document.querySelectorAll(".library-item");
    libraryItems.forEach(item => {
        item.addEventListener("contextmenu", showContextMenu);
    });
}

function showContextMenu(event) {
    hideContextMenu();
    if (event.button === 2) {
        const libraryItem = event.target.closest('.library-item');
        if (libraryItem) {
            const contextMenuHTML = createContextMenuHTML();
            document.body.insertAdjacentHTML("beforeend", contextMenuHTML);
            activeContextMenu = document.querySelector(".context-menu");
            positionContextMenu(event);
            activateContextMenuListeners(libraryItem.dataset);
            document.addEventListener('click', hideContextMenuOnClickOutside);
        }
    }
}

function createContextMenuHTML() {
    return `
        <div class="context-menu">
            <ul>
                <li title="Delete the Track" class="context-menu-item">Delete Track</li>
                <li title="Edit The Metadata" class="context-menu-item">Edit Track</li>
                <li title="Edit the Current Tags" class="context-menu-item">Edit Tags</li>
                <hr>
                <li title="Delete the Track" class="context-menu-item">Go to Album</li>
                <li title="Edit The Metadata" class="context-menu-item">Go to Artist</li>
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
            const album = data.album;
            if (action === "Delete Track") {
                deleteTrack(songTitle, artist);
            } else if (action === "Edit Track") {
                editTrack(songTitle, artist, album);
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

//* Beat Code
//* Beat Code
//* Beat Code

let autoplayListenerAdded = false;

async function createLibraryItem(data, filePath) {
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
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.classList.add("play-button");
    playButton.style.cursor = "pointer";
    playButton.style.color = "var(--tertiary-color)";

    playButton.addEventListener('click', function () {
        const audioPlayer = document.getElementById('audio-player');

        if (audioPlayer.paused || audioPlayer.ended) {
            playAudioFile(filePath, true);
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    li.dataset.songTitle = data.title;
    li.dataset.artist = data.artist;
    li.dataset.album = data.album;
    li.dataset.length = data.length;
    li.dataset.filePath = filePath;

    li.appendChild(h2);
    li.appendChild(p1);
    li.appendChild(p2);
    li.appendChild(p3);
    li.appendChild(playButton);

    if (data.cover) {
        const coverImg = document.createElement("img");
        coverImg.classList.add("cover-image");
        coverImg.src = data.cover;

        li.appendChild(coverImg);
    }

    li.addEventListener('contextmenu', showContextMenu);
    li.addEventListener('dblclick', function (event) {
        playAudioFile(filePath, true);
    });

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

                        const [artist, album, length, cover] = await Promise.all([
                            window.audioMetadata.extractArtist(filePath),
                            window.audioMetadata.extractAlbum(filePath),
                            window.audioMetadata.extractDuration(filePath),
                            window.audioMetadata.extractAlbumCover(filePath)
                        ]);

                        const fileInfo = {
                            title: file.replace(/\.[^/.]+$/, ''),
                            location: folderPath,
                            album: album,
                            artist: artist,
                            length: length,
                            filePath: filePath,
                            cover: cover
                        };

                        const libraryItem = await createLibraryItem(fileInfo, filePath);
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
            await playAudioFile(filePath, true);;
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    } catch (error) {
        console.error('Error toggling playback:', error);
    }
}

async function playAudioFile(filePath, autoplay = false) {
    try {
        const audioPlayer = document.getElementById('audio-player');
        const playButton = document.querySelector('.play-button');

        // Check if the next song is already playing
        if (audioPlayer.src === filePath && !audioPlayer.paused) {
            return;
        }

        if (audioPlayer.src !== filePath) {
            audioPlayer.src = filePath;
            await audioPlayer.load();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }

        if (audioPlayer.paused || audioPlayer.ended) {
            await audioPlayer.play();
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            togglePlayerControls(true);
            updateTotalTime(formatTime(audioPlayer.duration));
            highlightCurrentPlayingCard(filePath);

            // Remove existing event listener if it exists
            audioPlayer.removeEventListener('ended', handleAutoplayNext);

            // Add event listener for autoplay
            if (autoplay) {
                audioPlayer.addEventListener('ended', handleAutoplayNext);
            }
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    } catch (error) {
        console.error('Error playing audio file:', error);
    }
}

function handleAutoplayNext() {
    const audioPlayer = document.getElementById('audio-player');
    const currentFilePath = audioPlayer.src;
    autoplayNextSong(currentFilePath);
}

function highlightCurrentPlayingCard(filePath) {
    const libraryItems = document.querySelectorAll('.library-item');
    libraryItems.forEach(item => {
        if (item.dataset.filePath === filePath) {
            item.style.border = '2px solid #7FC885';
        } else {
            item.style.border = 'none';
        }
    });
}

function updateMusicUI() {
    updateCurrentTime();
    updateProgress();
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

function updateProgress() {
    const audioPlayer = document.getElementById('audio-player');
    const progressBar = document.getElementById('progress-bar');
    const currentTime = audioPlayer.currentTime;
    const totalTime = audioPlayer.duration;

    if (!isNaN(totalTime)) {
        progressBar.style.width = `${(currentTime / totalTime) * 100}%`;
        updateProgressBallPosition();
    } else {
        progressBar.style.width = '0';
    }
}

function updateProgressBallPosition() {
    const audioPlayer = document.getElementById('audio-player');
    const progressBall = document.getElementById('progress-ball');
    const trackProgress = document.getElementById('track-progress');

    const progressWidth = trackProgress.clientWidth;
    const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    const ballPosition = (percentage * progressWidth) / 100;

    progressBall.style.right = `${progressWidth - ballPosition}px`;
}

function updateVolumeBallPosition() {
    const audioPlayer = document.getElementById('audio-player');
    const volumeBall = document.getElementById('volume-ball');
    const volumeRange = document.getElementById('volume-range');

    const volumeWidth = volumeRange.clientWidth;
    const volumePercentage = audioPlayer.volume * 100;
    const ballPosition = Math.min(Math.max(0, (volumePercentage * volumeWidth) / 100), volumeWidth);

    volumeBall.style.left = `${ballPosition}px`;
}

function updateVolume(mouseX) {
    const audioPlayer = document.getElementById('audio-player');
    const volumeRange = document.getElementById('volume-range');
    const rect = volumeRange.getBoundingClientRect();
    const volumeWidth = rect.width;
    let volumePercentage = ((mouseX - rect.left) / volumeWidth) * 100;
    volumePercentage = Math.max(0, Math.min(volumePercentage, 100));
    volumeRange.style.width = volumePercentage + '%';
    const volume = volumePercentage / 100;
    audioPlayer.volume = volume;
}

document.addEventListener('DOMContentLoaded', () => {
    const progressRange = document.getElementById('track-progress');
    const progressBall = document.getElementById('progress-ball');
    const trackProgress = document.getElementById('track-progress');
    const audioPlayer = document.getElementById('audio-player');
    const volumeBall = document.getElementById('volume-ball');
    const volumeBar = document.getElementById('volume-range');
    let isDragging = false;
    let isVolumeDragging = false;

    volumeBall.addEventListener('mousedown', startVolumeDragging);
    document.addEventListener('mousemove', handleVolumeDrag);
    document.addEventListener('mouseup', stopVolumeDragging);

    function startVolumeDragging(event) {
        event.preventDefault();
        isVolumeDragging = true;
        handleVolumeDrag(event);
    }

    function handleVolumeDrag(event) {
        if (isVolumeDragging) {
            const rect = volumeBar.getBoundingClientRect();
            const volumeWidth = rect.width;
            const offsetX = event.clientX - rect.left;
            let volumePercentage = (offsetX / volumeWidth) * 100;
            volumePercentage = Math.max(0, Math.min(volumePercentage, 100));
            setVolume(volumePercentage);
        }
    }

    function stopVolumeDragging() {
        isVolumeDragging = false;
    }

    progressRange.addEventListener('click', (event) => {
        const rect = progressRange.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const progressWidth = rect.width;
        const percentage = (offsetX / progressWidth);
        audioPlayer.currentTime = audioPlayer.duration * percentage;
    });

    function setVolume(volumePercentage) {
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.volume = volumePercentage / 100;
        updateVolumeBallPosition(volumePercentage);
        saveVolumeSetting(volumePercentage);
    }

    function updateVolumeBallPosition(volumePercentage) {
        const volumeWidth = volumeBar.clientWidth;
        const ballPosition = (volumePercentage * volumeWidth) / 100;
        volumeBall.style.left = `${ballPosition}px`;
    }

    function saveVolumeSetting(volumePercentage) {
        if (!userData) {
            console.error('userData not found.');
            return;
        }

        userData.volumePercentage = volumePercentage;
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    function loadVolumeSetting() {
        const savedUserData = JSON.parse(localStorage.getItem('userData'));
        console.log(savedUserData.volumePercentage)
        return savedUserData && savedUserData.volumePercentage ? savedUserData.volumePercentage : 100;
    }

    progressRange.addEventListener('click', (event) => {
        const rect = progressRange.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const progressWidth = rect.width;
        const percentage = (offsetX / progressWidth);
        audioPlayer.currentTime = audioPlayer.duration * percentage;
    });

    progressBall.addEventListener('mousedown', (event) => {
        isDragging = true;
        pauseAudio();
        handleTimeChange(event);
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    function mouseMoveHandler(event) {
        if (isDragging) {
            handleTimeChange(event);
        }
    }

    function mouseUpHandler() {
        if (isDragging) {
            isDragging = false;
            resumeAudio();
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }
    }

    function handleTimeChange(event) {
        const rect = trackProgress.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const progressWidth = rect.width;
        const percentage = Math.min(Math.max((offsetX / progressWidth), 0), 1);
        audioPlayer.currentTime = audioPlayer.duration * percentage;
    }

    function pauseAudio() {
        audioPlayer.pause();
    }

    function resumeAudio() {
        if (!audioPlayer.paused) return;
        audioPlayer.play();
    }

    let userData = JSON.parse(localStorage.getItem("userData"));
    let totalTimeDisplayMode = userData.totalTimeDisplayMode || 'normal';

    const totalTimeElement = document.getElementById('total-time');
    let timerId;

    updateTotalTimeDisplay();
    totalTimeElement.addEventListener('click', toggleTotalTimeDisplay);

    function toggleTotalTimeDisplay() {
        if (totalTimeDisplayMode === 'normal') {
            totalTimeDisplayMode = 'remaining';
        } else {
            totalTimeDisplayMode = 'normal';
        }
        updateTotalTimeDisplay();
        userData.totalTimeDisplayMode = totalTimeDisplayMode;
        localStorage.setItem("userData", JSON.stringify(userData));
    }

    function updateTotalTimeDisplay() {
        const audioPlayer = document.getElementById('audio-player');
        const currentTotalTime = audioPlayer.duration;
        const currentTime = audioPlayer.currentTime;

        if (totalTimeDisplayMode === 'normal') {
            clearInterval(timerId);
            totalTimeElement.textContent = formatTime(currentTotalTime);
        } else {
            const remainingTime = currentTotalTime - currentTime;
            if (!isNaN(remainingTime) && remainingTime >= 0) {
                totalTimeElement.textContent = '-' + formatTime(remainingTime);
                timerId = setInterval(updateRemainingTime, 1);
            } else {
                totalTimeElement.textContent = '- ' + '00:00';
            }
        }
    }

    function updateRemainingTime() {
        const audioPlayer = document.getElementById('audio-player');
        const currentTime = audioPlayer.currentTime;
        const currentTotalTime = audioPlayer.duration;
        const remainingTime = currentTotalTime - currentTime;
        totalTimeElement.textContent = '-' + formatTime(remainingTime);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    const volumeButton = document.getElementById('volume-button');
    volumeButton.addEventListener('click', toggleMute);

    function toggleMute() {
        if (audioPlayer.muted) {
            audioPlayer.muted = false;
            volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            audioPlayer.muted = true;
            volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
});

async function autoplayNextSong(currentFilePath) {
    try {
        const songsList = document.getElementById("songs-list");
        const currentSongItem = Array.from(songsList.children).find(item => item.dataset.filePath === currentFilePath);

        // Überprüfen, ob das aktuelle Song-Element gefunden wurde
        if (currentSongItem) {
            const currentSongIndex = Array.from(songsList.children).indexOf(currentSongItem);
            const nextSongItem = songsList.children[currentSongIndex + 1];

            // Überprüfen, ob das nächste Song-Element vorhanden ist
            if (nextSongItem) {
                const nextFilePath = nextSongItem.dataset.filePath;
                await playAudioFile(nextFilePath);
                console.log('Next song played successfully.');
            } else {
                const audioPlayer = document.getElementById('audio-player');
                audioPlayer.pause();
                console.log('No next song available. Audio player paused.');
            }
        } else {
            console.error('Current song item not found.');
        }
    } catch (error) {
        console.error('Error autoplaying next song:', error);
    }
}

function shuffleLibraryItems() {
    const libraryItems = document.querySelectorAll('.library-item');


    for (let i = libraryItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        libraryItems[i].parentNode.insertBefore(libraryItems[j], libraryItems[i]);
    }

    Toastify({
        text: `Shuffle Songs...`,
        duration: 450,
        gravity: "bottom",
        position: "right",
        style: {
            background: "linear-gradient(135deg, #00A36C, #007848)",
        },
        stopOnFocus: true,
    }).showToast();
}

function deleteTrack(songTitle, artist) {
    openCustomConfirm(
        `Are you sure you want to delete: "${songTitle}" by ${artist}?`,
        () => {
            Toastify({
                text: `${songTitle} Deleted!  NOT REAL NOT REAL NOT REAL NOT REAL NOT REAL NOT REAL NOT REAL NOT REAL`,
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

function editTrack(songTitle, artist, album) {
    const fileInfo = {
        title: songTitle,
        artist: artist,
        album: album,
    };
    createEditSongModal(fileInfo);
}

function editTags(songTitle) {
    Toastify({
        text: `"${songTitle}" Tags edited successfully! NOT REAL NOT REAL NOT REAL NOT REAL NOT REAL`,
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
        text: `"${songTitle}" added successfully to Queue! NOT REAL NOT REAL NOT REAL NOT REAL`,
        duration: 1500,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#00A36C",
        },
        stopOnFocus: true,
    }).showToast();
}

//* Search & Autocomplete Code
//* Search & Autocomplete Code
//* Search & Autocomplete Code

const libraryItems = document.querySelectorAll(".library-item");
const searchBar = document.querySelector(".search-bar");

searchBar.addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim();
    if (searchTerm.length > 0) {
        filterLibrary(searchTerm);
    } else {
        resetSearch();
    }
});

function resetSearch() {
    libraryItems.forEach(item => {
        item.style.display = "block";
    });
    searchBar.value = '';
    resetAutocomplete();
}

function filterLibrary(searchTerm) {
    libraryItems.forEach(item => {
        const title = item.querySelector("h2").textContent.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();

        if (title.includes(searchTermLower)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

searchBar.addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim();
    if (searchTerm.length > 0) {
        autocomplete(searchTerm);
    } else {
        resetAutocomplete();
    }
});

function autocomplete(searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    const suggestions = [];

    if (searchTermLower.startsWith('album:') || searchTermLower.startsWith('artist:')) {
        const filterType = searchTermLower.startsWith('album:') ? 'album' : 'artist';
        const filterValue = searchTerm.substring(filterType.length + 1);

        document.querySelectorAll('.library-item').forEach(card => {
            const filterableContent = card.querySelector(`p:nth-of-type(${filterType === 'album' ? 3 : 2})`).textContent.toLowerCase();

            if (filterableContent.includes(filterValue)) {
                if (filterType === 'artist') {
                    const artistName = card.querySelector('p:nth-of-type(1)').textContent.replace('Artist: ', '').toLowerCase();
                    if (!suggestions.includes(artistName)) {
                        suggestions.push(artistName);
                    }
                }
                else if (filterType === 'album') {
                    const albumTitle = card.querySelector('p:nth-of-type(2)').textContent.replace('Album: ', '').toLowerCase();
                    if (!suggestions.includes(albumTitle)) {
                        suggestions.push(albumTitle);
                    }
                }
            }
        });
    } else {
        document.querySelectorAll('.library-item').forEach(card => {
            const title = card.querySelector('h2').textContent.toLowerCase();
            if (title.includes(searchTermLower) && !suggestions.includes(title)) {
                suggestions.push(title);
            }
        });
    }

    const autocompleteContainer = document.getElementById("autocomplete-container");
    autocompleteContainer.innerHTML = '';

    if (suggestions.length > 0) {
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('autocomplete-dropdown');

        suggestions.forEach(suggestion => {
            const option = document.createElement('div');
            option.textContent = suggestion;
            option.classList.add('autocomplete-option');
            option.addEventListener('click', () => {
                scrollToLibraryItem(suggestion);
            });
            dropdownMenu.appendChild(option);
        });

        autocompleteContainer.appendChild(dropdownMenu);
    } else {
    }
}


function resetAutocomplete() {
    const autocompleteContainer = document.getElementById("autocomplete-container");
    autocompleteContainer.innerHTML = '';
}

function scrollToLibraryItem(title) {
    resetSearch();
    const libraryItems = document.querySelectorAll(".library-item");

    const matchingItem = Array.from(libraryItems).find(item => {
        const card = item.querySelector('h2');
        if (card) {
            const cardTitle = card.textContent.toLowerCase();
            return cardTitle === title.toLowerCase();
        } else {
            console.log("Fehler: 'h2' Element wurde nicht gefunden in:", item);
            return false;
        }
    });

    if (matchingItem) {
        matchingItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            if (matchingItem) {
                matchingItem.classList.add('blink');
                setTimeout(() => {
                    if (matchingItem) {
                        matchingItem.classList.remove('blink');
                    }
                }, 4000);
            }
        }, 500);
    } else {
        console.log("Fehler: Das entsprechende Library-Element wurde nicht gefunden.");
    }
}

//* Close or In Background
//* Close or In Background
//* Close or In Background

let closeAction = userData.closeAction;

if (!closeAction) {
    closeAction = "close";
    userData.closeAction = closeAction;
    localStorage.setItem("userData", JSON.stringify(userData));
}

document.getElementById("close").addEventListener("click", () => {
    if (closeAction === "close") {
        ipcRenderer.send("manualClose");
    } else if (closeAction === "minimize") {
        ipcRenderer.send("manualMinimize");
    }
});

setInterval(updateMusicUI, 1);