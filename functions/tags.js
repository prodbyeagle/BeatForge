// tags.js

function addTagToBeat(beatName, tag) {
   let beats = JSON.parse(localStorage.getItem('beats')) || {};
   if (!beats[beatName]) {
      beats[beatName] = [];
   }
   beats[beatName].push(tag);
   localStorage.setItem('beats', JSON.stringify(beats));
}

function addExistingTagsFromUserData() {
   let userData = JSON.parse(localStorage.getItem('userData')) || {};
   let existingTags = userData.tags.split(",");
   existingTags.forEach(tag => {
      addTagToBeat(tag);
   });
}

function createEditTagModal(tagName) {
   const overlay = document.createElement('div');
   overlay.classList.add('overlay');
   document.body.appendChild(overlay);

   const modal = document.createElement('div');
   modal.classList.add('modal');

   const modalContent = document.createElement('div');
   modalContent.classList.add('modal-content');

   const modalTitle = document.createElement('h2');
   modalTitle.textContent = `Edit Tags`;
   modalContent.appendChild(modalTitle);

   const tagNameInput = document.createElement('input');
   tagNameInput.type = 'text';
   tagNameInput.value = tagName;
   tagNameInput.placeholder = 'Enter tag name';
   tagNameInput.classList.add('custom-input');
   modalContent.appendChild(tagNameInput);

   const saveButton = document.createElement('button');
   saveButton.textContent = 'Save';
   saveButton.addEventListener('click', () => {

      const newTagName = tagNameInput.value;
      console.log(`Tag '${tagName}' was edited to '${newTagName}'`);
      closeModal();
   });
   modalContent.appendChild(saveButton);

   const cancelButton = document.createElement('button');
   cancelButton.textContent = 'Cancel';
   cancelButton.addEventListener('click', () => {
      closeModal();
   });
   modalContent.appendChild(cancelButton);

   function closeModal() {
      modal.style.display = 'none';
      overlay.style.display = 'none';
   }

   modal.appendChild(modalContent);
   document.body.appendChild(modal);

   modal.style.display = 'block';
   overlay.style.display = 'block';

   overlay.addEventListener('click', () => {
      closeModal();
   });
}

function createCreateTagModal() {
   const overlay = document.createElement('div');
   overlay.classList.add('overlay');
   document.body.appendChild(overlay);

   const modal = document.createElement('div');
   modal.classList.add('modal');

   const modalContent = document.createElement('div');
   modalContent.classList.add('modal-content');

   const modalTitle = document.createElement('h2');
   modalTitle.textContent = 'Create New Tag';
   modalContent.appendChild(modalTitle);

   const tagNameInput = document.createElement('input');
   tagNameInput.type = 'text';
   tagNameInput.placeholder = 'Enter tag name';
   modalContent.appendChild(tagNameInput);

   const createButton = document.createElement('button');
   createButton.textContent = 'Create';
   createButton.addEventListener('click', () => {
      const tagName = tagNameInput.value;
      console.log(`New tag created: '${tagName}'`);
      closeModal();
   });
   modalContent.appendChild(createButton);

   const cancelButton = document.createElement('button');
   cancelButton.textContent = 'Cancel';
   cancelButton.addEventListener('click', () => {
      closeModal();
   });
   modalContent.appendChild(cancelButton);

   function closeModal() {
      modal.style.display = 'none';
      overlay.style.display = 'none';
   }

   modal.appendChild(modalContent);
   document.body.appendChild(modal);

   modal.style.display = 'block';
   overlay.style.display = 'block';

   overlay.addEventListener('click', () => {
      closeModal();
   });
}
