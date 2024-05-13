//settings.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settings-form");

  function updateUI(userData) {
    const sidebarText = document.querySelectorAll(".sidebar a");

    sidebarText.forEach((item) => {
      item.addEventListener("mouseenter", handleSidebarHover);
      item.addEventListener("mouseleave", handleSidebarLeave);
    });

    profilePicImg.src = userData.profilePic;

    form.username.value = userData.username;
    form["accent-color"].value = userData.accentColor;
  }

  function handleSidebarHover(event) {
    const accentColor = localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData")).accentColor || "#000000"
      : "#000000";
    const element = event.currentTarget;
    const icon = element.querySelector("i");
    element.style.color = accentColor;
    icon.style.color = accentColor;
  }

  function handleSidebarLeave(event) {
    const element = event.currentTarget;
    const icon = element.querySelector("i");
    element.style.color = "var(--tertiary-color)";
    if (icon) {
      icon.style.color = "var(--tertiary-color)";
    }
  }

  function saveSettings(event) {
    event.preventDefault();
    const username = form.username.value;
    const profilePicInput = form["profile-pic"];
    const accentColor = form["accent-color"].value;
    const foldersInput = form["folders"];
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

    updateUI(userData);

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

  const savedUserData = localStorage.getItem("userData");
  if (savedUserData) {
    const userData = JSON.parse(savedUserData);
    updateUI(userData);
  }

  const designOverlay = document.getElementById("design_overlay");
  const designModal = document.getElementById("design_modal");
  const closeButton = document.querySelector(".close-btn");

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

  function isDesignModalOpen() {
    return designModal.style.display === "block";
  }

  const openOverlayBtn = document.getElementById("openOverlayBtn");

  openOverlayBtn.addEventListener("click", function () {
    openDesignModal();
  });

  ipcRenderer.on("load-themes", (themes) => {
    addThemesToModal(themes);
  });

  ipcRenderer.send("load-themes");

  function createThemeOverlay(theme) {
    const overlay = document.createElement("div");
    overlay.classList.add("theme-overlay");

    const modal = document.createElement("div");
    modal.classList.add("modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const themeName = document.createElement("h2");
    themeName.textContent = theme.name;

    const themeColors = document.createElement("div");
    themeColors.classList.add("theme-colors");

    const gradientString = theme.values.map((color) => color.color).join(", ");
    themeColors.style.background = `linear-gradient(to right, ${gradientString})`;

    modalContent.appendChild(themeName);
    modalContent.appendChild(themeColors);
    modal.appendChild(modalContent);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    return overlay;
  }

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

      const addButton = document.createElement("button");
      addButton.classList.add("add-button");
      addButton.textContent = "+ Add";
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

  function openCustomConfirm(message, onConfirm) {
    const confirm = document.getElementById("confirm");
    const confirmationText = document.getElementById("confirmation_text");

    confirmationText.textContent = message;
    confirm.style.display = "block";

    const confirmButton = document.getElementById("confirm_button");
    const cancelButton = document.getElementById("cancel_button");

    confirmButton.onclick = function () {
      confirm.style.display = "none";
      onConfirm();
    };

    cancelButton.onclick = function () {
      confirm.style.display = "none";
    };
  }

  window.addEventListener("focus", () => {
    document.documentElement.style.transition = "filter 0.5s";
    document.documentElement.style.filter = "grayscale(0%) brightness(100%)";
  });

  window.addEventListener("blur", () => {
    document.documentElement.style.transition = "filter 0.5s";
    document.documentElement.style.filter = "grayscale(60%) brightness(60%)";
  });

  //* Add Folder Code
  //* Add Folder Code
  //* Add Folder Code

  // Überprüfen, ob es gespeicherte Ordner in den Benutzerdaten gibt
  const storedUserData = JSON.parse(localStorage.getItem("userData")) || {};
  let storedFolders = storedUserData.folders || [];

  // Hinzufügen der gespeicherten Ordner zur Benutzeroberfläche
  const beatFoldersContainer = document.querySelector(".beat-folders");
  storedFolders.forEach(folderPath => {
    beatFoldersContainer.appendChild(createFolderElement(folderPath));
  });

  // Hinzufügen eines Event Listeners für die Auswahl neuer Ordner
  const dirsInput = document.getElementById("dirs");
  dirsInput.addEventListener("change", (event) => {
    // Überprüfen, ob Dateien ausgewählt wurden
    if (event.target.files.length === 0) {
      // Anzeigen einer Benachrichtigung, dass keine Dateien ausgewählt wurden
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
      return; // Beenden der Funktion, da keine Dateien ausgewählt wurden
    }

    // Extrahiere den Ordnerpfad der ausgewählten Datei
    const filePath = event.target.files[0].path;
    const folderPath = filePath.substring(0, filePath.lastIndexOf("\\"));

    // Speichern des Ordnerpfads im localStorage
    localStorage.setItem("folders", folderPath);

    // Überprüfen, ob der Ordner Dateien enthält
    if (event.target.files.length === 1 && event.target.files[0].type === "") {
      // Anzeigen einer Benachrichtigung, dass im ausgewählten Ordner keine Dateien gefunden wurden
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
      return; // Beenden der Funktion, da keine Dateien im Ordner gefunden wurden
    }

    // Überprüfen, ob der Ordnerpfad bereits in der Liste vorhanden ist
    if (!storedFolders.includes(folderPath)) {
      // Hinzufügen des Ordnerpfads zur Liste im localStorage
      storedFolders.push(folderPath);
      localStorage.setItem("userData", JSON.stringify({ ...storedUserData, folders: storedFolders }));

      // Hinzufügen des Ordners zur Benutzeroberfläche
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

    // Erstellen des Textinhalts mit dem Ordnerpfad
    const folderText = document.createElement("span");
    folderText.textContent = folderPath;
    newFolderElement.appendChild(folderText);

    // Hinzufügen der Möglichkeit zum Entfernen des Ordners
    const removeButton = document.createElement("button");
    removeButton.textContent = "❌";
    removeButton.title = "Delete this Folder Path!";
    removeButton.style.opacity = "0%";
    removeButton.style.backgroundColor = "0%";
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", () => {
      // Entfernen des Ordners aus der Benutzeroberfläche
      beatFoldersContainer.removeChild(newFolderElement);
      // Entfernen des Ordners aus den Benutzerdaten im localStorage
      storedFolders = storedFolders.filter(path => path !== folderPath);
      localStorage.setItem("userData", JSON.stringify({ ...storedUserData, folders: storedFolders }));
    });

    // Anhängen des Entfernen-Buttons zum Ordner-Element
    newFolderElement.appendChild(removeButton);

    newFolderElement.style.display = "flex";
    newFolderElement.style.justifyContent = "space-between";

    // Hinzufügen eines Event Listeners für das Hovern über das Feld
    newFolderElement.addEventListener("mouseover", () => {
      removeButton.style.opacity = "100%";
    });

    // Hinzufügen eines Event Listeners für das Verlassen des Felds
    newFolderElement.addEventListener("mouseout", () => {
      removeButton.style.opacity = "0%";
    });

    return newFolderElement;
  }

  //* Close or In Background

  let closeAction = localStorage.getItem("closeAction");

  if (!closeAction) {
    closeAction = "close";
    localStorage.setItem("closeAction", closeAction);
  }

  document.getElementById("toggleApp").addEventListener("click", () => {
    closeAction = (closeAction === "close") ? "minimize" : "close";
    const buttonText = (closeAction === "close") ? "Close App" : "Minimize App";
    document.getElementById("toggleApp").innerText = buttonText;
    localStorage.setItem("closeAction", closeAction);
  });

  document.getElementById("close").addEventListener("click", () => {
    if (closeAction === "close") {
      ipcRenderer.send("manualClose");
    } else if (closeAction === "minimize") {
      ipcRenderer.send("manualMinimize");
    }
  });
});
