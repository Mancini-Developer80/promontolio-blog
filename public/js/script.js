/**
 * Global Scroll Listener
 * Gestisce il cambio di aspetto della navbar durante lo scroll
 */
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    // Aggiunge la classe se si scende oltre i 450px (dopo la Hero)
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 450);
  }
});

/**
 * DOM Content Loaded
 * Inizializza tutte le funzionalità interattive
 */
document.addEventListener("DOMContentLoaded", function () {
  // 1. SELEZIONE ELEMENTI NAVBAR
  const navbar = document.querySelector(".navbar");
  const hamburger = document.getElementById("navbar-hamburger");
  const menu = document.getElementById("navbar-menu");
  const overlay = document.getElementById("navbar-overlay");

  /**
   * 2. FUNZIONE TOGGLE UNIFICATA
   * Gestisce l'apertura/chiusura del menu mobile e risolve i conflitti di z-index
   */
  function toggleMobileMenu() {
    if (!hamburger || !menu || !overlay) return;

    // Toggle delle classi BEM sugli elementi della navbar
    const isActive = hamburger.classList.toggle("navbar__hamburger--active");
    menu.classList.toggle("navbar__menu--active");
    overlay.classList.toggle("navbar__overlay--active");

    // --- LOGICA DI PROTEZIONE Z-INDEX ---
    // Attiva le regole nel file base.scss (body.menu-open)
    // per impedire che le sezioni animate coprano il menu
    document.body.classList.toggle("menu-open", isActive);

    // Blocca lo scroll del body e aggiorna l'accessibilità
    document.body.style.overflow = isActive ? "hidden" : "";
    hamburger.setAttribute("aria-expanded", isActive);
  }

  // Event Listeners per il menu mobile
  if (hamburger) hamburger.addEventListener("click", toggleMobileMenu);
  if (overlay) overlay.addEventListener("click", toggleMobileMenu);

  // Chiudi il menu quando si clicca un link (fondamentale per anchor links)
  if (menu) {
    menu.querySelectorAll(".navbar__link").forEach((link) => {
      link.addEventListener("click", () => {
        if (menu.classList.contains("navbar__menu--active")) {
          toggleMobileMenu();
        }
      });
    });
  }

  /**
   * 3. INTERSECTION OBSERVER
   * Gestisce le animazioni di entrata degli elementi (scroll-fade-up)
   */
  const navbarHeight = navbar ? navbar.offsetHeight : 0;
  const observerOptions = {
    threshold: 0.2, // L'elemento deve essere visibile al 20%
    rootMargin: `-${navbarHeight}px 0px 0px 0px`, // Considera l'ingombro della navbar
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Aggiunge la classe 'visible' definita nel file base.scss
        entry.target.classList.add("visible");
        // Una volta animato, smette di osservare per ottimizzare le prestazioni
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Applica l'osservatore a tutti gli elementi con la classe dedicata
  document
    .querySelectorAll(".scroll-fade-up")
    .forEach((el) => observer.observe(el));

  /**
   * 4. ADMIN DASHBOARD DROPDOWN
   * Gestisce il menu a tendina del profilo utente/admin
   */
  const userDropdown = document.getElementById("userDropdown");
  if (userDropdown) {
    userDropdown.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = this.parentElement;
      if (dropdown) {
        dropdown.classList.toggle("active");
      }
    });

    // Chiude il dropdown se si clicca in un punto qualsiasi fuori da esso
    document.addEventListener("click", (e) => {
      const dropdown = userDropdown.parentElement;
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }
});
