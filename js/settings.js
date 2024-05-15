

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settings-form");

  function saveSettings(event) {
    event.preventDefault();
    const username = form.username.value;
    const profilePicInput = form["profile-pic"];
    const accentColor = form["accent-color"].value;
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (username !== "" && username !== userData.username) {
      userData.username = username;
    }
    if (profilePicInput.files.length > 0) {
      const profilePic = profilePicInput.files[0].path;
      if (profilePic !== userData.profilePic) {
        userData.profilePic = profilePic;
      }
    }
    if (accentColor !== "" && accentColor !== userData.accentColor) {
      userData.accentColor = accentColor;
    }

    localStorage.setItem("userData", JSON.stringify(userData));

    Toastify({
      text: "✅ Settings Successfully Saved!",
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "var(--secondary-color)",
      },
      stopOnFocus: true,
    }).showToast();
  }

  form.addEventListener("submit", saveSettings);

  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) {
      event.preventDefault();
    }
  });

  ipcRenderer.on("load-themes", (themes) => {
    addThemesToModal(themes);
  });

  ipcRenderer.send("load-themes");

  const designOverlay = document.getElementById("design_overlay");
  const designModal = document.getElementById("design_modal");

  designOverlay.addEventListener("click", function () {
    closeDesignModal();
  });

  function openDesignModal() {
    designOverlay.style.display = "block";
    designModal.style.display = "block";
  }

  function closeDesignModal() {
    designOverlay.style.display = "none";
    designModal.style.display = "none";
  }

  const openOverlayBtn = document.getElementById("openOverlayBtn");

  openOverlayBtn.addEventListener("click", function () {
    openDesignModal();
  });

  function addThemesToModal(themes) {
    const modalContent = document.querySelector("#design_modal .modal-content");

    modalContent.innerHTML = "";

    themes.forEach((theme) => {
      const themeElement = document.createElement("div");
      themeElement.classList.add("theme-item");

      const themeName = document.createElement("h3");
      themeName.textContent = theme.name;

      if (theme.warning) {
        const warningLabel = document.createElement("h4");
        warningLabel.textContent = "Warning";
        warningLabel.style.color = "#f03232";
        warningLabel.classList.add("vibrate-1");
        warningLabel.style.fontWeight = "bold";
        warningLabel.title = "This Theme is not made for Using All the Time.";
        themeElement.appendChild(themeName);
        themeElement.appendChild(warningLabel);
      } else {
        themeElement.appendChild(themeName);
      }

      if (theme.owner) {
        const OwnerLabel = document.createElement("h4");
        OwnerLabel.textContent = "Eagle's Theme";
        OwnerLabel.style.color = "#a985d3";

        OwnerLabel.style.fontWeight = "bold";
        OwnerLabel.title = "This is one of the Themes what Eagle is Using!";
        themeElement.appendChild(themeName);
        themeElement.appendChild(OwnerLabel);
      } else {
        themeElement.appendChild(themeName);
      }

      const addButton = document.createElement("button");
      addButton.classList.add("add-button");
      addButton.textContent = "+";
      addButton.title = "Click to add this theme";

      addButton.addEventListener("click", () => {
        if (theme.warning) {
          openCustomConfirm(
            `Apply ${theme.name} theme? (Temporary use recommended)`,
            () => {
              applyTheme(theme);
            }
          );
        } else {
          applyTheme(theme);
        }
      });

      function applyTheme(theme) {
        theme.values.forEach((color) => {
          document.documentElement.style.setProperty(
            `--${color.name}-color`,
            color.color
          );
        });

        localStorage.setItem("appliedTheme", JSON.stringify(theme));

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
            button.textContent = "+";
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
            } else {
              button.classList.remove("applied-theme");
            }
          });
        }

        Toastify({
          text: `Theme ${theme.name} applied`,
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "var(--primary-color)",
          },
          stopOnFocus: true,
        }).showToast();

        const designModal = document.querySelector("#design_modal");
        const designOverlay = document.querySelector("#design_overlay");
        designOverlay.style.display = "none";
        designModal.style.display = "none";
      }

      themeElement.appendChild(themeName);
      themeElement.appendChild(addButton);
      modalContent.appendChild(themeElement);

      const colorsContainer = document.createElement("div");
      colorsContainer.classList.add("color-box");
      const gradientColors = theme.values.map((c) => c.color).join(", ");
      colorsContainer.style.background = `linear-gradient(to right, ${gradientColors})`;
      colorsContainer.style.cursor = "help";
      themeElement.title = theme.description;
      colorsContainer.title = "Just to visualize the Theme colors.";

      themeElement.appendChild(themeName);
      themeElement.appendChild(addButton);
      themeElement.appendChild(colorsContainer);

      modalContent.appendChild(themeElement);
    });

    const openThemeCreatorBtn = document.getElementById(
      "openThemeCreatorOverlayBtn"
    );
    const themeDesignOverlay = document.getElementById("theme_design_overlay");
    const designModal = document.getElementById("theme_creator_modal");

    openThemeCreatorBtn.addEventListener("click", function () {
      openThemeDesignModal();
      updatePageColors();
    });

    themeDesignOverlay.addEventListener("click", function () {
      closeThemeDesignModal();
    });

    function openThemeDesignModal() {
      themeDesignOverlay.style.display = "block";
      designModal.style.display = "block";
    }

    function closeThemeDesignModal() {
      themeDesignOverlay.style.display = "none";
      designModal.style.display = "none";
    }

    function updatePageColors() {
      const primaryColor = document.getElementById("primary-color").value;
      const secondaryColor = document.getElementById("secondary-color").value;
      const tertiaryColor = document.getElementById("tertiary-color").value;
      const quaternaryColor = document.getElementById("quaternary-color").value;

      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => {
        card.style.backgroundColor = primaryColor;
      });

      document.body.style.backgroundColor = secondaryColor;

      const textElements = document.querySelectorAll(".text");
      textElements.forEach((textElement) => {
        textElement.style.color = tertiaryColor;
      });

      const hrElements = document.querySelectorAll("hr");
      hrElements.forEach((hrElement) => {
        hrElement.style.backgroundColor = quaternaryColor;
      });
    }
  }

  const storedUserData = JSON.parse(localStorage.getItem("userData")) || {};
  let storedFolders = storedUserData.folders || [];
  const beatFoldersContainer = document.querySelector(".beat-folders");

  if (Array.isArray(storedFolders)) {
    if (storedFolders.length > 0) {
      storedFolders.forEach(folderPath => {
        beatFoldersContainer.appendChild(createFolderElement(folderPath));
      });
    } else {
      const noFoldersMessage = document.createElement("p");
      noFoldersMessage.textContent = "No folders available.";
      beatFoldersContainer.appendChild(noFoldersMessage);
    }
  } else {
    console.error("Stored folders data is not an array.");
  }

  const dirsInput = document.getElementById("dirs");
  dirsInput.addEventListener("change", (event) => {
    if (event.target.files.length === 0) {
      Toastify({
        text: "This Folder has no Files. Add one File to add this Folder",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "#FF3B30",
        },
        stopOnFocus: true,
      }).showToast();
      return;
    }

    const filePath = event.target.files[0].path;
    const folderPath = filePath.substring(0, filePath.lastIndexOf("\\"));

    if (event.target.files.length === 1 && event.target.files[0].type === "") {
      Toastify({
        text: "No Files Found!",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "#FF3B30",
        },
        stopOnFocus: true,
      }).showToast();
      return;
    }

    if (!storedFolders.includes(folderPath)) {
      storedFolders.push(folderPath);
      localStorage.setItem("userData", JSON.stringify({ ...storedUserData, folders: storedFolders }));
      beatFoldersContainer.appendChild(createFolderElement(folderPath));
    } else {
      Toastify({
        text: "This Folder already exists!",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "#FF3B30",
        },
        stopOnFocus: true,
      }).showToast();
    }
  });

  function createFolderElement(folderPath) {
    const newFolderElement = document.createElement("div");
    newFolderElement.classList.add("beat-folder");

    const folderText = document.createElement("span");
    folderText.textContent = folderPath;
    newFolderElement.appendChild(folderText);

    const removeButton = document.createElement("button");
    removeButton.textContent = "❌";
    removeButton.title = "Delete this Folder Path!";
    removeButton.style.opacity = "0%";
    removeButton.style.backgroundColor = "0%";
    removeButton.classList.add("remove-button");

    removeButton.addEventListener("click", () => {
      beatFoldersContainer.removeChild(newFolderElement);
      storedFolders = storedFolders.filter(path => path !== folderPath);
      localStorage.setItem("userData", JSON.stringify({ ...storedUserData, folders: storedFolders }));
    });

    newFolderElement.appendChild(removeButton);

    newFolderElement.style.display = "flex";
    newFolderElement.style.justifyContent = "space-between";

    newFolderElement.addEventListener("mouseover", () => {
      removeButton.style.opacity = "100%";
    });

    newFolderElement.addEventListener("mouseout", () => {
      removeButton.style.opacity = "0%";
    });

    return newFolderElement;
  }

  //* Close or In Background
  //* Close or In Background
  //* Close or In Background

  let closeAction = localStorage.getItem(userData.closeAction);

  if (!closeAction) {
    closeAction = "close";
    localStorage.setItem(userData.closeAction, closeAction);
  }

  document.getElementById("close").addEventListener("click", () => {
    if (closeAction === "close") {
      ipcRenderer.send("manualClose");
    } else if (closeAction === "minimize") {
      ipcRenderer.send("manualMinimize");
    }
  });
});
