function createModal(type, message, title) {

   const overlay = document.createElement('div');
   overlay.classList.add('overlay');
   document.body.appendChild(overlay);

   const modal = document.createElement('div');
   modal.classList.add('modal');

   const modalContent = document.createElement('div');
   modalContent.classList.add('modal-content');

   const modalTitle = document.createElement('h2');

   if (title) {
      modalTitle.textContent = title;
      modalContent.appendChild(modalTitle);
   }

   const modalMessage = document.createElement('p');
   modalMessage.textContent = message;

   const closeButton = document.createElement('span');
   closeButton.classList.add('close');
   closeButton.classList.add('close-modal');
   closeButton.textContent = '❌';
   closeButton.title = "Close the Modal";
   closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
   });

   modalContent.appendChild(closeButton);
   modalContent.appendChild(modalMessage);
   modal.appendChild(modalContent);
   document.body.appendChild(modal);

   switch (type) {
      case 'error':
         modal.classList.add('error-modal');
         modal.style.border = '1px solid red';
         if (title) {
            modalTitle.style.color = 'red';
         }
         break;
      case 'warning':
         modal.classList.add('warning-modal');
         modal.style.border = '1px solid orange';
         if (title) {
            modalTitle.style.color = 'orange';
         }
         break;
      default:
         modal.classList.add('normal-modal');
         break;
   }

   modal.style.display = 'block';
   overlay.style.display = 'block';

   overlay.addEventListener('click', () => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
   });
}