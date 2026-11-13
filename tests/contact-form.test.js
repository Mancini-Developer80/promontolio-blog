const test = require("node:test");
const assert = require("node:assert/strict");

const publicController = require("../controllers/publicController");
const { escapeHtml } = require("../services/emailService");

function createRequest(body = {}) {
  return {
    body,
    res: { locals: { locale: "it" } },
  };
}

function createResponse() {
  return {
    statusCode: 200,
    jsonBody: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.jsonBody = body;
      return this;
    },
  };
}

test("contact form rejects missing required fields", async () => {
  const res = createResponse();

  await publicController.handleContactForm(
    createRequest({ name: "Giuseppe", email: "" }),
    res,
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Compila tutti i campi obbligatori.");
});

test("contact form rejects invalid email and short message", async () => {
  const res = createResponse();

  await publicController.handleContactForm(
    createRequest({
      name: "Giuseppe",
      email: "not-an-email",
      message: "breve",
      consent: true,
    }),
    res,
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Controlla i dati inseriti e riprova.");
});

test("contact form rejects a honeypot submission", async () => {
  const res = createResponse();

  await publicController.handleContactForm(
    createRequest({
      name: "Giuseppe",
      email: "person@example.com",
      message: "Richiedo informazioni sul prodotto.",
      consent: true,
      website: "https://spam.example",
    }),
    res,
  );

  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonBody.message, "Controlla i dati inseriti e riprova.");
});

test("contact email values are escaped before HTML interpolation", () => {
  assert.equal(
    escapeHtml(`<script>alert("x")</script>`),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
});
