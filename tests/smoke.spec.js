const { test, expect } = require("@playwright/test");

const sizes = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

for (const [name, size] of Object.entries(sizes)) {
  test.describe(name, () => {
    test.use({ viewport: size });

    test.beforeEach(async ({ page }) => {
      // reduced motion skips the first-launch sequence and animations, so tests see the finished page
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    test("loads without errors or sideways scroll", async ({ page }) => {
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => m.type() === "error" && errors.push(m.text()));
      await page.goto("/");
      await expect(page.locator("#s1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `tests/shots/${name}-home.png` });
      expect(errors).toEqual([]);
    });

    test("workspaces switch and projects update", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("tab", { name: /Workspace 2/ }).click();
      await expect(page.locator("#s2")).toBeVisible();
      await expect(page.locator("#s1")).toBeHidden();
      await page.getByRole("option", { name: /homelab/ }).click();
      await expect(page.locator("#detail")).toContainText("homelab");
      await page.keyboard.press("ArrowDown");
      await expect(page.locator("#detail")).toContainText("linux-monitor");
      await page.keyboard.press("k");
      await expect(page.locator("#detail")).toContainText("homelab");
      await page.screenshot({ path: `tests/shots/${name}-projects.png` });
    });

    test("theme menu opens above the windows", async ({ page }) => {
      await page.goto("/");
      await page.locator("#flavors button").first().click();
      const item = page.getByRole("option", { name: "nord" }).or(page.getByRole("option", { name: "latte" })).first();
      await expect(item).toBeVisible();
      const onTop = await item.evaluate(el => {
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      });
      expect(onTop).toBe(true);
      await item.click();
      await expect(page.locator("html")).toHaveAttribute("data-flavor", /macchiato|frappe|latte|mocha/);
    });
  });
}

test("first launch plays, then ends with every window visible", async ({ page }) => {
  await page.setViewportSize(sizes.desktop);
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/booting/);
  const t0 = Date.now();
  await expect(page.locator("html")).not.toHaveClass(/booting/, { timeout: 8000 });
  expect(Date.now() - t0).toBeLessThan(5500);
  await expect(page.locator("#s1 .typed").first()).toHaveText("fastfetch");
  await expect(page.locator("#s1 .win")).toHaveCount(3);
  for (const w of await page.locator("#s1 .win").all()) await expect(w).toHaveCSS("opacity", "1");
});

test("any key skips the first-launch sequence", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Shift");
  await expect(page.locator("html")).not.toHaveClass(/booting/);
  await expect(page.locator("#s1 .typed").first()).toHaveText("fastfetch");
});

test("refresh replays the first-launch sequence", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Shift");
  await expect(page.locator("html")).not.toHaveClass(/booting/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/booting/);
  await expect(page.locator("#s1 .typed").first()).toHaveText("");
});

test("workspace switch plays a slide animation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Shift");
  await page.getByRole("tab", { name: /Workspace 2/ }).click();
  await expect(page.locator("#s2")).toHaveClass(/from-r/);
  await page.getByRole("tab", { name: /Workspace 1/ }).click();
  await expect(page.locator("#s1")).toHaveClass(/from-l/);
});

test("intro toggle turns the first-launch sequence off and on", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Shift");
  await page.locator("#introbtn").click();
  await expect(page.locator("#introbtn")).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/booting/);
  await expect(page.locator("#s1 .typed").first()).toHaveText("fastfetch");
  await page.locator("#introbtn").click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/booting/);
});

test("every listed wallpaper loads and the dropdown switches to it", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const { wallpapers } = await page.evaluate(() => import("/wallpapers.js"));
  for (const w of wallpapers) expect((await request.get("/" + w.src)).ok(), w.src).toBe(true);
  await page.locator("#wpdd > button").click();
  await page.getByRole("option", { name: wallpapers[1].label }).click();
  await expect(page.locator("#wall > div").first()).toHaveCSS("background-image", new RegExp(wallpapers[1].id));
});

test("theme and wallpaper choices survive a refresh, and girl stars is the default", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#wpdd > button")).toContainText("girl stars");
  await expect(page.locator("html")).toHaveAttribute("data-flavor", "mocha");
  await page.locator("#flavors > button").click();
  await page.getByRole("option", { name: "frappe" }).click();
  await page.locator("#wpdd > button").click();
  await page.getByRole("option", { name: "waves" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-flavor", "frappe");
  await expect(page.locator("#flavors > button")).toContainText("frappe");
  await expect(page.locator("#wpdd > button")).toContainText("waves");
});

test("a window stays visible after it opens while the rest of the sequence plays", async ({ page }) => {
  await page.goto("/");
  await page.locator("#s1 .win.in").first().waitFor();
  await page.waitForTimeout(700); // well past the 260ms pop animation
  await expect(page.locator("html")).toHaveClass(/booting/);
  await expect(page.locator("#s1 .win").first()).toHaveCSS("opacity", "1");
  await expect(page.locator("#s1 .win").nth(2)).toHaveCSS("opacity", "0");
});

test("email is a mailto link", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("tab", { name: /Workspace 2/ }).click();
  await expect(page.locator("#mail")).toHaveAttribute("href", /^mailto:.+@.+/);
});
