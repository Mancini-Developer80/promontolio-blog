/**
 * admin-media-details.js
 * Gestisce tag, aggiornamento e cancellazione nella pagina dettagli media.
 * Dati: letti da <script id="media-data" type="application/json"> nel template.
 */
const mediaData = JSON.parse(
  document.getElementById("media-data")?.textContent || "{}",
);
let tags = mediaData.tags || [];
const mediaId = mediaData.id;

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

function removeTag(tagText) {
  const index = tags.indexOf(tagText);
  if (index > -1) {
    tags.splice(index, 1);
    updateTagDisplay();
    document.getElementById("tagsHidden").value = tags.join(",");
  }
}

function updateTagDisplay() {
  const tagInput = document.getElementById("tagInput");
  if (!tagInput) return;
  const inputEl = tagInput.querySelector("#tagInputFieldDetails");

  tagInput.querySelectorAll(".tag").forEach((tag) => tag.remove());

  tags.forEach((tag) => {
    const tagEl = document.createElement("div");
    tagEl.className = "tag";
    tagEl.innerHTML = `
      ${tag}
      <button type="button" class="tag-remove" data-tag-text="${tag}">
        <i class="fas fa-times"></i>
      </button>
    `;
    tagEl.querySelector(".tag-remove").addEventListener("click", function () {
      removeTag(this.dataset.tagText);
    });
    tagInput.insertBefore(tagEl, inputEl);
  });
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
async function updateMedia(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  try {
    const response = await fetch(`/admin/media/api/${mediaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Media aggiornato con successo!");
      location.reload();
    } else {
      throw new Error("Update failed");
    }
  } catch {
    alert("Aggiornamento fallito. Riprova.");
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("URL copiato negli appunti!");
    })
    .catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("URL copiato negli appunti!");
    });
}

function deleteMedia(id) {
  if (
    !confirm(
      "Sei sicuro di voler eliminare questo file? L'azione è irreversibile.",
    )
  )
    return;

  fetch(`/admin/media/api/${id}`, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        alert("Media eliminato con successo!");
        window.location.href = "/admin/media";
      } else {
        throw new Error("Delete failed");
      }
    })
    .catch(() => alert("Eliminazione fallita. Riprova."));
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const copyBtn = document.getElementById("copyUrlBtn");
  if (copyBtn)
    copyBtn.addEventListener("click", () =>
      copyToClipboard(copyBtn.dataset.url),
    );

  const deleteBtn = document.getElementById("deleteMediaBtn");
  if (deleteBtn)
    deleteBtn.addEventListener("click", () =>
      deleteMedia(deleteBtn.dataset.mediaId),
    );

  const resetBtn = document.getElementById("resetFormBtn");
  if (resetBtn) resetBtn.addEventListener("click", () => location.reload());

  const editForm = document.getElementById("editForm");
  if (editForm) editForm.addEventListener("submit", updateMedia);

  const tagInputField = document.getElementById("tagInputFieldDetails");
  if (tagInputField) tagInputField.addEventListener("keydown", handleTagInput);

  document.querySelectorAll(".tag-remove").forEach((btn) => {
    btn.addEventListener("click", function () {
      removeTag(this.dataset.tagText);
    });
  });
});
