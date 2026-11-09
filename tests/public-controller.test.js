const test = require("node:test");
const assert = require("node:assert/strict");

const publicController = require("../controllers/publicController");

function createRequest(body = {}, route = "/") {
  return {
    body,
    res: { locals: { locale: "it" } },
    query: {},
  };
}

function createResponse() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    jsonBody: null,
    json(body) {
      this.jsonBody = body;
      return this;
    },
    rendered: null,
    render(view, data) {
      this.rendered = { view, data };
      return this;
    },
    redirectedTo: null,
    redirect(url) {
      this.redirectedTo = url;
      return this;
    },
  };
}

test("contact form rejects incomplete data without sending an email", async () => {
  const req = createRequest({ name: "Giuseppe", email: "" });
  const res = createResponse();

  await publicController.handleContactForm(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.jsonBody, {
    success: false,
    message: "Compila tutti i campi obbligatori.",
  });
});

test("subscription rejects missing consent", async () => {
  const req = createRequest({ email: "person@example.com", consent: false });
  const res = createResponse();

  await publicController.postSubscribe(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.rendered.view, "index");
  assert.equal(
    res.rendered.data.error,
    "Il consenso al trattamento dei dati è obbligatorio.",
  );
});

test("subscription rejects a missing email after consent", async () => {
  const req = createRequest({ consent: true });
  const res = createResponse();

  await publicController.postSubscribe(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.rendered.view, "index");
  assert.equal(
    res.rendered.data.error,
    "Inserisci un indirizzo email valido.",
  );
});

test("success page redirects home when Stripe session id is missing", async () => {
  const req = createRequest();
  const res = createResponse();

  await publicController.getSuccess(req, res);

  assert.equal(res.redirectedTo, "/");
});
