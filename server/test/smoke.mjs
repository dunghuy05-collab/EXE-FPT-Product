import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pacecar-smoke-"));
const dbFile = path.join(tempDir, "db.json");
const port = 4197;
const base = `http://localhost:${port}/api`;
const server = spawn(process.execPath, ["src/index.js"], {
  cwd: serverDir,
  env: {
    ...process.env,
    PORT: String(port),
    PACECAR_DB_FILE: dbFile,
    CLIENT_ORIGIN: "http://localhost:5173",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (chunk) => (serverLog += chunk));
server.stderr.on("data", (chunk) => (serverLog += chunk));

async function request(route, { token, headers, ...options } = {}) {
  const response = await fetch(base + route, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const health = await request("/health");
      if (health.status === 200) return;
    } catch {
      // Server startup is expected to refuse connections briefly.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Test server did not start.\n${serverLog}`);
}

async function login(email) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "123456" }),
  });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  return response.body.token;
}

try {
  await waitForServer();
  const renter = await login("renter@pacecar.vn");
  const owner = await login("owner@pacecar.vn");
  const unrelatedOwner = await login("tung@pacecar.vn");
  const admin = await login("admin@pacecar.vn");

  const forbiddenPromotions = await request("/admin/promotions", {
    token: owner,
  });
  assert.equal(forbiddenPromotions.status, 403);
  const createdPromotion = await request("/admin/promotions", {
    method: "POST",
    token: admin,
    body: JSON.stringify({
      code: "SMOKE15",
      title: "Ưu đãi kiểm thử",
      description: "Dùng để kiểm tra vòng đời quản trị",
      type: "percentage",
      value: 15,
      maxDiscount: 250000,
      minRental: 500000,
      minDays: 1,
      usageLimit: 10,
      expiresAt: "2027-12-31T23:59:59.000Z",
      active: true,
    }),
  });
  assert.equal(
    createdPromotion.status,
    201,
    JSON.stringify(createdPromotion.body),
  );
  assert.equal(createdPromotion.body.code, "SMOKE15");
  const duplicatePromotion = await request("/admin/promotions", {
    method: "POST",
    token: admin,
    body: JSON.stringify({ ...createdPromotion.body, id: undefined }),
  });
  assert.equal(duplicatePromotion.status, 409);
  const publicPromotions = await request("/promotions");
  assert.ok(publicPromotions.body.some((item) => item.code === "SMOKE15"));
  const disabledPromotion = await request(
    `/admin/promotions/${createdPromotion.body.id}/status`,
    {
      method: "PATCH",
      token: admin,
      body: JSON.stringify({ active: false }),
    },
  );
  assert.equal(disabledPromotion.status, 200);
  assert.equal(disabledPromotion.body.active, false);
  const archivedPromotion = await request(
    `/admin/promotions/${createdPromotion.body.id}`,
    { method: "DELETE", token: admin },
  );
  assert.equal(archivedPromotion.status, 204);

  const invalidQuote = await request("/quotes", {
    method: "POST",
    body: JSON.stringify({
      carId: 1,
      startDate: "2027-06-10",
      endDate: "2027-06-12",
      driverOption: "arbitrary",
      pickupOption: "pickup",
    }),
  });
  assert.equal(invalidQuote.status, 400);

  const quoteInput = {
    carId: 1,
    startDate: "2027-06-10",
    endDate: "2027-06-12",
    driverOption: "self",
    pickupOption: "pickup",
  };
  const quote = await request("/quotes", {
    method: "POST",
    token: renter,
    body: JSON.stringify(quoteInput),
  });
  assert.equal(quote.status, 201, JSON.stringify(quote.body));
  assert.ok(quote.body.policyVersion);
  assert.ok(quote.body.totalPrice > 0);

  const secondQuote = await request("/quotes", {
    method: "POST",
    token: renter,
    body: JSON.stringify({
      ...quoteInput,
      startDate: "2027-07-10",
      endDate: "2027-07-12",
    }),
  });
  assert.equal(secondQuote.status, 201);

  const missingConsent = await request("/bookings", {
    method: "POST",
    token: renter,
    headers: { "Idempotency-Key": "smoke-booking" },
    body: JSON.stringify({ quoteId: quote.body.quoteId }),
  });
  assert.equal(missingConsent.status, 422);

  const booking = await request("/bookings", {
    method: "POST",
    token: renter,
    headers: { "Idempotency-Key": "smoke-booking" },
    body: JSON.stringify({
      quoteId: quote.body.quoteId,
      totalPrice: 1,
      ownerId: 999,
      consent: { policyVersion: quote.body.policyVersion },
    }),
  });
  assert.equal(booking.status, 201, JSON.stringify(booking.body));
  assert.equal(booking.body.totalPrice, quote.body.totalPrice);
  assert.equal(booking.body.ownerId, 4);

  const repeat = await request("/bookings", {
    method: "POST",
    token: renter,
    headers: { "Idempotency-Key": "smoke-booking" },
    body: JSON.stringify({
      quoteId: quote.body.quoteId,
      consent: { policyVersion: quote.body.policyVersion },
    }),
  });
  assert.equal(repeat.status, 200);
  assert.equal(repeat.body.id, booking.body.id);

  const mismatchedKey = await request("/bookings", {
    method: "POST",
    token: renter,
    headers: { "Idempotency-Key": "smoke-booking" },
    body: JSON.stringify({
      quoteId: secondQuote.body.quoteId,
      consent: { policyVersion: secondQuote.body.policyVersion },
    }),
  });
  assert.equal(mismatchedKey.status, 409);

  const renterView = await request(`/bookings/${booking.body.id}`, {
    token: renter,
  });
  assert.equal(renterView.status, 200);
  assert.equal("documents" in renterView.body.car, false);

  const forbiddenView = await request(`/bookings/${booking.body.id}`, {
    token: unrelatedOwner,
  });
  assert.equal(forbiddenView.status, 403);

  const accepted = await request(`/bookings/${booking.body.id}/status`, {
    method: "PUT",
    token: owner,
    body: JSON.stringify({ status: "Accepted" }),
  });
  assert.equal(accepted.status, 200);

  const contract = await request("/contracts", {
    method: "POST",
    token: owner,
    body: JSON.stringify({ bookingId: booking.body.id, terms: "tampered" }),
  });
  assert.equal(contract.status, 201, JSON.stringify(contract.body));
  assert.notEqual(contract.body.terms, "tampered");

  const renterSign = await request(`/contracts/${booking.body.id}/sign`, {
    method: "PUT",
    token: renter,
    body: JSON.stringify({ consent: true }),
  });
  assert.equal(renterSign.status, 200);
  assert.equal(renterSign.body.renterSigned, true);

  const ownerSign = await request(`/contracts/${booking.body.id}/sign`, {
    method: "PUT",
    token: owner,
    body: JSON.stringify({ consent: true }),
  });
  assert.equal(ownerSign.status, 200);
  assert.equal(ownerSign.body.status, "Signed");
  assert.equal(ownerSign.body.booking.status, "Contract Signed");

  const favorite = await request("/favorites/1", {
    method: "POST",
    token: renter,
    body: "{}",
  });
  assert.equal(favorite.status, 201);
  const detail = await request("/cars/1", { token: renter });
  assert.equal(detail.body.favorite, true);

  const pause = await request("/cars/1/listing-status", {
    method: "PUT",
    token: owner,
    body: JSON.stringify({ status: "Paused" }),
  });
  assert.equal(pause.status, 200);
  const edit = await request("/cars/1", {
    method: "PUT",
    token: owner,
    body: JSON.stringify({ pricePerDay: 660000 }),
  });
  assert.ok([200, 422].includes(edit.status));
  if (edit.status === 200)
    assert.equal(edit.body.listingStatus, "Pending Review");
  const resume = await request("/cars/1/listing-status", {
    method: "PUT",
    token: owner,
    body: JSON.stringify({ status: "Published" }),
  });
  assert.equal(resume.status, 409);

  console.log(
    "PaceCar API smoke test passed (authorization, pricing, booking, contract, moderation).",
  );
} finally {
  if (server.exitCode === null) {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
  fs.rmSync(tempDir, { recursive: true, force: true });
}
