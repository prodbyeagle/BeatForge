function createEditSongModal(songData) {
   const overlay = document.createElement('div');
   overlay.classList.add('overlay');
   document.body.appendChild(overlay);

   const modal = document.createElement('div');
   modal.classList.add('modal');
   document.body.appendChild(modal);

   const modalContent = document.createElement('div');
   modalContent.classList.add('modal-content');

   const modalTitle = document.createElement('h2');
   modalTitle.textContent = 'Edit Song';
   modalContent.appendChild(modalTitle);

   const form = document.createElement('form');

   Object.keys(songData).forEach(key => {
      const label = document.createElement('label');
      label.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;

      const input = document.createElement('input');
      input.type = 'text';
      input.name = key;
      input.value = songData[key];

      input.classList.add('custom-input');

      label.appendChild(input);
      form.appendChild(label);
   });

   const submitButton = document.createElement('button');
   submitButton.classList.add('px-4', 'py-2', 'text-white', 'bg-indigo-500', 'rounded', 'hover:bg-indigo-700', 'focus:outline-none', 'focus:shadow-outline');
   submitButton.classList.add('button');
   submitButton.type = 'submit';
   submitButton.textContent = 'Save';
   form.appendChild(submitButton);

   modalContent.appendChild(form);
   modal.appendChild(modalContent);

   modal.style.display = 'block';
   overlay.style.display = 'block';

   overlay.addEventListener('click', () => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
   });

   form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const updatedSongData = {};
      formData.forEach((value, key) => {
         updatedSongData[key] = value;
      });

      console.log('Updated song data:', updatedSongData);

      modal.style.display = 'none';
      overlay.style.display = 'none';
   });
}