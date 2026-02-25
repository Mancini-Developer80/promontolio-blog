document.addEventListener("DOMContentLoaded", function () {
  const editorContainer = document.getElementById("editor-container");
  const contentInput = document.getElementById("content-input");
  const form = document.querySelector("form");

  if (editorContainer && contentInput) {
    // Inizializzazione Quill
    const quill = new Quill("#editor-container", {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
      placeholder: "Scrivi qui il tuo articolo sull'olio del Gargano...",
    });

    // Carica il contenuto iniziale dal campo hidden (per l'Edit)
    if (contentInput.value) {
      quill.root.innerHTML = contentInput.value;
    }

    // Sincronizza il contenuto di Quill nel campo hidden prima del submit
    form.addEventListener("submit", function (e) {
      const html = quill.root.innerHTML;
      // Evitiamo di inviare un editor vuoto (Quill mette spesso <p><br></p>)
      if (html === "<p><br></p>") {
        contentInput.value = "";
      } else {
        contentInput.value = html;
      }
    });
  }
});
