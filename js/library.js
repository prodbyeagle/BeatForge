document.addEventListener("auxclick", function (event) {
    if (event.button === 1) {
        event.preventDefault();
    }
});

const userData = JSON.parse(localStorage.getItem("userData"));
const tags = userData.tags;

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
                <li title="😜" class="context-menu-item-noninteractive">😜</li>
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
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("context-menu-item")) {
            handleContextMenuItemClick(event, data);
        }
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
                deleteTrack(songTitle);
            } else if (action === "Edit Track") {
                editTrack(songTitle, artist, album);
            } else if (action === "Edit Tags") {
                createEditTagModal(tags)
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

async function togglePlayPause(event, filePath) {
    const audioPlayer = document.getElementById('audio-player');
    const playButton = event.target;

    if (!playButton) return;

    try {
        if (audioPlayer.paused || audioPlayer.ended) {
            await playAudioFile(filePath, true);
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            pauseAudio();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }

        // Send media command to main process
        ipcRenderer.send('media-command', audioPlayer.paused ? 'pause' : 'play');
    } catch (error) {
        console.error('Error toggling playback:', error);
    }
}

async function playAudioFile(filePath, autoplay = false) {
    try {
        console.log('Playing audio file:', filePath);
        const audioPlayer = document.getElementById('audio-player');
        const playButton = document.querySelector('.play-button');

        // Ensure audioPlayer and playButton are available
        if (!audioPlayer || !playButton) {
            console.error('Audio player or play button not found.');
            return;
        }

        // Check if the browser supports the audio format
        if (!audioPlayer.canPlayType('audio/mpeg') && !audioPlayer.canPlayType('audio/wav')) {
            console.error('Browser does not support the audio format.');
            return;
        }

        // Check if the file exists
        const fileExists = await checkFileExists(filePath);
        if (!fileExists) {
            // Wenn die Datei nicht vorhanden ist, sende ein Toastify
            Toastify({
                text: 'File not found.',
                duration: 3000,
                gravity: "bottom",
                position: "right",
                style: {
                    background: "linear-gradient(135deg, #FF6347, #B22222)",
                },
            }).showToast();
            return;
        }

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

function playPause() {
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-button');

    if (!audioPlayer || !playButton) {
        console.error('Audio player or play button not found.');
        return;
    }

    if (audioPlayer.paused || audioPlayer.ended) {
        // Wenn das Audio pausiert ist oder beendet wurde, starte es
        audioPlayer.play();
        playButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        // Wenn das Audio gerade spielt, pausiere es
        audioPlayer.pause();
        playButton.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Funktion zum Überprüfen, ob die Datei existiert
async function checkFileExists(filePath) {
    return new Promise(resolve => {
        fetch(filePath)
            .then(response => {
                if (response.ok) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(() => resolve(false));
    });
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

    // Call this function on page load
    window.onload = function () {
        loadSortCriteria();
        importFilesFromFolders(); // Ensure files are imported after setting the sort criteria
    };

    function startVolumeDragging(event) {
        event.preventDefault();
        isVolumeDragging = true;
        handleVolumeDrag(event);
    }

    function pauseAudio() {
        audioPlayer.pause();
    }

    function resumeAudio() {
        if (!audioPlayer.paused) return;
        audioPlayer.play();
    }

    function handleVolumeDrag(event) {
        if (isVolumeDragging) {
            const rect = volumeBar.getBoundingClientRect();
            const volumeWidth = rect.width;
            const offsetX = event.clientX - rect.left;
            let volumePercentage = (offsetX / volumeWidth) * 100;
            volumePercentage = Math.max(0, Math.min(volumePercentage, 100));
            setVolume(volumePercentage); // Lautstärke sofort setzen
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
        // Umrechnung in den Bereich von 0 bis 1
        const volumeValue = volumePercentage / 100;
        audioPlayer.volume = volumeValue;
        updateVolumeBallPosition(volumePercentage);
        saveVolumeSetting(volumePercentage);
    }

    window.addEventListener('resize', () => {
        const volumePercentage = getVolumePercentageFromBallPosition();
        updateVolumeBallPosition(volumePercentage);
    });

    function getVolumePercentageFromBallPosition() {
        const volumeWidth = volumeBar.clientWidth;
        const ballPosition = parseFloat(volumeBall.style.left);
        return (ballPosition / volumeWidth) * 100;
    }

    function updateVolumeBallPosition(volumePercentage) {
        const volumeWidth = volumeBar.clientWidth;
        const ballPosition = (volumePercentage * volumeWidth) / 100;
        volumeBall.style.left = `${ballPosition}px`;
    }

    function saveVolumeSetting(volumePercentage) {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        localStorage.removeItem('volumePercentage');

        userData.volumePercentage = volumePercentage;
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    function loadVolumeSetting() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const volumePercentage = userData.volumePercentage;
        if (!isNaN(volumePercentage)) {
            return Math.max(0, Math.min(volumePercentage, 100));
        }
        return 100;
    }

    // Lautstärke beim Laden setzen
    const initialVolume = loadVolumeSetting();
    setVolume(initialVolume);

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

    const sidebar = document.querySelector(".sidebar");
    const container = document.querySelector(".container");

    sidebar.addEventListener("mouseenter", function () {
        container.style.marginLeft = "210px"; // Adjust this value according to the expanded width of the sidebar
    });

    sidebar.addEventListener("mouseleave", function () {
        container.style.marginLeft = "120px"; // Adjust this value to the default width of the sidebar
    });
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

function deleteTrack(songTitle) {
    openCustomConfirm(
        `Are you sure you want to delete: "${songTitle}"?`,
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

function editTrack(songTitle) {
    Toastify({
        text: `"${songTitle}" edited successfully!`,
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