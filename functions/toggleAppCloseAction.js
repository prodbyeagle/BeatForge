function toggleAppCloseAction() {
   let userData = JSON.parse(localStorage.getItem("userData"));
   let closeAction = userData.closeAction;

   if (!closeAction) {
      closeAction = "close";
      userData.closeAction = closeAction;
      localStorage.setItem("userData", JSON.stringify(userData));
   }

   const toggleAppButton = document.getElementById("toggleApp");

   if (toggleAppButton) {
      toggleAppButton.addEventListener("click", () => {
         closeAction = closeAction === "close" ? "minimize" : "close";
         const buttonText = closeAction === "close" ? "Close App" : "Minimize App";
         toggleAppButton.innerText = buttonText;
         userData.closeAction = closeAction;
         localStorage.setItem("userData", JSON.stringify(userData));

         let toastMessage = "";
         if (closeAction === "close") {
            toggleAppButton.style.border = "1px solid var(--primary-color)";
            toastMessage = "The App Closes now normally";
         } else {
            toggleAppButton.style.border = "none";
            toastMessage = "The App now stays open in the Background";
         }

         Toastify({
            text: toastMessage,
            duration: 1500,
            gravity: "bottom",
            position: "right",
            style: {
               background: "var(--secondary-color)",
            },
            stopOnFocus: true,
         }).showToast();
      });
   }
}

toggleAppCloseAction();