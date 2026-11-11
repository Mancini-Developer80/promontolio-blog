// cart.js - Gestione completa del carrello per Promontolio

document.addEventListener("DOMContentLoaded", () => {
  // 1. VARIABILI UI
  const openCartBtn = document.getElementById("open-cart");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");
  const cartBadge = document.getElementById("cart-badge");
  const addCartBtn = document.querySelector(".btn-add-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartI18nElement = document.getElementById("cart-i18n");

  const defaultCartI18n = {
    title: "Ihr Warenkorb",
    close: "Schließen",
    empty: "Ihr Warenkorb ist noch leer.",
    total: "Gesamtsumme:",
    checkout: "Zur Kasse",
    shippingPrefix: "Inkl. MwSt. zzgl.",
    shippingLink: "Versandkosten",
    remove: "Entfernen",
    freeShippingTitle: "Gratis-Versand aktiviert!",
    freeShippingText: "Ihr Vorratspack ist auf dem Weg nach Frankfurt.",
    tipShipping: "Tipp: Mit dem 12er Paket sparen Sie die Versandkosten!",
    loading: "Wird geladen...",
    checkoutError: "Es gab einen Fehler. Bitte versuchen Sie es später erneut.",
    bundle6Name: "Bio-Olivenöl (6er Paket)",
    bundle12Name: "Bio-Olivenöl (12er Paket)",
  };

  let cartI18n = defaultCartI18n;
  if (cartI18nElement && cartI18nElement.textContent) {
    try {
      cartI18n = {
        ...defaultCartI18n,
        ...JSON.parse(cartI18nElement.textContent),
      };
    } catch (error) {
      console.warn("Invalid cart i18n payload, using defaults.", error);
    }
  }

  // Inizializziamo il carrello dal LocalStorage o come array vuoto
  let cart = JSON.parse(localStorage.getItem("promontolio_cart")) || [];

  // 2. FUNZIONI DI CONTROLLO UI
  const openCart = () => {
    if (!cartSidebar || !cartOverlay) return;
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    renderCart();
  };

  const closeCart = () => {
    if (!cartSidebar || !cartOverlay) return;
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  // 3. LOGICA DEL CARRELLO (LOGICA CORE)
  const saveAndRefresh = () => {
    localStorage.setItem("promontolio_cart", JSON.stringify(cart));
    updateBadge();
    renderCart();
  };

  const updateBadge = () => {
    if (cartBadge) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge.innerText = totalItems;
      cartBadge.style.display = totalItems > 0 ? "flex" : "none";
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push(product);
    }
    saveAndRefresh();
    openCart(); // Feedback immediato all'aggiunta
  };

  const removeFromCart = (id) => {
    cart = cart.filter((item) => item.id !== id);
    saveAndRefresh();
  };

  // 4. RENDERING DINAMICO (UI IN TEDESCO)
  const renderCart = () => {
    const container = document.getElementById("cart-items-container");
    const totalElement = document.getElementById("cart-total-amount");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!container || !totalElement) return;

    // 1. Caso Carrello Vuoto
    if (cart.length === 0) {
      container.innerHTML = `<p class="empty-msg">${cartI18n.empty}</p>`;
      totalElement.innerText = "0,00 €";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let subtotal = 0;
    const isTwelvePack = cart.some((item) => item.id === "oil-bundle-12");

    // 2. Generazione HTML prodotti
    container.innerHTML = cart
      .map((item) => {
        subtotal += item.price * item.quantity;
        return `
        <div class="cart-item">
          <div class="item-info">
            <p class="item-name">${item.name}</p>
            <p class="item-price">${item.quantity} x ${item.price.toFixed(2).replace(".", ",")} €</p>
          </div>
          <button class="remove-item" data-id="${item.id}" title="${cartI18n.remove}">&times;</button>
        </div>
      `;
      })
      .join("");

    // 3. Logica Semplificata Spedizione (Focus sulla conversione)
    let shippingNoticeHtml = "";
    if (isTwelvePack) {
      shippingNoticeHtml = `
        <div class="shipping-notice free">
          <strong>${cartI18n.freeShippingTitle}</strong> 🚀<br>
          <small>${cartI18n.freeShippingText}</small>
        </div>
      `;
    } else {
      shippingNoticeHtml = `
        <div class="shipping-notice">
          ${cartI18n.tipShipping}
        </div>
      `;
    }
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.innerText = cartI18n.checkout; // Resetta il testo se era rimasto su loading
    }

    container.innerHTML += shippingNoticeHtml;
    totalElement.innerText = `${subtotal.toFixed(2).replace(".", ",")} €`;

    // 4. Listener per rimozione
    container.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        removeFromCart(id);
      });
    });
  };

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      // Mostriamo un caricamento (opzionale)
      checkoutBtn.innerText = cartI18n.loading;
      checkoutBtn.disabled = true;

      try {
        const response = await fetch("/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart }),
        });

        const session = await response.json().catch(() => ({}));
        if (!response.ok || typeof session.url !== "string") {
          throw new Error(session.error || `Checkout failed (${response.status})`);
        }

        // Reindirizziamo l'utente su Stripe
        window.location.href = session.url;
      } catch (error) {
        console.error("Errore nel checkout:", error);
        alert(cartI18n.checkoutError);
        checkoutBtn.innerText = cartI18n.checkout;
        checkoutBtn.disabled = false;
      }
    });
  }

  // 5. GESTIONE EVENTI
  if (openCartBtn) {
    openCartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  }

  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Evento per il bottone nella pagina prodotto
  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
      const selectedBundle = document.querySelector(
        'input[name="bundle"]:checked',
      );
      if (selectedBundle) {
        const bundleValue = selectedBundle.value;
        const product = {
          id: `oil-bundle-${bundleValue}`,
          name:
            bundleValue === "6" ? cartI18n.bundle6Name : cartI18n.bundle12Name,
          price: bundleValue === "6" ? 96.0 : 192.0,
          quantity: 1,
        };
        addToCart(product);
      }
    });
  }

  // 6. ESECUZIONE INIZIALE (Al caricamento della pagina)
  updateBadge();
  renderCart();
});
