import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const executablePath =
  process.env.PACECAR_BROWSER ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseURL = process.env.PACECAR_BASE_URL || "http://127.0.0.1:4200";
const browser = await chromium.launch({ executablePath, headless: true });

const localDate = (offset) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

try {
  const results = [];
  for (const viewport of [
    { width: 390, height: 844, name: "mobile" },
    { width: 1440, height: 900, name: "desktop" },
  ]) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.getByText("PaceCar đứng ở đâu trong giao dịch?").waitFor();
    assert.equal(await page.getByText("Khu vực nhận xe").count(), 1);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    assert.ok(overflow <= 1, `${viewport.name} overflow: ${overflow}px`);
    assert.deepEqual(pageErrors, []);
    results.push({ viewport: viewport.name, overflow, pageErrors });
    await page.close();
  }

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByLabel("Ngày nhận xe").fill(localDate(2));
  await page.getByLabel("Ngày trả xe").fill(localDate(3));
  await page.getByLabel("Giờ nhận xe").fill("05:30");
  await page.getByRole("button", { name: "Tìm xe" }).click();
  await page.getByText("PaceCar hỗ trợ bàn giao từ 06:00 đến 22:00").waitFor();
  assert.equal(new URL(page.url()).pathname, "/");

  await page.getByLabel("Giờ nhận xe").fill("06:00");
  await page.getByLabel("Giờ trả xe").fill("22:00");
  await page.getByRole("button", { name: "Tìm xe" }).click();
  await page.waitForURL(/\/cars\?/);
  await page.getByRole("link", { name: "Xem xe & báo giá" }).first().click();
  await page.waitForURL(/\/cars\/\d+/);
  await page.getByText("Điểm hẹn mặc định:").waitFor();
  await page.getByText("Phụ phí bàn giao ngoài giờ").waitFor();
  await page.getByText("Phí nền tảng", { exact: true }).waitFor();
  await page.getByText("Nhiên liệu: giao đầy – trả đầy").waitFor();
  results.push({ flow: "search-to-quote", status: "passed" });
  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await browser.close();
}
