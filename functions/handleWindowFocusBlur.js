function handleWindowFocusBlur() {
   window.addEventListener("focus", () => {
      document.documentElement.style.transition = "filter 0.5s";
      document.documentElement.style.filter = "grayscale(0%) brightness(100%)";
   });

   window.addEventListener("blur", () => {
      document.documentElement.style.transition = "filter 0.5s";
      document.documentElement.style.filter = "grayscale(60%) brightness(60%)";
   });
}

handleWindowFocusBlur();