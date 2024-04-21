document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settings-form");

  // Funktion zum Aktualisieren der Benutzeroberfläche
  function updateUI(userData) {
    console.log("Updating UI with userData:", userData);
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
    console.log("Showing beat folders for userData:", userData);
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
    const foldersInput = form["folders"].files[0].path; // Input-Element für die ausgewählten Ordner
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

    
    foldersInput.addEventListener("change", function (event) {
      const folderPath = event.target.files[0].path;
      console.log("FOLDER PATH:", folderPath);

      // Überprüfen, ob der Ordner mindestens eine MP3- oder WAV-Datei enthält
      const containsAudioFiles = Array.from(event.target.files).some((file) => {
        const extension = file.name.split(".").pop().toLowerCase();
        return extension === "mp3" || extension === "wav";
      });

      if (!containsAudioFiles) {
        console.log(
          "Der ausgewählte Ordner enthält keine MP3- oder WAV-Dateien. Ordner wird nicht gespeichert."
        );
      } else {
        // Speichere den Ordnerpfad
        console.log("Adding folder:", folderPath);
        addFolderAndUpdateUI(folderPath); // Hinzufügen des Ordners und Aktualisieren der Benutzeroberfläche
      }
    });

    localStorage.setItem("userData", JSON.stringify(userData));

    updateUI(userData);

    Toastify({
      text: "Settings saved successfully!",
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

  const versionElement = document.querySelector(".sidebar a.title");
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const closeModalButton = document.querySelector(".close-modal");

  // Version anklickbar machen und Update-Logs anzeigen
  versionElement.addEventListener("click", function () {
    // Hintergrund verschwommen und dunkler machen
    overlay.classList.add("show");
    modal.classList.add("show");
  });

  // Schließen des modalen Popups
  closeModalButton.addEventListener("click", function () {
    // Hintergrund wiederherstellen
    overlay.classList.remove("show");
    modal.classList.remove("show");
  });

  // Klicken auf das Overlay zum Schließen des Modals
  overlay.addEventListener("click", function () {
    overlay.classList.remove("show");
    modal.classList.remove("show");
  });

  // Ereignislistener für das Hinzufügen von Ordnern über das Dateieingabefeld
  const foldersInput = document.getElementById("folders");
  foldersInput.addEventListener("change", function (event) {
    const folders = event.target.files;
    for (let i = 0; i < folders.length; i++) {
      console.log("Selected folder:", folders[i].path);
      addFolderAndUpdateUI(folders[i].path); // Hinzufügen des Ordners und Aktualisieren der Benutzeroberfläche
    }
  });
});
