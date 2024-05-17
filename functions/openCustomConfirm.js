function openCustomConfirm(message, onConfirm) {
   const overlay = document.querySelector(".confirm-overlay");
   overlay.classList.add("show");

   const confirm = document.getElementById("confirm");
   const confirmationText = document.getElementById("confirmation_text");

   confirmationText.textContent = message;
   confirm.style.display = "block";

   const confirmButton = document.getElementById("confirm_button");
   const cancelButton = document.getElementById("cancel_button");

   confirmButton.onclick = function () {
      confirm.style.display = "none";
      overlay.classList.remove("show");
      onConfirm();
   };

   cancelButton.onclick = function () {
      confirm.style.display = "none";
      overlay.classList.remove("show");
   };
}