const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const mm = require('music-metadata');

contextBridge.exposeInMainWorld('fileSystem', {
    readDirectory: async (folderPath) => {
        try {
            const files = await fs.promises.readdir(folderPath);
            return files;
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }
});

contextBridge.exposeInMainWorld('audioMetadata', {
    extractArtist: async (filePath) => {
        try {
            const metadata = await mm.parseFile(filePath);
            if (metadata.common && metadata.common.artist) {
                return metadata.common.artist;
            } else {
                return "Unknown";
            }
        } catch (error) {
            console.error('Error extracting artist:', error);
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
            console.error('Error extracting album:', error);
            return "Unknown Album";
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
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return "Unknown";
            }
        } catch (error) {
            console.error('Error extracting duration:', error);
            return "Unknown";
        }
    },
    extractAlbumCover: async (filePath) => {
        try {
            const metadata = await mm.parseFile(filePath, { includeNative: true });
            if (metadata.common && metadata.common.picture && metadata.common.picture.length > 0) {
                const picture = metadata.common.picture[0];
                const base64String = picture.data.toString('base64');
                const mimeType = picture.format;
                return `data:${mimeType};base64,${base64String}`;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error extracting album cover:', error);
            return null;
        }
    },
    extractAlbumData: async (filePath) => {
        try {
            const metadata = await mm.parseFile(filePath, { includeNative: true });

            const albumData = {
                title: metadata.common && metadata.common.album ? metadata.common.album : "Unknown Album",
                artist: metadata.common && metadata.common.artist ? metadata.common.artist : "Unknown Artist",
                genre: metadata.common && metadata.common.genre ? metadata.common.genre : "Unknown Genre",
                year: metadata.common && metadata.common.year ? metadata.common.year : "Unknown Year",
                duration: metadata.format && metadata.format.duration ? await extractDuration(metadata.format.duration) : "Unknown Duration",
                cover: null,
                tracks: []
            };

            // Extracting album cover if available
            if (metadata.common && metadata.common.picture && metadata.common.picture.length > 0) {
                const picture = metadata.common.picture[0];
                const base64String = picture.data.toString('base64');
                const mimeType = picture.format;
                albumData.cover = `data:${mimeType};base64,${base64String}`;
            }

            const trackFrames = metadata.native['ID3v2.3'].filter(frame => frame.id === 'TIT2');
            console.log(metadata)
            trackFrames.forEach(frame => {
                const title = frame.value || "Unknown Title";
                albumData.tracks.push({ title: title });
            });

            return albumData;
        } catch (error) {
            console.error('Error extracting album data:', error);
            return {
                title: "Unknown Album",
                artist: "Unknown Artist",
                genre: "Unknown Genre",
                year: "Unknown Year",
                duration: "Unknown Duration",
                cover: null,
                tracks: []
            };
        }
    },
});

async function extractDuration(durationInSeconds) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
    },
    invoke: async (channel, data) => {
        return await ipcRenderer.invoke(channel, data);
    }
});