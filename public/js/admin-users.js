// Filter functionality
const filterTabs = document.querySelectorAll(".filter-tab");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const tableBody = document.getElementById("usersTableBody");

let currentStatusFilter = "all";
let currentSearchTerm = "";
let currentRoleFilter = "";

// Tab filtering
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Update active tab
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    currentStatusFilter = tab.dataset.status;
    applyFilters();
  });
});

// Search filtering
searchInput.addEventListener("input", (e) => {
  currentSearchTerm = e.target.value.toLowerCase();
  applyFilters();
});

// Role filtering
roleFilter.addEventListener("change", (e) => {
  currentRoleFilter = e.target.value;
  applyFilters();
});

function applyFilters() {
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const status = row.dataset.status;
    const role = row.dataset.role;
    const searchText = row.dataset.search;

    let showRow = true;

    // Status filter
    if (currentStatusFilter !== "all" && status !== currentStatusFilter) {
      showRow = false;
    }

    // Search filter
    if (currentSearchTerm && !searchText.includes(currentSearchTerm)) {
      showRow = false;
    }

    // Role filter
    if (currentRoleFilter && role !== currentRoleFilter) {
      showRow = false;
    }

    row.style.display = showRow ? "" : "none";
  });
}
