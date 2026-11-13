document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".contact-form");
  const feedback = document.getElementById("form-feedback");

  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    feedback.className = "form-feedback";
    feedback.textContent = "";

    const btn = contactForm.querySelector("button");
    const originalBtnText = btn.innerText;
    btn.innerText =
      contactForm.dataset.sendingMessage || originalBtnText;
    btn.disabled = true;
    contactForm.setAttribute("aria-busy", "true");

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim(),
      consent: document.getElementById("consent").checked,
      website: document.getElementById("website").value,
    };

    try {
      const response = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Invalid server response");
      }
      const result = await response.json();

      if (response.ok && result.success) {
        window.location.assign("/contact?contact=success");
      } else {
        feedback.textContent = result.message || "";
        feedback.className = "form-feedback error";
        feedback.style.display = "block";
      }
    } catch (error) {
      feedback.textContent =
        contactForm.dataset.connectionError || "";
      feedback.className = "form-feedback error";
      feedback.style.display = "block";
    } finally {
      btn.innerText = originalBtnText;
      btn.disabled = false;
      contactForm.removeAttribute("aria-busy");
    }
  });
});
