const userData = JSON.parse(localStorage.getItem("userData"));

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

//Kontext Menu

let activeContextMenu = null;

function showContextMenu(event) {
  // Close any active context menu
  hideContextMenu();

  const contextMenuHTML = `
        <div class="context-menu">
            <ul>
                <li class="context-menu-item">Delete Track</li>
                <li class="context-menu-item">Edit Track</li>
                <li class="context-menu-item">Edit Tags</li>
                <hr>
                <li class="context-menu-item-noninteractive">Tags Placeholder</li>
            </ul>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", contextMenuHTML);

  activeContextMenu = document.querySelector(".context-menu");

  const menuHeight = activeContextMenu.offsetHeight;
  const menuWidth = activeContextMenu.offsetWidth;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const mouseY = event.clientY + window.scrollY; // Adjust for vertical scroll
  const mouseX = event.clientX + window.scrollX; // Adjust for horizontal scroll

  // Calculate the remaining space below and to the right of the mouse pointer
  const remainingVerticalSpace = windowHeight - mouseY;
  const remainingHorizontalSpace = windowWidth - mouseX;

  // Position the context menu based on remaining space
  activeContextMenu.style.top =
    mouseY + (remainingVerticalSpace < menuHeight ? -menuHeight : 0) + "px";
  activeContextMenu.style.left =
    mouseX + (remainingHorizontalSpace < menuWidth ? -menuWidth : 0) + "px";

const contextMenuItems = document.querySelectorAll(".context-menu-item");
contextMenuItems.forEach((item) => {
  item.addEventListener("click", handleContextMenuItemClick);
});

document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("context-menu-item-noninteractive")) {
    hideContextMenu();
  }
});
}

function hideContextMenu() {
  if (activeContextMenu) {
    activeContextMenu.remove();
    activeContextMenu = null;
  }
}

function handleContextMenuItemClick(event) {
  const action = event.target.textContent;
  console.log("Clicked on:", action);
  hideContextMenu();
}
