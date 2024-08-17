const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs").promises;
const mm = require("music-metadata");
const path = require("path");

contextBridge.exposeInMainWorld("fileSystem", {
  readDirectory: async (folderPath) => {
    try {
      return await fs.readdir(folderPath);
    } catch (error) {
      console.error("Fehler beim Lesen des Verzeichnisses:", error);
      return [];
    }
  },
});

contextBridge.exposeInMainWorld("audioMetadata", {
  extractArtist: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath);
      if (metadata.common && metadata.common.artist) {
        return metadata.common.artist;
      } else {
        return "Unknown";
      }
    } catch (error) {
      console.error("Error extracting artist:", error);
      return "Unknown";
    }
  },
  extractAlbum: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath);
      if (metadata.common && metadata.common.album) {
        return metadata.common.album;
      } else {
        return "Unknown Album";
      }
    } catch (error) {
      console.error("Error extracting album:", error);
      return "Unknown Album";
    }
  },
  extractTitle: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath);
      if (metadata.common && metadata.common.title) {
        return metadata.common.title;
      } else {
        return "Unknown Title";
      }
    } catch (error) {
      console.error("Error extracting Title:", error);
      return "Unknown Title";
    }
  },
  extractDuration: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath);
      if (metadata.format && metadata.format.duration) {
        // Convert duration to minutes:seconds format
        const durationInSeconds = metadata.format.duration;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      } else {
        return "Unknown";
      }
    } catch (error) {
      console.error("Error extracting duration:", error);
      return "Unknown";
    }
  },
  extractAlbumCover: async (filePath) => {
    try {
      const metadata = await mm.parseFile(filePath, { includeNative: true });
      if (
        metadata.common &&
        metadata.common.picture &&
        metadata.common.picture.length > 0
      ) {
        const picture = metadata.common.picture[0];
        const base64String = picture.data.toString("base64");
        const mimeType = picture.format;
        return `data:${mimeType};base64,${base64String}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error extracting album cover:", error);
      return null;
    }
  },
  extractModifiedDate: async (filePath) => {
    try {
      const stats = await fs.stat(filePath);
      if (stats && stats.mtime) {
        return stats.mtime.getTime();
      } else {
        console.error(
          "Das Dateisystem hat keine Informationen über die Datei bereitgestellt:",
          filePath
        );
        return null;
      }
    } catch (error) {
      console.error("Fehler beim Extrahieren des Änderungsdatums:", error);
      return null;
    }
  },
  getLatestBeats: async (foldersArray, numberOfBeats = 5) => {
    try {
      const musicFiles = [];

      for (const folderPath of foldersArray) {
        const files = await fs.readdir(folderPath);

        for (const file of files) {
          const filePath = path.join(folderPath, file);
          const stats = await fs.stat(filePath);

          if (
            stats.isFile() &&
            (file.endsWith(".mp3") || file.endsWith(".wav"))
          ) {
            const modifiedDate = await audioMetadata.extractModifiedDate(
              filePath
            );
            const title = (await audioMetadata.extractTitle(filePath)) || file;
            const artist = await audioMetadata.extractArtist(filePath);
            const albumCover = await audioMetadata.extractAlbumCover(filePath);

            musicFiles.push({
              title,
              artist,
              modifiedDate,
              albumCover,
              filePath,
            });
          }
        }
      }

      // Sortiere Musikdateien nach Änderungsdatum (neueste zuerst)
      musicFiles.sort((a, b) => b.modifiedDate - a.modifiedDate);

      // Nimm nur die neuesten "numberOfBeats" Dateien
      return musicFiles.slice(0, numberOfBeats);
    } catch (error) {
      console.error("Fehler beim Abrufen der neuesten Beats:", error);
      return [];
    }
  },
});

// async function extractDuration(durationInSeconds) {
//   const minutes = Math.floor(durationInSeconds / 60);
//   const seconds = Math.floor(durationInSeconds % 60);
//   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
// }

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args));
  },
  invoke: async (channel, data) => {
    return await ipcRenderer.invoke(channel, data);
  },
});