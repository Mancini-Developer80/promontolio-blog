/**
 * admin-media-library.js
 * Gestisce filtri, cambio vista e lightbox nella Media Library.
 */

// ── UTILITY ──────────────────────────────────────────────────────────────────
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ── FILTRI ────────────────────────────────────────────────────────────────────
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");

  const params = new URLSearchParams();
  if (searchInput && searchInput.value) params.set("search", searchInput.value);
  if (categoryFilter && categoryFilter.value)
    params.set("category", categoryFilter.value);
  if (sortFilter && sortFilter.value) params.set("sort", sortFilter.value);

  window.location.href = `/admin/media?${params.toString()}`;
}

// ── NAVIGAZIONE MEDIA ─────────────────────────────────────────────────────────
function openMediaDetails(mediaId) {
  const mediaItem = document.querySelector(`[data-id="${mediaId}"]`);
  if (mediaItem) {
    mediaItem.style.opacity = "0.7";
    mediaItem.style.pointerEvents = "none";

    const indicator = document.createElement("div");
    indicator.style.cssText =
      "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" +
      "background:rgba(52,152,219,0.95);color:#fff;padding:0.5rem 1rem;" +
      "border-radius:6px;font-size:0.8rem;z-index:20;";
    indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    mediaItem.appendChild(indicator);
  }
  window.location.href = `/admin/media/${mediaId}`;
}

// ── LIGHTBOX ──────────────────────────────────────────────────────────────────
function openImageLightbox(imageUrl, imageTitle) {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxTitle = document.getElementById("lightboxTitle");

  lightboxImage.src = imageUrl;
  lightboxImage.alt = imageTitle;
  lightboxTitle.textContent = imageTitle;

  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  if (lightbox) {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const mediaGrid = document.getElementById("mediaGrid");
  const viewToggles = document.querySelectorAll(".view-toggle");

  if (searchInput)
    searchInput.addEventListener("input", debounce(applyFilters, 500));
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);

  // Vista griglia / lista
  viewToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      viewToggles.forEach((t) => t.classList.remove("active"));
      toggle.classList.add("active");

      const isList = toggle.dataset.view === "list";
      mediaGrid.classList.toggle("list-view", isList);
      mediaGrid.querySelectorAll(".media-item").forEach((item) => {
        item.classList.toggle("list-view", isList);
        item
          .querySelector(".media-preview")
          .classList.toggle("list-view", isList);
        item.querySelector(".media-info").classList.toggle("list-view", isList);
      });
    });
  });

  // Click sugli elementi media
  document.querySelectorAll(".media-item").forEach((item) => {
    const mediaId = item.dataset.id;
    item.addEventListener("click", () => openMediaDetails(mediaId));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMediaDetails(mediaId);
      }
    });
  });

  // Lightbox immagini
  document.querySelectorAll(".media-image").forEach((image) => {
    image.addEventListener("click", function (e) {
      e.stopPropagation();
      openImageLightbox(this.dataset.lightboxUrl, this.dataset.lightboxTitle);
    });
  });

  const lightbox = document.getElementById("imageLightbox");
  const lightboxClose = document.getElementById("lightboxCloseBtn");

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox
      .querySelector(".lightbox-content")
      ?.addEventListener("click", (e) => e.stopPropagation());
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});
