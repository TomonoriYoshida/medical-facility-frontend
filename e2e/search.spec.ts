import { copy, fixtures } from "./fixtures";
import { expect, test } from "./support";

test.describe("施設検索", () => {
  test("一覧と件数を表示する", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 3 })).toHaveText(["山下小児科医院", "財務省診療所", "農林水産省診療所"]);
    // total=capped: the API counts one past 10,000.
    await expect(page.getByText(/全 10,000 件以上中/)).toBeVisible();
    await expect(page.getByRole("link", { name: "次へ" })).toBeVisible();
  });

  test("検索の条件をURLとAPIに渡す", async ({ page, api }) => {
    await page.goto("/");
    await page.getByLabel("キーワード").fill("札幌 眼科");
    await page.getByLabel("都道府県").selectOption("01");
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page).toHaveURL(/\/\?q=%E6%9C%AD%E5%B9%8C\+%E7%9C%BC%E7%A7%91&prefecture_code=01/);
    await expect
      .poll(() => api.requestsTo("/api/v1/medical-facilities").at(-1)?.searchParams.get("prefecture_code"))
      .toBe("01");
    const query = api.requestsTo("/api/v1/medical-facilities").at(-1)!.searchParams;
    expect(query.get("q")).toBe("札幌 眼科");
    expect(query.get("per_page")).toBe("20");
  });

  test("キーワードが6語以上なら、APIに送らずに知らせる", async ({ page, api }) => {
    await page.goto("/");
    const keyword = page.getByLabel("キーワード");
    await keyword.fill("a b c d e f");
    await page.getByRole("button", { name: "検索" }).click();

    expect(await keyword.evaluate((input: HTMLInputElement) => input.validationMessage)).toBe("キーワードは5語までにしてください。");
    // Give a submission that slipped through time to navigate and fetch.
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/");
    expect(api.requestsTo("/api/v1/medical-facilities").filter((url) => url.searchParams.has("q"))).toEqual([]);
  });

  test("ページ送りは、APIが返せる最後のページで止まる", async ({ page, api }) => {
    const lastPage = copy(fixtures.facilityList);
    lastPage.meta.current_page = lastPage.meta.max_page as number;
    api.on("facilities", () => ({ json: lastPage }));

    await page.goto("/?page=3333");

    await expect(page.getByRole("link", { name: "前へ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "次へ" })).toHaveCount(0);
    await expect(page.getByText("ページ送りで表示できるのは最初の")).toBeVisible();
  });
});
