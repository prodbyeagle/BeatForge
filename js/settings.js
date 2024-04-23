
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settings-form");

  // Funktion zum Aktualisieren der Benutzeroberfläche
  function updateUI(userData) {
    const accentColor = userData.accentColor || "#000000";
    const sidebarIcons = document.querySelectorAll(".sidebar a i");
    const sidebarText = document.querySelectorAll(".sidebar a");

    sidebarText.forEach((item) => {
      item.addEventListener("mouseenter", handleSidebarHover);
      item.addEventListener("mouseleave", handleSidebarLeave);
    });

    // Profilbild aktualisieren
    profilePicImg.src = userData.profilePic;

    // Formularfelder aktualisieren
    form.username.value = userData.username;
    form["accent-color"].value = userData.accentColor;

    // Beat-Ordner aktualisieren
    showBeatFolders(userData);
  }

  // Funktion zum Anzeigen der Beat-Ordner
  function showBeatFolders(userData) {
    const beatFoldersContainer = document.querySelector(".beat-folders");
    beatFoldersContainer.innerHTML = ""; // Lösche den Inhalt des Containers, um ihn neu zu füllen

    if (userData.folders) {
      const folders = userData.folders.split(", ");

      folders.forEach((folder) => {
        console.log("Adding folder:", folder);
        const beatFolder = document.createElement("div");
        beatFolder.classList.add("beat-folder");

        const folderInfo = document.createElement("div");
        folderInfo.classList.add("folder-info");

        const folderPath = document.createElement("p");
        folderPath.textContent = folder;

        folderInfo.appendChild(folderPath);

        const folderActions = document.createElement("div");
        folderActions.classList.add("folder-actions");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.addEventListener("click", function () {
          // Funktion zum Entfernen des Ordners aufrufen und die Benutzeroberfläche aktualisieren
          removeFolderAndUpdateUI(folder);
        });

        folderActions.appendChild(deleteButton);

        beatFolder.appendChild(folderInfo);
        beatFolder.appendChild(folderActions);

        beatFoldersContainer.appendChild(beatFolder);
      });
    } else {
      // Wenn keine Ordner vorhanden sind, füge eine entsprechende Nachricht hinzu
      const noFoldersMessage = document.createElement("p");
      noFoldersMessage.textContent = "Keine Beat-Ordner vorhanden.";
      beatFoldersContainer.appendChild(noFoldersMessage);
    }
  }

  // Funktion zum Hinzufügen eines Ordners und Aktualisieren der Benutzeroberfläche
  function addFolderAndUpdateUI(folderPath) {
    console.log("Adding folder to userData:", folderPath);
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData.folders = userData.folders || "";

    // Überprüfen, ob der Ordner bereits hinzugefügt wurde
    if (!userData.folders.includes(folderPath)) {
      userData.folders +=
        (userData.folders.length > 0 ? ", " : "") + folderPath;
      localStorage.setItem("userData", JSON.stringify(userData));
      updateUI(userData); // Benutzeroberfläche aktualisieren
    }
  }

  // Funktion zum Entfernen eines Ordners und Aktualisieren der Benutzeroberfläche
  function removeFolderAndUpdateUI(folderPath) {
    console.log("Removing folder from userData:", folderPath);
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData.folders = userData.folders || "";

    // Ordner aus der Liste entfernen
    userData.folders = userData.folders
      .split(", ")
      .filter((folder) => folder !== folderPath)
      .join(", ");
    localStorage.setItem("userData", JSON.stringify(userData));
    updateUI(userData); // Benutzeroberfläche aktualisieren
  }

  // Ereignislistener für die Sidebar-Elemente
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
    element.style.color = "#d1d5db";
    icon.style.color = "#d1d5db";
  }

  function saveSettings(event) {
    event.preventDefault();
    const username = form.username.value;
    const profilePicInput = form["profile-pic"]; // Input-Element für das Profilbild
    const accentColor = form["accent-color"].value;
    const foldersInput = form["folders"]; // Input-Element für die ausgewählten Ordner
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (username !== "" && username !== userData.username) {
      userData.username = username;
    }
    if (profilePicInput.files.length > 0) {
      // Überprüfen, ob ein Bild ausgewählt wurde
      const profilePic = profilePicInput.files[0].path; // Dateipfad nur, wenn ein Bild ausgewählt wurde
      if (profilePic !== userData.profilePic) {
        userData.profilePic = profilePic;
      }
    }
    if (accentColor !== "" && accentColor !== userData.accentColor) {
      userData.accentColor = accentColor;
    }

    if (foldersInput.files.length > 0) {
      const folders = foldersInput.files;
      for (let i = 0; i < folders.length; i++) {
        console.log("Selected folder:", folders[i].path);
        addFolderAndUpdateUI(folders[i].path); // Hinzufügen des Ordners und Aktualisieren der Benutzeroberfläche
      }
    } else {
      console.error("Es wurden keine Ordner ausgewählt.");
    }

    localStorage.setItem("userData", JSON.stringify(userData));

    updateUI(userData);

    Toastify({
      text: "Einstellungen erfolgreich gespeichert!",
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
      stopOnFocus: true,
    }).showToast();
  }

  form.addEventListener("submit", saveSettings);

  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) {
      event.preventDefault(); // Verhindert das Standardverhalten der mittleren Maustaste
    }
  });

  // Lokalen Speicher nach Benutzerdaten überprüfen
  const savedUserData = localStorage.getItem("userData");
  if (savedUserData) {
    const userData = JSON.parse(savedUserData);
    updateUI(userData);
  }

  const designOverlay = document.getElementById("design_overlay");
  const designModal = document.getElementById("design_modal");
  const closeButton = document.querySelector(".close-btn");

  // Ereignislistener für das Hinzufügen von Ordnern über das Dateieingabefeld
  const foldersInput = document.getElementById("folders");
  foldersInput.addEventListener("change", function (event) {
    const folders = event.target.files;
    for (let i = 0; i < folders.length; i++) {
      console.log("Selected folder:", folders[i].path);
      addFolderAndUpdateUI(folders[i].path); // Hinzufügen des Ordners und Aktualisieren der Benutzeroberfläche
    }
  });

  // Eventlistener für das Klicken auf das Overlay hinzufügen
  designOverlay.addEventListener("click", function () {
    closeDesignModal(); // Schließt das Overlay und das Modal
  });

  // Funktion zum Öffnen des Modals
  function openDesignModal() {
    designOverlay.style.display = "block";
    designModal.style.display = "block";
  }

  // Funktion zum Schließen des Modals
  function closeDesignModal() {
    designOverlay.style.display = "none";
    designModal.style.display = "none";
  }

  // Funktion zum Überprüfen, ob das Modal geöffnet ist
  function isDesignModalOpen() {
    return designModal.style.display === "block";
  }

  const openOverlayBtn = document.getElementById("openOverlayBtn");

  // Eventlistener für den Button hinzufügen
  openOverlayBtn.addEventListener("click", function () {
    openDesignModal(); // Öffnet das Overlay und das Modal
  });

  //themes Browser

  // Event-Listener für das Laden der Themes registrieren
  ipcRenderer.on('load-themes', (themes) => {
    console.log("Themes geladen:", themes);
    addThemesToModal(themes); // Füge die Themes in das Modal hinzu
  });

  // Anforderung zum Laden der Themes senden
  ipcRenderer.send('load-themes');

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

    // Erstelle einen Gradienten mit den Farben des Themes
    const gradientString = theme.values.map(color => color.color).join(", ");
    themeColors.style.background = `linear-gradient(to right, ${gradientString})`;

    modalContent.appendChild(themeName);
    modalContent.appendChild(themeColors);
    modal.appendChild(modalContent);
    overlay.appendChild(modal);

    // Füge das Overlay in den DOM hinzu
    document.body.appendChild(overlay);

    return overlay;
  }

  /// Funktion zum Hinzufügen von Themes zum Modal
  function addThemesToModal(themes) {
    const modalContent = document.querySelector("#design_modal .modal-content");

    // Lösche vorhandene Inhalte im Modal
    modalContent.innerHTML = "";

    // Fügen Sie jeden Button für das Hinzufügen eines Themes hinzu
    themes.forEach(theme => {
      const themeElement = document.createElement("div");
      themeElement.classList.add("theme-item"); // Füge die Klasse "theme-item" hinzu

      const themeName = document.createElement("h3");
      themeName.textContent = theme.name;

      if (theme.warning) {
        const warningLabel = document.createElement("h4"); // Kleiner Schriftgröße
        warningLabel.textContent = "EXPERIMENTAL";
        warningLabel.style.color = "#f03232";
        warningLabel.style.fontWeight = "bold";
        warningLabel.title = "This Theme is very bright and can be hurting the eyes"
        themeElement.appendChild(themeName);
        themeElement.appendChild(warningLabel);
      } else {
        themeElement.appendChild(themeName);
      }

      // Erstelle den "Add +"-Button
      const addButton = document.createElement("button");
      addButton.classList.add("add-button");
      addButton.textContent = "+ Add";
      addButton.title = "Click to add this theme";

      addButton.addEventListener('click', () => {
        if (theme.warning) {
          // Wenn das Theme eine Warnung hat, zeige eine Bestätigung an
          openCustomConfirm(`Do you really want to apply ${theme.name} theme?`, () => {
            applyTheme(theme);
          });
        } else {
          applyTheme(theme);
        }
      });

      // Funktion zum Anwenden des Themes
      function applyTheme(theme) {
        // Setzen Sie die CSS-Variablen entsprechend den Farben des ausgewählten Themes
        theme.values.forEach(color => {
          document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
        });

        // Speichern Sie das angewendete Theme im lokalen Speicher
        localStorage.setItem('appliedTheme', JSON.stringify(theme));

        // Zeigen Sie eine Benachrichtigung an, dass das Theme angewendet wurde
        Toastify({
          text: `Theme ${theme.name} applied`,
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
          stopOnFocus: true,
        }).showToast();

        // Schließe das Overlay und das Modal
        const designModal = document.querySelector("#design_modal");
        const designOverlay = document.querySelector("#design_overlay");
        designOverlay.style.display = "none";
        designModal.style.display = "none";
      }

      themeElement.appendChild(themeName);
      themeElement.appendChild(addButton);
      modalContent.appendChild(themeElement);

      // Erstelle die Farbflächen als Gradienten mit Blur-Effekt entsprechend den Farben des Themes
      const colorsContainer = document.createElement("div");
      colorsContainer.classList.add("color-box");
      const gradientColors = theme.values.map(c => c.color).join(", "); // Alle Farben in einem String zusammenführen
      colorsContainer.style.background = `linear-gradient(to right, ${gradientColors})`;
      colorsContainer.style.cursor = "help";
      themeElement.title = theme.description;
      colorsContainer.title = "Just to visualize the Theme colors.";

      // Füge die Elemente zum Theme-Element hinzu
      themeElement.appendChild(themeName);
      themeElement.appendChild(addButton);
      themeElement.appendChild(colorsContainer);

      // Füge das Theme-Element dem Modal hinzu
      modalContent.appendChild(themeElement);

      // Fügen Sie das Theme-Element mit dem Button zum Modalinhalt hinzu

    });

    // Function to load the applied theme when the page loads
    window.addEventListener('load', () => {
      const appliedTheme = JSON.parse(localStorage.getItem('appliedTheme'));
      if (appliedTheme) {
        // Apply the saved theme
        appliedTheme.values.forEach(color => {
          document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
        });
      } else {
        // If no saved theme exists, show a notification
        Toastify({
          text: "The applied theme no longer exists.",
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "linear-gradient(to right, #FF5733, #FFB833)",
          },
          stopOnFocus: true,
        }).showToast();
      }
    });

    // Theme Creator

    // Button aus dem HTML-Dokument abrufen
    const openThemeCreatorBtn = document.getElementById("openThemeCreatorOverlayBtn");

    // Overlay und Modal-Elemente aus dem HTML-Dokument abrufen
    const themeDesignOverlay = document.getElementById("theme_design_overlay");
    const designModal = document.getElementById("theme_creator_modal");

    // Eventlistener für das Öffnen des Modals hinzufügen
    openThemeCreatorBtn.addEventListener("click", function () {
      openThemeDesignModal(); // Öffnet das Overlay und das Modal
      updatePageColors(); // Aktualisiert die Farben auf der Seite basierend auf den aktuellen Theme-Farbwerten
    });

    // Eventlistener für das Klicken auf das Overlay hinzufügen
    themeDesignOverlay.addEventListener("click", function () {
      closeThemeDesignModal(); // Schließt das Overlay und das Modal
    });

    // Funktion zum Öffnen des Modals
    function openThemeDesignModal() {
      themeDesignOverlay.style.display = "block";
      designModal.style.display = "block";
    }

    // Funktion zum Schließen des Modals
    function closeThemeDesignModal() {
      themeDesignOverlay.style.display = "none";
      designModal.style.display = "none";
    }

    // Funktion zum Aktualisieren der Farben auf der Seite basierend auf den Kommentaren im JSON
    function updatePageColors() {
      const primaryColor = document.getElementById("primary-color").value;
      const secondaryColor = document.getElementById("secondary-color").value;
      const tertiaryColor = document.getElementById("tertiary-color").value;
      const quaternaryColor = document.getElementById("quaternary-color").value;

      // Farbe der Karten (Primary)
      const cards = document.querySelectorAll(".card");
      cards.forEach(card => {
        card.style.backgroundColor = primaryColor;
      });

      // Farbe des Body (Secondary)
      document.body.style.backgroundColor = secondaryColor;

      // Farbe des Textes (Tertiary)
      const textElements = document.querySelectorAll(".text");
      textElements.forEach(textElement => {
        textElement.style.color = tertiaryColor;
      });

      // Farbe der horizontalen Linien (Quaternary)
      const hrElements = document.querySelectorAll("hr");
      hrElements.forEach(hrElement => {
        hrElement.style.backgroundColor = quaternaryColor;
      });
    }
  }

  function openCustomConfirm(message, onConfirm) {
    const confirm = document.getElementById('confirm');
    const confirmationText = document.getElementById('confirmation_text');

    confirmationText.textContent = message;
    confirm.style.display = 'block';

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
});
