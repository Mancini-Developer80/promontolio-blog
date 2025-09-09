window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 450) {
    // Adjust 50 to your preferred scroll threshold
    navbar.classList.add("scroll");
  } else {
    navbar.classList.remove("scroll");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar");
  const navbarHeight = navbar ? navbar.offsetHeight : 0;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Stop observing after animation
        }
        // Remove the else block to prevent removing the class
      });
    },
    {
      threshold: 0.3,
      rootMargin: `-${navbarHeight}px 0px 0px 0px`,
    }
  );

  document
    .querySelectorAll(".scroll-fade-up")
    .forEach((el) => observer.observe(el));

  // Hamburger menu logic
  const hamburger = document.getElementById("navbar-hamburger");
  const overlay = document.getElementById("navbar-overlay");
  if (hamburger && overlay && navbar) {
    hamburger.addEventListener("click", function () {
      navbar.classList.toggle("open");
      overlay.style.display = navbar.classList.contains("open")
        ? "block"
        : "none";
    });
    overlay.addEventListener("click", function () {
      navbar.classList.remove("open");
      overlay.style.display = "none";
    });
  }

  const mobileHamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const navOverlay = document.getElementById("navOverlay");

  function toggleMenu() {
    navLinks.classList.toggle("active");
    navOverlay.classList.toggle("active");
    mobileHamburger.setAttribute(
      "aria-expanded",
      navLinks.classList.contains("active")
    );
  }

  mobileHamburger.addEventListener("click", toggleMenu);
  navOverlay.addEventListener("click", toggleMenu);

  // Optional: close menu when a nav link is clicked (for mobile)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        toggleMenu();
      }
    });
  });
});
