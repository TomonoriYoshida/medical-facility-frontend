import AxeBuilder from "@axe-core/playwright";
import { fixtures } from "./fixtures";
import { expect, test } from "./support";

test("APIのメンテナンス中（503）は、ヘッダーの下に知らせる", async ({ page, api }) => {
  api.on("options", () => ({ status: 503, json: { message: "Service Unavailable" } }));
  await page.goto("/");

  await expect(page.getByRole("status").filter({ hasText: "メンテナンス中" })).toBeVisible();
});

for (const [name, path] of [
  ["施設検索", "/"],
  ["施設詳細", `/facility/?id=${fixtures.facility.data.id}`],
]) {
  test(`${name}に、重大なアクセシビリティの問題がない`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(serious.map(({ id, help, nodes }) => ({ id, help, targets: nodes.map((node) => node.target.join(" ")) }))).toEqual([]);
  });
}
