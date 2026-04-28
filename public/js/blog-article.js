/**
 * blog-article.js
 * Genera il sommario (TOC), gestisce la condivisione social
 * e lo scroll fluido negli articoli del blog.
 */
document.addEventListener("DOMContentLoaded", function () {
  generateTableOfContents();
  setupSocialSharing();
  setupSmoothScrolling();
});

function generateTableOfContents() {
  const contentArea = document.querySelector(".article-content-main");
  const tocContainer = document.getElementById("table-of-contents");
  if (!contentArea || !tocContainer) return;

  const headings = contentArea.querySelectorAll("h1, h2, h3");

  if (headings.length === 0) {
    const tocWidget = document.querySelector(".toc-widget");
    if (tocWidget) tocWidget.style.display = "none";
    return;
  }

  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = heading.textContent;
    a.className = `toc-${heading.tagName.toLowerCase()}`;
    li.appendChild(a);
    tocContainer.appendChild(li);
  });
}

function setupSocialSharing() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);

  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const platform = this.classList[1]; // facebook, twitter, etc.
      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${title}%20${url}`;
          break;
      }

      if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
    });
  });
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
