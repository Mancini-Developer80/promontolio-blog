/**
 * about.js
 * Abilita il bottone submit del form contatti nella pagina About
 * solo dopo l'accettazione del consenso.
 */
document.addEventListener("DOMContentLoaded", () => {
  const consentCheckbox = document.getElementById("consent-about");
  const submitBtn = document.getElementById("submit-btn-about");

  if (!consentCheckbox || !submitBtn) return;

  const toggleButton = () => {
    submitBtn.disabled = !consentCheckbox.checked;
    submitBtn.style.cursor = consentCheckbox.checked
      ? "pointer"
      : "not-allowed";
  };

  consentCheckbox.addEventListener("change", toggleButton);
  toggleButton();
});
