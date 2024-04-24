
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settings-form");


  function updateUI(userData) {
    const accentColor = userData.accentColor || "#000000";
    const sidebarIcons = document.querySelectorAll(".sidebar a i");
    const sidebarText = document.querySelectorAll(".sidebar a");

    sidebarText.forEach((item) => {
      item.addEventListener("mouseenter", handleSidebarHover);
      item.addEventListener("mouseleave", handleSidebarLeave);
    });

    profilePicImg.src = userData.profilePic;

    form.username.value = userData.username;
    form["accent-color"].value = userData.accentColor;

    showBeatFolders(userData);
  }

  function showBeatFolders(userData) {
    const beatFoldersContainer = document.querySelector(".beat-folders");
    beatFoldersContainer.innerHTML = "";

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
          removeFolderAndUpdateUI(folder);
        });

        folderActions.appendChild(deleteButton);

        beatFolder.appendChild(folderInfo);
        beatFolder.appendChild(folderActions);

        beatFoldersContainer.appendChild(beatFolder);
      });
    } else {
      const noFoldersMessage = document.createElement("p");
      noFoldersMessage.textContent = "Keine Beat-Ordner vorhanden.";
      beatFoldersContainer.appendChild(noFoldersMessage);
    }
  }

  function addFolderAndUpdateUI(folderPath) {
    console.log("Adding folder to userData:", folderPath);
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData.folders = userData.folders || "";

    if (!userData.folders.includes(folderPath)) {
      userData.folders +=
        (userData.folders.length > 0 ? ", " : "") + folderPath;
      localStorage.setItem("userData", JSON.stringify(userData));
      updateUI(userData);
    }
  }

  function removeFolderAndUpdateUI(folderPath) {
    console.log("Removing folder from userData:", folderPath);
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData.folders = userData.folders || "";

    userData.folders = userData.folders
      .split(", ")
      .filter((folder) => folder !== folderPath)
      .join(", ");
    localStorage.setItem("userData", JSON.stringify(userData));
    updateUI(userData);
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
    element.style.color = "#d1d5db";
    icon.style.color = "#d1d5db";
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

    if (foldersInput.files.length > 0) {
      const folders = foldersInput.files;
      for (let i = 0; i < folders.length; i++) {
        console.log("Selected folder:", folders[i].path);
        addFolderAndUpdateUI(folders[i].path);
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


  const foldersInput = document.getElementById("folders");
  foldersInput.addEventListener("change", function (event) {
    const folders = event.target.files;
    for (let i = 0; i < folders.length; i++) {
      console.log("Selected folder:", folders[i].path);
      addFolderAndUpdateUI(folders[i].path);
    }
  });


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




  ipcRenderer.on('load-themes', (themes) => {
    console.log("Themes geladen:", themes);
    addThemesToModal(themes);
  });


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


    const gradientString = theme.values.map(color => color.color).join(", ");
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


    themes.forEach(theme => {
      const themeElement = document.createElement("div");
      themeElement.classList.add("theme-item");

      const themeName = document.createElement("h3");
      themeName.textContent = theme.name;

      if (theme.warning) {
        const warningLabel = document.createElement("h4");
        warningLabel.textContent = "Warning";
        warningLabel.style.color = "#f03232";
        warningLabel.classList.add("animate-bounce");
        warningLabel.style.fontWeight = "bold";
        warningLabel.title = "This Theme is not made for Using All the Time."
        themeElement.appendChild(themeName);
        themeElement.appendChild(warningLabel);
      } else {
        themeElement.appendChild(themeName);
      }


      const addButton = document.createElement("button");
      addButton.classList.add("add-button");
      addButton.textContent = "+ Add";
      addButton.title = "Click to add this theme";

      addButton.addEventListener('click', () => {
        if (theme.warning) {

          openCustomConfirm(`Apply ${theme.name} theme? (Temporary use recommended)`, () => {
            applyTheme(theme);
          });
        } else {
          applyTheme(theme);
        }
      });


      function applyTheme(theme) {

        theme.values.forEach(color => {
          document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
        });


        localStorage.setItem('appliedTheme', JSON.stringify(theme));

        const appliedTheme = JSON.parse(localStorage.getItem('appliedTheme'));
        if (appliedTheme) {

          appliedTheme.values.forEach(color => {
            document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
          });


          const themeButtons = document.querySelectorAll('.theme-item .add-button');
          themeButtons.forEach(button => {

            button.textContent = '+';
            button.style.borderColor = '';
            button.style.backgroundColor = '';
            button.disabled = false;


            if (button.parentNode.querySelector('h3').textContent === appliedTheme.name) {
              button.classList.add('applied-theme');
              button.textContent = '✓';
              button.style.borderColor = 'green';
              button.style.backgroundColor = 'rgba(149, 255, 167, 0.493)';
              button.disabled = true;
            } else {
              button.classList.remove('applied-theme');
            }
          });
        }


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
      const gradientColors = theme.values.map(c => c.color).join(", ");
      colorsContainer.style.background = `linear-gradient(to right, ${gradientColors})`;
      colorsContainer.style.cursor = "help";
      themeElement.title = theme.description;
      colorsContainer.title = "Just to visualize the Theme colors.";


      themeElement.appendChild(themeName);
      themeElement.appendChild(addButton);
      themeElement.appendChild(colorsContainer);


      modalContent.appendChild(themeElement);



    });


    window.addEventListener('load', () => {
      const appliedTheme = JSON.parse(localStorage.getItem('appliedTheme'));
      if (appliedTheme) {

        appliedTheme.values.forEach(color => {
          document.documentElement.style.setProperty(`--${color.name}-color`, color.color);
        });


        const themeButtons = document.querySelectorAll('.theme-item .add-button');
        themeButtons.forEach(button => {

          button.textContent = ' + ';
          button.style.borderColor = '';
          button.style.backgroundColor = '';
          button.disabled = false;


          if (button.parentNode.querySelector('h3').textContent === appliedTheme.name) {
            button.classList.add('applied-theme');
            button.textContent = '✓';
            button.style.borderColor = 'green';
            button.style.backgroundColor = 'rgba(149, 255, 167, 0.493)';
            button.disabled = true;
            button.style.cursor = "not-allowed"
            button.title = "You are using this Theme already"
          } else {
            button.classList.remove('applied-theme');
          }
        });
      } else {

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




    const openThemeCreatorBtn = document.getElementById("openThemeCreatorOverlayBtn");


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
      cards.forEach(card => {
        card.style.backgroundColor = primaryColor;
      });


      document.body.style.backgroundColor = secondaryColor;


      const textElements = document.querySelectorAll(".text");
      textElements.forEach(textElement => {
        textElement.style.color = tertiaryColor;
      });


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
