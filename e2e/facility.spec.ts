import type { Page } from "@playwright/test";
import { fixtures } from "./fixtures";
import { expect, test } from "./support";

const facilityPath = `/facility/?id=${fixtures.facility.data.id}`;

/** The timetable's cells, as the browser lays them out. */
async function timetableCells(page: Page) {
  return page.locator("table.table-fixed td").evaluateAll((cells) =>
    cells.map((cell) => ({
      text: cell.textContent?.trim() ?? "",
      align: getComputedStyle(cell).textAlign,
      // The line boxes each time range is laid out in: more than one is a wrap.
      wrapped: [...cell.querySelectorAll("span.block")].some((span) => {
        const range = document.createRange();
        range.selectNodeContents(span);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size > 1;
      }),
      overflows: cell.scrollWidth > cell.clientWidth,
    })),
  );
}

test.describe("施設詳細", () => {
  test("基本情報と、APIへのリンクを表示する", async ({ page }) => {
    await page.goto(facilityPath);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(fixtures.facility.data.name);
    await expect(page.getByRole("row", { name: /電話番号/ })).toContainText("03-3253-7081");
    await expect(page.getByRole("link", { name: `GET /api/v1/medical-facilities/${fixtures.facility.data.id}/opening-hours ↗` })).toBeVisible();
  });

  for (const width of [1280, 1024]) {
    test(`診療時間の表は、幅${width}pxで時刻を1行に収め、「—」「休」を中央に置く`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(facilityPath);

      const table = page.locator("table.table-fixed");
      await expect(table).toBeVisible();
      // 2026-10-05 is a Monday.
      await expect(table.getByRole("columnheader", { name: "月今日" })).toBeVisible();
      await expect(table.getByRole("rowheader", { name: "受付" })).toBeVisible();

      const cells = await timetableCells(page);
      expect(cells.filter((cell) => cell.wrapped || cell.overflows)).toEqual([]);
      for (const cell of cells) {
        expect(cell.align, cell.text).toBe(cell.text === "休" || cell.text === "—" ? "center" : "left");
      }
      await expect(table.getByRole("row", { name: /^時間帯1/ })).toContainText("09:00–13:00");
      // Both of a day's reception ranges sit in one cell, one line each.
      await expect(table.getByRole("row", { name: /^受付/ }).getByRole("cell").first()).toHaveText("08:30–12:3013:30–16:00");
    });
  }

  test("スマホでは、診療時間を曜日ごとの一覧で表示する", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(facilityPath);

    await expect(page.getByRole("heading", { name: "診療時間" })).toBeVisible();
    await expect(page.locator("table.table-fixed")).toBeHidden();
    const monday = page.locator("dl > div").filter({ hasText: "今日" });
    await expect(monday).toContainText("09:00–13:00 / 13:30–17:00");
    await expect(monday).toContainText("受付 08:30–12:30 / 13:30–16:00");
  });

  test("休診日をまとめて表示する", async ({ page }) => {
    await page.goto(facilityPath);

    await expect(page.getByText("毎週日曜、第1土曜、第3土曜、祝日")).toBeVisible();
  });

  test("医療情報ネットと照合できない施設は、その旨を表示する", async ({ page, api }) => {
    api.on("openingHours", () => ({ json: { ...fixtures.openingHours, data: null } }));
    await page.goto(facilityPath);

    await expect(page.getByText("この施設の診療時間が見つかりませんでした")).toBeVisible();
  });

  test("APIのエラーは、APIのメッセージで知らせる", async ({ page, api }) => {
    api.on("facility", () => ({ status: 500, json: { message: "サーバーで問題が発生しました。" } }));
    await page.goto(facilityPath);

    // Next.js keeps a role="alert" route announcer outside main.
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("サーバーで問題が発生しました。");
  });

  test("レート制限（429）は、待つように知らせる", async ({ page, api }) => {
    api.on("facility", () => ({ status: 429, json: { message: "Too Many Attempts." } }));
    await page.goto(facilityPath);

    await expect(page.getByRole("main").getByRole("alert")).toHaveText("アクセスが集中しています。1分ほど待ってから再度お試しください。");
  });
});
