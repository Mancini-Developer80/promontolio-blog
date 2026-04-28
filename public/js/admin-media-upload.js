/**
 * admin-media-upload.js
 * Gestisce drag & drop, selezione file, anteprima e upload nella pagina Media Upload.
 */
let selectedFiles = [];
let tags = [];

// ── UTILITY ──────────────────────────────────────────────────────────────────
function getFileIcon(type) {
  if (type.includes("pdf")) return "file-pdf";
  if (type.includes("word") || type.includes("document")) return "file-word";
  if (type.includes("video")) return "file-video";
  if (type.includes("audio")) return "file-audio";
  if (type.includes("excel") || type.includes("spreadsheet"))
    return "file-excel";
  return "file";
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ── FILE HANDLING ─────────────────────────────────────────────────────────────
function handleFiles(files) {
  selectedFiles = Array.from(files);
  displayFiles();

  const fileList = document.getElementById("fileList");
  const metadataForm = document.getElementById("metadataForm");
  const uploadBtn = document.getElementById("uploadBtn");

  if (selectedFiles.length > 0) {
    if (fileList) fileList.style.display = "block";
    if (metadataForm) metadataForm.style.display = "block";
    if (uploadBtn) uploadBtn.disabled = false;
  }
}

function displayFiles() {
  const fileItems = document.getElementById("fileItems");
  if (!fileItems) return;
  fileItems.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <div class="file-preview">
        ${
          file.type.startsWith("image/")
            ? `<img src="${URL.createObjectURL(file)}" alt="${file.name}" />`
            : `<i class="fas fa-${getFileIcon(file.type)}"></i>`
        }
      </div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-details">${formatFileSize(file.size)} • ${file.type || "Unknown type"}</div>
      </div>
      <div class="file-status" id="status-${index}">Ready</div>
    `;
    fileItems.appendChild(fileItem);
  });
}

// ── TAG MANAGEMENT ────────────────────────────────────────────────────────────
function handleTagInput(e) {
  if (e.key === "Enter" && e.target.value.trim()) {
    e.preventDefault();
    const tag = e.target.value.trim();
    if (!tags.includes(tag)) {
      tags.push(tag);
      updateTagDisplay();
      document.getElementById("tagsHidden").value = tags.join(",");
    }
    e.target.value = "";
  }
}

function removeTag(index) {
  tags.splice(index, 1);
  updateTagDisplay();
  document.getElementById("tagsHidden").value = tags.join(",");
}

function updateTagDisplay() {
  const tagInput = document.getElementById("tagInput");
  if (!tagInput) return;

  tagInput.querySelectorAll(".tag").forEach((tag) => tag.remove());

  tags.forEach((tag, index) => {
    const tagEl = document.createElement("div");
    tagEl.className = "tag";
    tagEl.innerHTML = `
      ${tag}
      <button type="button" class="tag-remove" data-tag-index="${index}">
        <i class="fas fa-times"></i>
      </button>
    `;
    tagEl
      .querySelector(".tag-remove")
      .addEventListener("click", () => removeTag(index));
    tagInput.insertBefore(tagEl, tagInput.querySelector("input"));
  });
}

// ── UPLOAD ────────────────────────────────────────────────────────────────────
async function startUpload() {
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadProgress = document.getElementById("uploadProgress");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const uploadZone = document.getElementById("uploadZone");

  if (selectedFiles.length === 0) return;

  uploadBtn.disabled = true;
  uploadProgress.style.display = "block";
  uploadZone.classList.add("uploading");

  simulateProgress(progressFill, progressText);

  const formData = new FormData();
  const form = document.getElementById("uploadForm");
  const formDataObj = new FormData(form);

  selectedFiles.forEach((file) => formData.append("media", file));
  for (let [key, value] of formDataObj.entries()) {
    formData.append(key, value);
  }

  try {
    const response = await fetch("/admin/media/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      progressFill.style.width = "100%";
      progressText.textContent = "Upload completato!";
      setTimeout(() => (window.location.href = "/admin/media"), 1500);
    } else {
      throw new Error("Upload failed");
    }
  } catch {
    progressText.textContent = "Upload fallito!";
    uploadBtn.disabled = false;
    uploadZone.classList.remove("uploading");
  }
}

function simulateProgress(progressFill, progressText) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    progressFill.style.width = progress + "%";
    progressText.textContent = `Caricamento... ${Math.round(progress)}%`;
    if (progress >= 90) clearInterval(interval);
  }, 200);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const tagInputField = document.getElementById("tagInputField");

  if (uploadZone) {
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.classList.add("dragover");
    });
    uploadZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
    });
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      handleFiles(e.dataTransfer.files);
    });
  }

  if (fileInput)
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
  if (uploadBtn) uploadBtn.addEventListener("click", startUpload);
  if (tagInputField) tagInputField.addEventListener("keydown", handleTagInput);
});
