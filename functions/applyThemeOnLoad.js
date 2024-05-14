function applyThemeOnLoad() {
   window.addEventListener("load", () => {
      const appliedTheme = JSON.parse(localStorage.getItem("appliedTheme"));
      if (appliedTheme) {
         appliedTheme.values.forEach((color) => {
            document.documentElement.style.setProperty(
               `--${color.name}-color`,
               color.color
            );
         });

         const themeButtons = document.querySelectorAll(
            ".theme-item .add-button"
         );
         themeButtons.forEach((button) => {
            button.textContent = " + ";
            button.style.borderColor = "";
            button.style.backgroundColor = "";
            button.disabled = false;

            if (
               button.parentNode.querySelector("h3").textContent ===
               appliedTheme.name
            ) {
               button.classList.add("applied-theme");
               button.textContent = "✓";
               button.style.borderColor = "green";
               button.style.backgroundColor = "rgba(149, 255, 167, 0.493)";
               button.disabled = true;
               button.style.cursor = "not-allowed";
               button.title = "You are using this Theme already";
            } else {
               button.classList.remove("applied-theme");
            }
         });
      } else {
         Toastify({
            text: "The applied theme no longer exists.",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
               background: "var(--secondary-color)",
            },
            stopOnFocus: true,
         }).showToast();
      }
   });
}

applyThemeOnLoad();