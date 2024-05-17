// importFiles.js

async function getFoldersFromMainProcess() {
   try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const folders = userData.folders || [];
      return folders;
   } catch (error) {
      console.error('Fehler beim Abrufen der Ordnerpfade vom Hauptprozess:', error);
      return [];
   }
}

// Funktion zum Anzeigen der Ladeanzeige
function showLoadingIndicator() {
   const loadingIndicator = document.getElementById("loading-indicator");
   loadingIndicator.style.display = "block";
}

// Funktion zum Ausblenden der Ladeanzeige
function hideLoadingIndicator() {
   const loadingIndicator = document.getElementById("loading-indicator");
   loadingIndicator.style.display = "none";
}

async function importFilesFromFolders() {
   try {
      showLoadingIndicator(); // Anzeigen der Ladeanzeige
      const folders = await getFoldersFromMainProcess();
      await importFilesFromFoldersHelper(folders);
      loadSortCriteria();
      hideLoadingIndicator(); // Ausblenden der Ladeanzeige nach Abschluss des Imports
   } catch (error) {
      console.error('Fehler beim Importieren von Dateien aus den Ordnern:', error);
      hideLoadingIndicator(); // Auch bei einem Fehler die Ladeanzeige ausblenden
   }
}

async function importFilesFromFoldersHelper(folderPaths) {
   try {
      for (const folderPath of folderPaths) {
         const files = await window.fileSystem.readDirectory(folderPath);
         for (const file of files) {
            if (file.endsWith('.mp3') || file.endsWith('.wav')) {
               const filePath = `${folderPath}/${file}`;
               // console.log('Generated filePath:', filePath);
               const [artist, album, length, cover, date] = await Promise.all([
                  window.audioMetadata.extractArtist(filePath),
                  window.audioMetadata.extractAlbum(filePath),
                  window.audioMetadata.extractDuration(filePath),
                  window.audioMetadata.extractAlbumCover(filePath),
                  window.audioMetadata.extractModifiedDate(filePath)
               ]);
               const fileInfo = {
                  title: file.replace(/\.[^/.]+$/, ''),
                  location: folderPath,
                  album: album,
                  artist: artist,
                  length: length,
                  date: date,
                  filePath: filePath,
                  cover: cover,
               };
               await createAndAppendLibraryItem(fileInfo, filePath);
            }
         }
      }
   } catch (error) {
      console.error('Fehler beim Importieren von Dateien aus den Ordnern:', error);
   }
}

async function createAndAppendLibraryItem(fileInfo, filePath) {
   try {
      const libraryItem = await createLibraryItem(fileInfo, filePath);
      const songsList = document.getElementById("songs-list");
      songsList.appendChild(libraryItem);
   } catch (error) {
      console.error('Fehler beim Erstellen und Anhängen des Bibliothekseintrags:', error);
   }
}

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
   li.dataset.modified = data.date;

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
   li.addEventListener('dblclick', function () {
      playAudioFile(filePath, true);
   });

   return li;
}

document.getElementById('sort-select').addEventListener('change', function () {
   const selectedCriteria = this.value;
   saveSortCriteria(selectedCriteria);
   sortLibrary(selectedCriteria);
});

// Function to save sort criteria in userData
function saveSortCriteria(criteria) {
   const userData = JSON.parse(localStorage.getItem('userData')) || {};
   userData.sortCriteria = criteria;
   localStorage.setItem('userData', JSON.stringify(userData));
}

function sortLibrary(criteria) {
   const songsList = document.getElementById("songs-list");
   const items = Array.from(songsList.getElementsByClassName("library-item"));

   items.sort((a, b) => {
      let aValue, bValue;

      switch (criteria) {
         case 'title':
            aValue = a.dataset.songTitle.toLowerCase();
            bValue = b.dataset.songTitle.toLowerCase();
            break;
         case 'duration':
            aValue = parseFloat(a.dataset.length);
            bValue = parseFloat(b.dataset.length);
            break;
         case 'album':
            aValue = a.dataset.album.toLowerCase();
            bValue = b.dataset.album.toLowerCase();
            break;
         case 'newest':
            aValue = parseInt(a.dataset.modified, 10);
            bValue = parseInt(b.dataset.modified, 10);
            return bValue - aValue;
         default:
            return 0;
      }
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
   });

   songsList.innerHTML = '';
   items.forEach(item => songsList.appendChild(item));
}

function loadSortCriteria() {
   const userData = JSON.parse(localStorage.getItem('userData')) || {};
   const sortCriteria = userData.sortCriteria || 'title'; // Default to 'title' if no criteria is set
   document.getElementById('sort-select').value = sortCriteria;
   sortLibrary(sortCriteria);
}