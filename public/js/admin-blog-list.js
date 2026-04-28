/**
 * admin-blog-list.js
 * Gestisce i filtri lato client e il modal di conferma eliminazione nella lista articoli.
 */
document.addEventListener("DOMContentLoaded", function () {
  // ── FILTRI ────────────────────────────────────────────────────────────────
  const filterTabs = document.querySelectorAll(".filter-tab");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const tableBody = document.getElementById("articlesTableBody");

  let currentStatusFilter = "all";
  let currentSearchTerm = "";
  let currentCategoryFilter = "";

  function applyFilters() {
    if (!tableBody) return;
    tableBody.querySelectorAll("tr").forEach((row) => {
      const status = row.dataset.status;
      const title = row.dataset.title;
      const category = row.dataset.category;

      const matchesStatus =
        currentStatusFilter === "all" || status === currentStatusFilter;
      const matchesSearch =
        !currentSearchTerm || (title && title.includes(currentSearchTerm));
      const matchesCategory =
        !currentCategoryFilter || category === currentCategoryFilter;

      row.style.display =
        matchesStatus && matchesSearch && matchesCategory ? "" : "none";
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentStatusFilter = tab.dataset.status;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      currentCategoryFilter = e.target.value;
      applyFilters();
    });
  }

  // ── DELETE MODAL ──────────────────────────────────────────────────────────
  let currentArticleId = null;

  function showDeleteModal(articleId, title, status, date, views) {
    currentArticleId = articleId;

    document.getElementById("modalArticleTitle").textContent = title;

    const statusEl = document.getElementById("modalArticleStatus");
    statusEl.textContent = status;
    statusEl.className = `status-badge status-${status}`;

    document.getElementById("modalArticleDate").textContent = date;
    document.getElementById("modalArticleViews").innerHTML =
      `<i class="fas fa-eye"></i> ${views}`;

    document.getElementById("deleteModal").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function hideDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
    document.body.style.overflow = "auto";
    currentArticleId = null;
  }

  function confirmDelete() {
    if (currentArticleId) {
      const form = document.getElementById("deleteForm");
      form.action = `/admin/blog/${currentArticleId}/delete`;
      form.submit();
    }
  }

  // Delete button handlers
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      showDeleteModal(
        this.dataset.articleId,
        this.dataset.articleTitle,
        this.dataset.articleStatus,
        this.dataset.articleDate,
        this.dataset.articleViews,
      );
    });
  });

  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const deleteModal = document.getElementById("deleteModal");

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", hideDeleteModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener("click", hideDeleteModal);
  if (modalConfirmBtn) modalConfirmBtn.addEventListener("click", confirmDelete);

  if (deleteModal) {
    deleteModal.addEventListener("click", function (e) {
      if (e.target === this) hideDeleteModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      deleteModal &&
      deleteModal.classList.contains("active")
    ) {
      hideDeleteModal();
    }
  });
});
