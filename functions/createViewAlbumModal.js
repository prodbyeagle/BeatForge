async function createViewAlbumModal(albumInfo) {
   try {
      const overlay = document.createElement('div');
      overlay.classList.add('overlay');
      document.body.appendChild(overlay);

      const modal = document.createElement('div');
      modal.classList.add('modal');

      const modalContent = document.createElement('div');
      modalContent.classList.add('modal-content');

      const albumData = await window.audioMetadata.extractAlbumData(albumInfo.filePath);

      const modalTitle = document.createElement('h2');
      modalTitle.textContent = albumData.title;
      modalContent.appendChild(modalTitle);

      const detailsList = document.createElement('ul');
      const details = {
         Artist: albumData.artist,
         Genre: albumData.genre,
         Year: albumData.year,
         Tracks: albumData.tracks.map(track => track.title).join(', ')
      };

      for (const [key, value] of Object.entries(details)) {
         const listItem = document.createElement('li');
         listItem.innerHTML = `<strong>${key}:</strong> ${value}`;
         detailsList.appendChild(listItem);
      }

      modalContent.appendChild(detailsList);

      const closeButton = document.createElement('span');
      closeButton.classList.add('close-modal');
      closeButton.textContent = '❌';
      closeButton.addEventListener('click', () => {
         modal.style.display = 'none';
         overlay.style.display = 'none';
      });

      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      modal.style.display = 'block';
      overlay.style.display = 'block';

      overlay.addEventListener('click', () => {
         modal.style.display = 'none';
         overlay.style.display = 'none';
      });
   } catch (error) {
      console.error('Error creating view album modal:', error);
   }
}