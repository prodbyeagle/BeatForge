const userData = JSON.parse(localStorage.getItem("userData"));

try {
  if (userData) {
    updateUI(userData);
  } else {
    throw new Error("User data not found in localStorage");
  }
} catch (error) {
  error(error.message);
}

function updateUI(userData) {
  // const accentColor = userData.accentColor || "#000000";
  // const sidebarIcons = document.querySelectorAll(".sidebar a i");
  const sidebarText = document.querySelectorAll(".sidebar a");

  sidebarText.forEach((item) => {
    item.addEventListener("mouseenter", handleSidebarHover);
    item.addEventListener("mouseleave", handleSidebarLeave);
  });
  profilePicImg.src = userData.profilePic;

  const libraryItems = document.querySelectorAll(".library-item");

  libraryItems.forEach((item) => {
    // Add event listener for right-click to show context menu
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault(); // Prevent default context menu
      showContextMenu(event); // Show custom context menu
    });
  });
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

const savedUserData = localStorage.getItem("userData");
if (savedUserData) {
  const userData = JSON.parse(savedUserData);
  updateUI(userData);
}

document.addEventListener("auxclick", function (event) {
  if (event.button === 1) {
    event.preventDefault();
  }
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

    // Anwendung des Themas auf das Kontextmenü
    const contextMenu = document.querySelector(".context-menu");
    if (contextMenu) {
      const secondaryColor = appliedTheme.values.find(
        (color) => color.name === "secondary"
      ).color;
      const tertiaryColor = appliedTheme.values.find(
        (color) => color.name === "tertiary"
      ).color;
      const quaternaryColor = appliedTheme.values.find(
        (color) => color.name === "quaternary"
      ).color;

      contextMenu.style.backgroundColor = secondaryColor;
      const menuItems = contextMenu.querySelectorAll(".context-menu-item");
      menuItems.forEach((item) => {
        item.style.color = tertiaryColor;
      });
      const hr = contextMenu.querySelector("hr");
      if (hr) hr.style.borderColor = quaternaryColor;
    }
  } else {
    Toastify({
      text: "The applied theme no longer exists.",
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "var(--primary-color)",
      },
      stopOnFocus: true,
    }).showToast();
  }
});

window.addEventListener("focus", () => {
  document.documentElement.style.transition = "filter 0.5s";
  document.documentElement.style.filter = "grayscale(0%) brightness(100%)";
});

window.addEventListener("blur", () => {
  document.documentElement.style.transition = "filter 0.5s";
  document.documentElement.style.filter = "grayscale(60%) brightness(60%)";
});

// Kontext Menu

// Kontextmenü anzeigen
let activeContextMenu = null;

function showContextMenu(event) {
    // Schließe jedes aktive Kontextmenü
    hideContextMenu();

    // Überprüfe, ob der Rechtsklick ausgelöst wurde
    if (event.button === 2) {
        const libraryItem = event.target.closest('.library-item');
        if (libraryItem) {
            const songName = libraryItem.querySelector('h2').textContent;

            const contextMenuHTML = `
                <div class="context-menu">
                    <ul>
                        <li title="The Song Name" class="context-menu-item-noninteractive">${songName}</li>
                        <hr>
                        <li title="Delete the Track" class="context-menu-item">Delete Track</li>
                        <li title="Edit The Metadata" class="context-menu-item">Edit Track</li>
                        <li title="Edit the Current Tags" class="context-menu-item">Edit Tags</li>
                        <hr>
                        <li title="Tags" class="context-menu-item-noninteractive">Tags Placeholder</li>
                    </ul>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", contextMenuHTML);

            activeContextMenu = document.querySelector(".context-menu");

            const menuHeight = activeContextMenu.offsetHeight;
            const menuWidth = activeContextMenu.offsetWidth;
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const mouseY = event.clientY + window.scrollY;
            const mouseX = event.clientX + window.scrollX;
            const remainingVerticalSpace = windowHeight - mouseY;
            const remainingHorizontalSpace = windowWidth - mouseX;

            // Positioniere das Kontextmenü basierend auf verbleibendem Platz
            activeContextMenu.style.top =
                mouseY + (remainingVerticalSpace < menuHeight ? -menuHeight : 0) + "px";
            activeContextMenu.style.left =
                mouseX + (remainingHorizontalSpace < menuWidth ? -menuWidth : 0) + "px";

            const contextMenuItems = document.querySelectorAll(".context-menu-item");
            const data = libraryItem.dataset;
            contextMenuItems.forEach((item) => {
                item.addEventListener("click", (event) => handleContextMenuItemClick(event, data));
            });

                document.addEventListener('click', function(event) {
        if (activeContextMenu && !activeContextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });
        }
    }
}

// Funktion zum Erstellen eines Library-Elements
function createLibraryItem(data) {
    const li = document.createElement("li");
    li.classList.add("library-item");

    const h2 = document.createElement("h2");
    h2.textContent = data.title;

    const p1 = document.createElement("p");
    p1.textContent = "Location: " + data.location;

    const p2 = document.createElement("p");
    p2.textContent = "Genre: " + data.genre;

    // Füge den Songtitel als benutzerdefiniertes Attribut hinzu
    li.dataset.songTitle = data.title;

    li.appendChild(h2);
    li.appendChild(p1);
    li.appendChild(p2);

    // Füge den Rechtsklick-Eventlistener hinzu
    li.addEventListener('contextmenu', function(event) {
        event.preventDefault(); // Verhindert das Standardkontextmenü
        showContextMenu(event); // Öffnet das benutzerdefinierte Kontextmenü
    });

    return li;
}

// Daten für die Library-Elemente
const libraryData = [
    { title: "Producer Name 3", location: "London", genre: "Rock" },
    { title: "Producer Name 4", location: "Berlin", genre: "Pop" }
];

// Library-Elemente dynamisch hinzufügen
const songsList = document.getElementById("songs-list");
libraryData.forEach(data => {
    const libraryItem = createLibraryItem(data);
    songsList.appendChild(libraryItem);
});

function hideContextMenu() {
    if (activeContextMenu) {
        activeContextMenu.remove();
        activeContextMenu = null;
    }
}

function handleContextMenuItemClick(event, data) {
    const action = event.target.textContent;
    console.log("Clicked on:", action);
    hideContextMenu();

    // Finde das übergeordnete .library-item-Element des angeklickten Kontextmenüs
    const libraryItem = event.target.closest('.library-item');
    if (libraryItem) {
        const songTitle = data.title;
        console.log("Song Title in handleContextMenuItemClick:", songTitle);

        // Prüfen, ob die benötigten Elemente vorhanden sind
        if (songTitle) {
            const artist = data.artist; // Entferne "Artist: "
            const genre = data.genre; // Entferne "Genre: "

            console.log("Song Title:", songTitle);
            console.log("Artist:", artist);
            console.log("Genre:", genre);

            if (action === "Delete Track") {
                openCustomConfirm(
                    `Are you sure you want to delete: ${songTitle} by ${artist}?`,
                    deleteTrack
                );
            }
        } else {
            error("Song title not found in dataset");
        }
    } else {
        error("Library item not found");
    }
}

function deleteTrack() {
  //? Hier kannst du die Logik zum Löschen des Tracks implementieren
  console.log("Track deleted!");
}

function openCustomConfirm(message, onConfirm) {
  const overlay = document.querySelector(".confirm-overlay");
  overlay.classList.add("show");

  const confirm = document.getElementById("confirm");
  const confirmationText = document.getElementById("confirmation_text");

  confirmationText.textContent = message;
  confirm.style.display = "block";

  const confirmButton = document.getElementById("confirm_button");
  const cancelButton = document.getElementById("cancel_button");

  confirmButton.onclick = function () {
    confirm.style.display = "none";
    overlay.classList.remove("show");
    onConfirm();
  };

  cancelButton.onclick = function () {
    confirm.style.display = "none";
    overlay.classList.remove("show");
  };
}

//! Hallo

function error(message) {
  Toastify({
    text: message,
    duration: 5000,
    gravity: "bottom",
    position: "right",
    style: {
      background: "#ff0000",
    },
    stopOnFocus: true,
  }).showToast();
}