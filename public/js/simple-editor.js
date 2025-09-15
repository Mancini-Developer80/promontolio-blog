// Simple Rich Text Editor - Local Implementation
class SimpleEditor {
  constructor(selector, options = {}) {
    this.container = document.querySelector(selector);
    this.options = {
      height: options.height || "400px",
      placeholder: options.placeholder || "Start writing...",
      ...options,
    };
    this.init();
  }

  init() {
    this.createEditor();
    this.createToolbar();
    this.bindEvents();
  }

  createEditor() {
    this.editor = document.createElement("div");
    this.editor.className = "simple-editor-content";
    this.editor.contentEditable = true;
    this.editor.style.cssText = `
      min-height: ${this.options.height};
      padding: 1rem;
      border: 1px solid #ddd;
      border-top: none;
      outline: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      background: white;
    `;
    this.editor.setAttribute("data-placeholder", this.options.placeholder);
    this.container.appendChild(this.editor);
  }

  createToolbar() {
    this.toolbar = document.createElement("div");
    this.toolbar.className = "simple-editor-toolbar";
    this.toolbar.style.cssText = `
      border: 1px solid #ddd;
      background: #f8f9fa;
      padding: 0.5rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    `;

    const tools = [
      { command: "bold", icon: "B", title: "Bold" },
      { command: "italic", icon: "I", title: "Italic" },
      { command: "underline", icon: "U", title: "Underline" },
      { type: "separator" },
      { command: "insertUnorderedList", icon: "•", title: "Bullet List" },
      { command: "insertOrderedList", icon: "1.", title: "Numbered List" },
      { type: "separator" },
      { command: "createLink", icon: "🔗", title: "Insert Link" },
      { type: "separator" },
      { command: "removeFormat", icon: "✖", title: "Clear Formatting" },
    ];

    tools.forEach((tool) => {
      if (tool.type === "separator") {
        const sep = document.createElement("div");
        sep.style.cssText = "width: 1px; background: #ddd; margin: 0 0.25rem;";
        this.toolbar.appendChild(sep);
      } else {
        const btn = this.createToolbarButton(tool);
        this.toolbar.appendChild(btn);
      }
    });

    this.container.insertBefore(this.toolbar, this.editor);
  }

  createToolbarButton(tool) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = tool.icon;
    btn.title = tool.title;
    btn.style.cssText = `
      padding: 0.5rem;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 3px;
      font-weight: bold;
      min-width: 32px;
    `;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.executeCommand(tool.command);
    });

    btn.addEventListener("mouseover", () => {
      btn.style.background = "#e9ecef";
    });

    btn.addEventListener("mouseout", () => {
      btn.style.background = "white";
    });

    return btn;
  }

  executeCommand(command) {
    if (command === "createLink") {
      const url = prompt("Enter URL:");
      if (url) {
        document.execCommand("createLink", false, url);
      }
    } else {
      document.execCommand(command, false, null);
    }
    this.editor.focus();
  }

  bindEvents() {
    // Handle placeholder
    this.editor.addEventListener("focus", () => {
      if (this.editor.textContent.trim() === "") {
        this.editor.innerHTML = "";
      }
    });

    this.editor.addEventListener("blur", () => {
      if (this.editor.textContent.trim() === "") {
        this.editor.innerHTML = "";
      }
    });

    // Add placeholder styling
    const style = document.createElement("style");
    style.textContent = `
      .simple-editor-content:empty:before {
        content: attr(data-placeholder);
        color: #999;
        pointer-events: none;
      }
      .simple-editor-content:focus:before {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  getContent() {
    return this.editor.innerHTML;
  }

  setContent(html) {
    this.editor.innerHTML = html;
  }

  on(event, callback) {
    this.editor.addEventListener(event, callback);
  }
}

// Auto-initialize if element exists
document.addEventListener("DOMContentLoaded", function () {
  const editorContainer = document.getElementById("simple-editor-container");
  if (editorContainer) {
    const textarea = document.getElementById("content");

    const editor = new SimpleEditor("#simple-editor-container", {
      placeholder: "Start writing your blog post...",
      height: "400px",
    });

    // Set initial content
    if (textarea && textarea.value.trim()) {
      editor.setContent(textarea.value);
    }

    // Update textarea on content change
    editor.on("input", () => {
      if (textarea) {
        textarea.value = editor.getContent();
      }
    });

    // Update before form submission
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", () => {
        if (textarea) {
          textarea.value = editor.getContent();
        }
      });
    }
  }
});
