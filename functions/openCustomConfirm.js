function openCustomConfirm(message, onConfirm) {
   const confirm = document.getElementById('confirm');
   const confirmationText = document.getElementById('confirmation_text');

   confirmationText.textContent = message;
   confirm.style.display = 'block';
   confirm.style.zIndex = '9999'

   const confirmButton = document.getElementById('confirm_button');
   const cancelButton = document.getElementById('cancel_button');

   confirmButton.onclick = function () {
      confirm.style.display = 'none';
      onConfirm();
   }

   cancelButton.onclick = function () {
      confirm.style.display = 'none';
   }
}