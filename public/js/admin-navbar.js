/**
 * admin-navbar.js
 * Gestisce il dropdown del profilo utente nella dashboard navbar.
 */
(function () {
  const initDropdown = () => {
    const btn = document.getElementById("dropdownBtn");
    const menu = document.getElementById("userDropdown");

    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("active");
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDropdown);
  } else {
    initDropdown();
  }
})();
