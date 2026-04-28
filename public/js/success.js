/**
 * success.js
 * Svuota il carrello dal localStorage dopo un acquisto completato.
 */
(function () {
  localStorage.removeItem("promontolio_cart");

  const cartBadge = document.getElementById("cart-badge");
  if (cartBadge) {
    cartBadge.innerText = "0";
    cartBadge.style.display = "none";
  }
})();
