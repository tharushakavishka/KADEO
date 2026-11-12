import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "C:/Users/USER/.openmausbot/task-workspaces/037c1527-cae9-4d11-8acc-6f16ac86030a/70633e3b-54d9-42a8-9aac-cf24255d67e1";

describe("KADEO All Themes Real-Time Customization & Options Suite", () => {
  it("StorefrontHeader.tsx wires real-time custom navbar and button styles", () => {
    const file = path.join(root, "src/components/storefront/StorefrontHeader.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes('customStyle(t, "navbar")'), "StorefrontHeader must bind navbarStyle");
    assert.ok(code.includes('customStyle(t, "buttons")'), "StorefrontHeader must bind buttonStyle");
    assert.ok(code.includes('data-style-part="navbar"'), "StorefrontHeader must tag navbar with data-style-part");
    assert.ok(code.includes('data-style-part="buttons"'), "StorefrontHeader must tag cart button with data-style-part");
  });

  it("ShopAppTheme.tsx binds real-time styles and hero visibility controls", () => {
    const file = path.join(root, "src/components/storefront/themes/ShopAppTheme.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes('customStyle(t, "card")'), "ShopAppTheme must bind cardStyle");
    assert.ok(code.includes('customStyle(t, "navbar")'), "ShopAppTheme must bind navbarStyle");
    assert.ok(code.includes('customStyle(t, "search")'), "ShopAppTheme must bind searchStyle");
    assert.ok(code.includes('customStyle(t, "buttons")'), "ShopAppTheme must bind buttonStyle");
    assert.ok(code.includes("showHeroContent"), "ShopAppTheme must handle showHeroContent");
  });

  it("ShopAppTheme.tsx renders a clean hero image slider without text and buttons", () => {
    const file = path.join(root, "src/components/storefront/themes/ShopAppTheme.tsx");
    const code = fs.readFileSync(file, "utf8");
    // Verify hero section is an interactive image slider
    assert.ok(code.includes('data-editor-slider="true"'), "Hero section must be tagged as an image slider");
    assert.ok(code.includes("currentSlide"), "ShopAppTheme must manage currentSlide state");
    assert.ok(code.includes("isSliderPaused"), "ShopAppTheme must support pausing on hover");
    assert.ok(code.includes("ChevronLeft"), "ShopAppTheme must have previous arrow control");
    assert.ok(code.includes("ChevronRight"), "ShopAppTheme must have next arrow control");
    assert.ok(code.includes("handleTouchStart"), "ShopAppTheme must support mobile touch swipe");
    assert.ok(code.includes("slider:slide:"), "ShopAppTheme must read custom slider slides");

    // Verify text overlays and CTA buttons are removed from hero section
    assert.ok(!code.includes("Unwrap exclusive offers, all week long"), "Hero section must not contain hardcoded text overlay");
    assert.ok(!code.includes("Winter Beanie"), "Hero section must not contain mock stand knitwear label");

    // Verify mock category pills are removed from header
    assert.ok(!code.includes("Holiday Sale"), "Header must not contain mock Holiday Sale pill");
    assert.ok(!code.includes("Sporting goods"), "Header must not contain mock Sporting goods pill");
    assert.ok(!code.includes("Baby & toddler"), "Header must not contain mock Baby & toddler pill");
  });

  it("MinimalTheme.tsx binds real-time styles and hero visibility controls", () => {
    const file = path.join(root, "src/components/storefront/themes/MinimalTheme.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes('customStyle(t, "card")'), "MinimalTheme must bind cardStyle");
    assert.ok(code.includes('customStyle(t, "buttons")'), "MinimalTheme must bind buttonStyle");
    assert.ok(code.includes("heroVisible"), "MinimalTheme must handle heroVisible");
    assert.ok(code.includes('data-style-part="card"'), "MinimalTheme must tag card elements");
    assert.ok(code.includes('data-style-part="buttons"'), "MinimalTheme must tag button elements");
  });

  it("BoutiqueTheme.tsx binds real-time styles and hero visibility controls", () => {
    const file = path.join(root, "src/components/storefront/themes/BoutiqueTheme.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes('customStyle(t, "card")'), "BoutiqueTheme must bind cardStyle");
    assert.ok(code.includes('customStyle(t, "buttons")'), "BoutiqueTheme must bind buttonStyle");
    assert.ok(code.includes("heroVisible"), "BoutiqueTheme must handle heroVisible");
    assert.ok(code.includes('data-style-part="card"'), "BoutiqueTheme must tag card elements");
    assert.ok(code.includes('data-style-part="buttons"'), "BoutiqueTheme must tag button elements");
  });

  it("ClassicTheme.tsx binds real-time styles and hero visibility controls", () => {
    const file = path.join(root, "src/components/storefront/themes/ClassicTheme.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes('customStyle(t, "card")'), "ClassicTheme must bind cardStyle");
    assert.ok(code.includes('customStyle(t, "buttons")'), "ClassicTheme must bind buttonStyle");
    assert.ok(code.includes("heroContentVisible"), "ClassicTheme must handle heroContentVisible");
    assert.ok(code.includes('data-style-part="card"'), "ClassicTheme must tag card elements");
    assert.ok(code.includes('data-style-part="buttons"'), "ClassicTheme must tag button elements");
  });

  it("StoreContentEditor.tsx renders HeroVisibilityControls across all themes", () => {
    const file = path.join(root, "src/components/dashboard/StoreContentEditor.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(
      !code.includes('shop.theme_id === "modern_retail" && <HeroVisibilityControls'),
      "HeroVisibilityControls must not be restricted to modern_retail only"
    );
    assert.ok(
      code.includes('<HeroVisibilityControls values={draft.storefront_content} onChange={updateIcon}/>'),
      "HeroVisibilityControls must be rendered for all themes"
    );
  });

  it("StoreContentEditor.tsx supports multi-slide hero image management", () => {
    const file = path.join(root, "src/components/dashboard/StoreContentEditor.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes("Hero image slider"), "StoreContentEditor must have Hero image slider section");
    assert.ok(code.includes("slider:slide:"), "StoreContentEditor must manage slider:slide keys");
    assert.ok(code.includes("+ Add another slide"), "StoreContentEditor must support adding multiple slides");
  });

  it("store-content-fields.json includes field keys for shop_app theme", () => {
    const file = path.join(root, "src/lib/store-content-fields.json");
    const content = JSON.parse(fs.readFileSync(file, "utf8"));
    const shopAppFields = content.filter((f) => f.theme === "shop_app");
    assert.ok(shopAppFields.length >= 6, "Must contain at least 6 shop_app fields");
    assert.ok(shopAppFields.some((f) => f.key === "shopapp:hero:title"), "Must have hero title field");
    assert.ok(shopAppFields.some((f) => f.key === "shopapp:search:placeholder"), "Must have search placeholder field");
  });

  it("ShopAppTheme and ThemeCustomizer support 5 dynamic navigation menu styles", () => {
    const layoutJson = JSON.parse(fs.readFileSync(path.join(root, "src/lib/store-layout-options.json"), "utf8"));
    const menuOpt = layoutJson.find((l) => l.key === "layout:menu");
    assert.ok(menuOpt, "layout:menu must exist in store-layout-options.json");
    assert.equal(menuOpt.options.length, 5, "layout:menu must provide 5 distinct navigation styles");

    const customizerCode = fs.readFileSync(path.join(root, "src/components/dashboard/ThemeCustomizer.tsx"), "utf8");
    assert.ok(customizerCode.includes('updateKey("layout:menu"'), "ThemeCustomizer must allow changing menu layout");
    assert.ok(customizerCode.includes("floating_dock"), "ThemeCustomizer must include floating_dock option");
    assert.ok(customizerCode.includes("compact_left"), "ThemeCustomizer must include compact_left option");
    assert.ok(customizerCode.includes("expanded_left"), "ThemeCustomizer must include expanded_left option");
    assert.ok(customizerCode.includes("top_navbar"), "ThemeCustomizer must include top_navbar option");
    assert.ok(customizerCode.includes("top_floating_pill"), "ThemeCustomizer must include top_floating_pill option");

    const shopAppCode = fs.readFileSync(path.join(root, "src/components/storefront/themes/ShopAppTheme.tsx"), "utf8");
    assert.ok(shopAppCode.includes('t("layout:menu"'), "ShopAppTheme must read layout:menu setting");
    assert.ok(shopAppCode.includes('menuLayout === "floating_dock"'), "ShopAppTheme must support floating_dock layout");
    assert.ok(shopAppCode.includes('menuLayout === "compact_left"'), "ShopAppTheme must support compact_left layout");
    assert.ok(shopAppCode.includes('menuLayout === "expanded_left"'), "ShopAppTheme must support expanded_left layout");
    assert.ok(shopAppCode.includes('menuLayout === "top_navbar"'), "ShopAppTheme must support top_navbar layout");
    assert.ok(shopAppCode.includes('menuLayout === "top_floating_pill"'), "ShopAppTheme must support top_floating_pill layout");
  });

  it("ThemeCustomizer.tsx implements Phase 6 Visual Element Inspector and Studio Mode", () => {
    const file = path.join(root, "src/components/dashboard/ThemeCustomizer.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes("studioMode"), "ThemeCustomizer must track studioMode (view vs edit)");
    assert.ok(code.includes("selectedElementId"), "ThemeCustomizer must track selectedElementId");
    assert.ok(code.includes('id: "inspector"'), "ThemeCustomizer must have inspector tab");
    assert.ok(code.includes("MousePointerClick"), "ThemeCustomizer must import MousePointerClick");
    assert.ok(code.includes("top-left") && code.includes("bottom-right"), "ThemeCustomizer must provide 3x3 alignment matrix");
    assert.ok(code.includes("Click Element to Inspect:"), "ThemeCustomizer must show interactive element selector bar");
    assert.ok(code.includes("border-blue-600") && code.includes("rounded-xs"), "ThemeCustomizer must render visual selection box with 4 corner handles");
  });

  it("StoreContent.tsx binds visual studio semantic element overrides and CSS variables", () => {
    const file = path.join(root, "src/components/storefront/StoreContent.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes("element:hero_cta:text"), "StoreContent must support hero_cta:text override");
    assert.ok(code.includes("element:hero_title:text"), "StoreContent must support hero_title:text override");
    assert.ok(code.includes("element:announcement:text"), "StoreContent must support announcement:text override");
    assert.ok(code.includes("--theme-btn-width"), "StoreContent must expose --theme-btn-width");
    assert.ok(code.includes("--theme-btn-height"), "StoreContent must expose --theme-btn-height");
    assert.ok(code.includes("--theme-btn-font-size"), "StoreContent must expose --theme-btn-font-size");
  });

  it("content-actions.ts enforces Phase 11 Database Safety and Payload Sanitization", () => {
    const file = path.join(root, "src/features/shops/content-actions.ts");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes("150000"), "saveThemeStylesAction must enforce 150KB payload bound");
    assert.ok(code.includes("3000"), "saveThemeStylesAction must enforce 3000 character limit per value");
    assert.ok(code.includes("^[a-zA-Z0-9_:.-]+$"), "saveThemeStylesAction must sanitize key characters");
    assert.ok(code.includes('.eq("owner_id", user.id)'), "saveThemeStylesAction must isolate multi-tenant shop owner");
  });
});
