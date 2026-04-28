/**
 * admin-profile.js
 * Gestisce il toggle del form cambio password nella pagina profilo.
 */
function togglePasswordFields() {
  const fields = document.getElementById("passwordFields");
  const button = document.querySelector(".password-toggle");
  if (!fields || !button) return;

  if (fields.classList.contains("active")) {
    fields.classList.remove("active");
    button.innerHTML = '<i class="fas fa-key"></i> Change Password';
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
  } else {
    fields.classList.add("active");
    button.innerHTML =
      '<i class="fas fa-eye-slash"></i> Cancel Password Change';
  }
}
