let currentModal = null;
let currentOverlay = null;

function createEditTagModal(tagName) {
  removeExistingModalAndOverlay();

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);
  currentOverlay = overlay;

  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = `Edit Tags`;
  modalContent.appendChild(modalTitle);

  const tagNameInput = document.createElement("input");
  tagNameInput.type = "text";
  tagNameInput.value = tagName;
  tagNameInput.placeholder = "Enter tag name";
  tagNameInput.classList.add("custom-input");
  modalContent.appendChild(tagNameInput);

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", () => {
    const newTagName = tagNameInput.value;
    console.log(`Tag '${tagName}' was edited to '${newTagName}'`);
    closeModal();
  });
  modalContent.appendChild(saveButton);

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    closeModal();
  });
  modalContent.appendChild(cancelButton);

  function closeModal() {
    modal.remove();
    overlay.remove();
    currentModal = null;
    currentOverlay = null;
  }

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.style.display = "block";
  overlay.style.display = "block";

  overlay.addEventListener("click", () => {
    closeModal();
  });

  currentModal = modal;
}

function removeExistingModalAndOverlay() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}

function createCreateTagModal() {
  removeExistingModalAndOverlay();

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);
  currentOverlay = overlay;

  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "Create New Tag";
  modalContent.appendChild(modalTitle);

  const tagNameInput = document.createElement("input");
  tagNameInput.type = "text";
  tagNameInput.placeholder = "Enter tag name";
  modalContent.appendChild(tagNameInput);

  const createButton = document.createElement("button");
  createButton.textContent = "Create";
  createButton.addEventListener("click", () => {
    const tagName = tagNameInput.value;
    console.log(`New tag created: '${tagName}'`);
    closeModal();
  });
  modalContent.appendChild(createButton);

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    closeModal();
  });
  modalContent.appendChild(cancelButton);

  function closeModal() {
    modal.remove();
    overlay.remove();
    currentModal = null;
    currentOverlay = null;
  }

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.style.display = "block";
  overlay.style.display = "block";

  overlay.addEventListener("click", () => {
    closeModal();
  });

  currentModal = modal;
}

function showToast(message) {
  if (currentToast) {
    currentToast.hideToast();
  }
  currentToast = Toastify({
    text: message,
    duration: 1500,
    gravity: "bottom",
    position: "right",
    style: {
      background: "#00A36C",
    },
    stopOnFocus: true,
  }).showToast();
}

function editTrack(songTitle) {
  showToast(`"${songTitle}" edited successfully!`);
}

function editTags(songTitle) {
  showToast(`"${songTitle}" Tags edited successfully!`);
}
