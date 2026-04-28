/**
 * landing-page.js
 * Validazione form e feedback bottone submit nella landing page guida.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("guide-form");
  const emailInput = document.getElementById("email-input");
  const checkbox = document.getElementById("consent");
  const submitBtn = document.getElementById("submit-btn");

  if (!form || !emailInput || !checkbox || !submitBtn) return;

  const validateForm = () => {
    const valid = emailInput.checkValidity() && checkbox.checked;
    submitBtn.disabled = !valid;
    submitBtn.style.opacity = valid ? "1" : "0.5";
    submitBtn.style.cursor = valid ? "pointer" : "not-allowed";
  };

  emailInput.addEventListener("input", validateForm);
  checkbox.addEventListener("change", validateForm);

  form.addEventListener("submit", (e) => {
    if (submitBtn.disabled) {
      e.preventDefault();
      return;
    }
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Senden...';
    submitBtn.style.pointerEvents = "none";
  });

  validateForm();
});
