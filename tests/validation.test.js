const test = require("node:test");
const assert = require("node:assert/strict");

const { loginValidation } = require("../middleware/validation");

async function runValidation(body) {
  const req = {
    body: { ...body },
    flash(type, message) {
      this.flashMessage = { type, message };
    },
  };
  const res = {
    redirectedTo: null,
    redirect(url) {
      this.redirectedTo = url;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await loginValidation[0](req, res, () => {});
  await loginValidation[1](req, res, () => {});
  await loginValidation[2](req, res, next);

  return { req, res, nextCalled };
}

test("login validation accepts username and password", async () => {
  const result = await runValidation({
    username: "admin",
    password: "secret",
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.res.redirectedTo, null);
});

test("login validation rejects missing credentials", async () => {
  const result = await runValidation({});

  assert.equal(result.nextCalled, false);
  assert.equal(result.res.redirectedTo, "back");
  assert.match(result.req.flashMessage.message, /Username richiesto/);
  assert.match(result.req.flashMessage.message, /Password richiesta/);
});
