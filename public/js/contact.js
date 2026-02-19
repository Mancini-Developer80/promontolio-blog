document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".contact-form");
  const feedback = document.getElementById("form-feedback");

  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset classi (Sass gestisce il display: none di base)
    feedback.className = "form-feedback";
    feedback.innerText = "";

    const btn = contactForm.querySelector("button");
    const originalBtnText = btn.innerText;
    btn.innerText = "Senden...";
    btn.disabled = true;

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        feedback.innerText =
          "Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.";
        feedback.className = "form-feedback success"; // Sovrascrive e aggiunge success
        feedback.style.display = "block"; // FORZA il display
        contactForm.reset();
      } else {
        feedback.innerText =
          "Fehler: " + (result.message || "Ein Fehler ist aufgetreten.");
        feedback.className = "form-feedback error"; // Sovrascrive e aggiunge error
        feedback.style.display = "block"; // FORZA il display
      }
    } catch (error) {
      feedback.innerText =
        "Verbindungsfehler. Bitte versuchen Sie es später erneut.";
      feedback.classList.add("error");
    } finally {
      btn.innerText = originalBtnText;
      btn.disabled = false;
    }
  });
});
