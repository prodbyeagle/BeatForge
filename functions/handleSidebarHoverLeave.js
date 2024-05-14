document.addEventListener("DOMContentLoaded", function () {
   const sidebarText = document.querySelectorAll(".sidebar a");
   const homeUsernameElement = document.getElementById("home-username");

   function updateUI(userData) {
      const profilePicImg = document.getElementById("profilePicImg");
      const form = document.getElementById("settings-form");

      if (profilePicImg) {
         profilePicImg.src = userData.profilePic;
      }

      if (form) {
         form.username.value = userData.username;
         form["accent-color"].value = userData.accentColor;
      }

      if (homeUsernameElement) {
         homeUsernameElement.textContent = userData.username;
         const accentColor = userData ? userData.accentColor || "#000000" : "#000000";
         homeUsernameElement.style.color = accentColor;
      }

      const loaderIcon = document.querySelector(".loader-icon l-line-wobble");
      if (loaderIcon) {
         const accentColor = userData ? userData.accentColor || "#000000" : "#000000";
         loaderIcon.setAttribute("color", accentColor);
      }
   }

   function handleSidebar(event) {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const accentColor = userData ? userData.accentColor || "#000000" : "#000000";
      const element = event.currentTarget;
      const icon = element.querySelector("i");

      if (event.type === "mouseenter") {
         element.style.color = accentColor;
         if (icon) {
            icon.style.color = accentColor;
         }
      } else if (event.type === "mouseleave") {
         element.style.color = "var(--tertiary-color)";
         if (icon) {
            icon.style.color = "var(--tertiary-color)";
         }
      }
   }

   if (sidebarText) {
      sidebarText.forEach((item) => {
         item.addEventListener("mouseenter", handleSidebar);
         item.addEventListener("mouseleave", handleSidebar);
      });
   }

   const savedUserData = localStorage.getItem("userData");
   if (savedUserData) {
      const userData = JSON.parse(savedUserData);
      updateUI(userData);
   }
});