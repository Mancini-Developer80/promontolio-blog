process.env.NODE_ENV = "test";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const prisma = require("../db");

test.after(async () => {
  await prisma.$disconnect();
});

test("public pages render successfully", async () => {
  for (const route of ["/", "/about", "/product", "/contact", "/blog"]) {
    const response = await request(app).get(route);

    assert.equal(response.status, 200, `${route} should return 200`);
    assert.match(response.headers["content-type"], /html/);
  }
});

test("unknown public route returns the custom 404 page", async () => {
  const response = await request(app).get("/does-not-exist");

  assert.equal(response.status, 404);
  assert.match(response.text, /404|non trovata|nicht gefunden/i);
});

test("admin routes redirect unauthenticated visitors to login", async () => {
  const response = await request(app).get("/admin/dashboard");

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, "/auth/login");
});
