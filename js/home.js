document.addEventListener("DOMContentLoaded", async function () {
  const greetingElement = document.getElementById("greeting");
  const sortButton = document.getElementById("sort-random-beat");
  const versionElement = document.querySelector(".sidebar a.title");
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const closeModalButton = document.querySelector(".close-modal");
  const latestBeatsElement = document.getElementById("latest-beats");

  // Update Greeting
  updateGreeting();

  function updateGreeting() {
    const time = new Date().getHours();
    if (time < 6) {
      greetingElement.textContent = "🌛 Good Night";
    } else if (time < 12) {
      greetingElement.textContent = "🌄 Good Morning";
    } else if (time < 18) {
      greetingElement.textContent = "🌞 Good Afternoon";
    } else {
      greetingElement.textContent = "🌆 Good Evening";
    }
  }

  // Display latest date
  const latestDateElement = document.getElementById("latest-date");
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;
  latestDateElement.textContent = formattedDate;

  // Fetch and display latest beats
  try {
    // Abrufen der Ordnerpfade aus dem localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.folders) {
      const foldersArray = userData.folders;

      // Abrufen der neuesten Beats
      const latestBeats = await window.audioMetadata.getLatestBeats(
        foldersArray
      );

      // Füge die neuesten Beats zur Startseite hinzu
      latestBeatsElement.innerHTML = ""; // Leeren des Containers

      latestBeats.forEach((beat) => {
        const beatElement = document.createElement("div");
        beatElement.classList.add("beat");

        beatElement.innerHTML = `
          <img src="${beat.albumCover || ""}" alt="Cover" class="beat-cover">
          <div class="beat-info">
              <h3>${beat.title}</h3>
              <p>${beat.artist}</p>
          </div>
        `;

        latestBeatsElement.appendChild(beatElement);
      });
    } else {
      console.error("User data or folders not found in localStorage.");
    }
  } catch (error) {
    console.error("Fehler beim Laden der neuesten Beats:", error);
  }

  // Event listener for sorting beats
  var isCooldown = false;
  sortButton.addEventListener("click", function () {
    if (isCooldown) {
      return;
    }

    Toastify({
      text: "Searching for files...",
      duration: 1500,
      gravity: "bottom",
      position: "right",
      style: {
        background: "var(--primary-color)",
      },
      stopOnFocus: true,
    }).showToast();

    isCooldown = true;

    setTimeout(function () {
      var filesFound = false;

      if (!filesFound) {
        Toastify({
          text: "No files found. Try again!",
          duration: 2000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "#ff6347",
          },
          stopOnFocus: true,
        }).showToast();
      }
      isCooldown = false;
    }, 5000);
  });

  // Prevent middle click
  document.addEventListener("auxclick", function (event) {
    if (event.button === 1) {
      event.preventDefault();
    }
  });

  // Version Modal
  versionElement.addEventListener("click", function () {
    overlay.classList.add("show");
    modal.classList.add("show");
  });

  closeModalButton.addEventListener("click", function () {
    overlay.classList.remove("show");
    modal.classList.remove("show");
  });

  overlay.addEventListener("click", function () {
    overlay.classList.remove("show");
    modal.classList.remove("show");
  });

  // Remove libraryData from localStorage
  if (localStorage.getItem("libraryData") !== null) {
    localStorage.removeItem("libraryData");
    console.log('Das Element "libraryData" wurde erfolgreich gelöscht.');
  } else {
    return;
  }

  // Load Changelog
  function loadChangelog() {
    fetch("../changelog.json")
      .then((response) => response.json())
      .then((data) => {
        const changelog = data.changelog;
        const updateLogsElement = document.getElementById("update-logs");
        updateLogsElement.innerHTML = ""; // Leeren der aktuellen Inhalte

        changelog.forEach((log) => {
          const dateElement = document.createElement("li");
          dateElement.style.fontSize = "22px";
          dateElement.textContent = `・ ${log.date}`;
          updateLogsElement.appendChild(dateElement);

          const hrElement = document.createElement("hr");
          updateLogsElement.appendChild(hrElement);

          log.entries.forEach((entry) => {
            const entryElement = document.createElement("li");
            entryElement.textContent = `・ ${entry}`;
            updateLogsElement.appendChild(entryElement);
          });

          const hrElementEnd = document.createElement("hr");
          updateLogsElement.appendChild(hrElementEnd);
        });
      })
      .catch((error) =>
        console.error("Fehler beim Laden des Changelogs:", error)
      );
  }

  loadChangelog();

  // Handle close or minimize action
  let closeAction = localStorage.getItem("closeAction");

  if (!closeAction) {
    closeAction = "close";
    localStorage.setItem("closeAction", closeAction);
  }

  document.getElementById("close").addEventListener("click", () => {
    if (closeAction === "close") {
      ipcRenderer.send("manualClose");
    } else if (closeAction === "minimize") {
      ipcRenderer.send("manualMinimize");
    }
  });
});

//! Close or In Background

let userData = JSON.parse(localStorage.getItem("userData"));
let closeAction = userData ? userData.closeAction : null;

if (!closeAction) {
  closeAction = "close";
  if (userData) {
    userData.closeAction = closeAction;
    localStorage.setItem("userData", JSON.stringify(userData));
  }
}

document.getElementById("close").addEventListener("click", () => {
  if (closeAction === "close") {
    ipcRenderer.send("manualClose");
  } else if (closeAction === "minimize") {
    ipcRenderer.send("manualMinimize");
  }
});
