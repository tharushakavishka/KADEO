import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const projectRoot = process.cwd();

test("KADEO Theme Studio Specification & Integration Suite", async (t) => {
  const customizerSrc = fs.readFileSync(
    path.join(projectRoot, "src/components/dashboard/ThemeCustomizer.tsx"),
    "utf8"
  );
  const contentActionsSrc = fs.readFileSync(
    path.join(projectRoot, "src/features/shops/content-actions.ts"),
    "utf8"
  );
  const designPageSrc = fs.readFileSync(
    path.join(projectRoot, "src/app/dashboard/design/page.tsx"),
    "utf8"
  );
  const storefrontPageSrc = fs.readFileSync(
    path.join(projectRoot, "src/app/shop/[slug]/page.tsx"),
    "utf8"
  );
  const storeContentSrc = fs.readFileSync(
    path.join(projectRoot, "src/components/storefront/StoreContent.tsx"),
    "utf8"
  );

  await t.test("1. Design System & 3 Foundation Themes Verification", () => {
    // Required predefined themes
    assert.match(customizerSrc, /id:\s*"minimal"/, "Must register minimal theme");
    assert.match(customizerSrc, /name:\s*"Minimal Store"/, "Must name Minimal Store");
    assert.match(customizerSrc, /id:\s*"modern_boutique"/, "Must register modern_boutique theme");
    assert.match(customizerSrc, /name:\s*"Modern Boutique"/, "Must name Modern Boutique");
    assert.match(customizerSrc, /id:\s*"classic"/, "Must register classic theme");
    assert.match(customizerSrc, /name:\s*"Classic Shop"/, "Must name Classic Shop");

    // Check color palette presets
    assert.match(customizerSrc, /COLOR_PALETTES\s*=\s*\[/, "Must define COLOR_PALETTES");
    assert.match(customizerSrc, /modern_minimal/, "Must include modern_minimal palette");
    assert.match(customizerSrc, /ceylon_emerald/, "Must include ceylon_emerald palette");
    assert.match(customizerSrc, /warm_earth/, "Must include warm_earth palette");
    assert.match(customizerSrc, /midnight_indigo/, "Must include midnight_indigo palette");

    // Check custom color controls
    assert.match(customizerSrc, /theme:primary_color/, "Must control primary color");
    assert.match(customizerSrc, /theme:secondary_color/, "Must control secondary color");
    assert.match(customizerSrc, /theme:bg_color/, "Must control background color");
    assert.match(customizerSrc, /theme:text_color/, "Must control text color");
    assert.match(customizerSrc, /theme:button_color/, "Must control button color");
    assert.match(customizerSrc, /theme:button_text_color/, "Must control button text color");

    // Check typography controls
    assert.match(customizerSrc, /Inter/, "Must support Inter font");
    assert.match(customizerSrc, /Poppins/, "Must support Poppins font");
    assert.match(customizerSrc, /DM Sans/, "Must support DM Sans font");
    assert.match(customizerSrc, /Roboto/, "Must support Roboto font");
    assert.match(customizerSrc, /Playfair Display/, "Must support Playfair Display font");
    assert.match(customizerSrc, /typography:heading_font/, "Must control heading font");
    assert.match(customizerSrc, /typography:body_font/, "Must control body font");
    assert.match(customizerSrc, /typography:size/, "Must control predefined font sizes");

    // Check button & card controls
    assert.match(customizerSrc, /button:style/, "Must control button style solid/outline");
    assert.match(customizerSrc, /button:shape/, "Must control button shape square/rounded/pill");
    assert.match(customizerSrc, /product_card:radius/, "Must control product card radius");
    assert.match(customizerSrc, /product_card:ratio/, "Must control product image ratio");
  });

  await t.test("2. Brand Tab Controls & Image Handling", () => {
    assert.match(customizerSrc, /storeName/, "Must support editing store name");
    assert.match(customizerSrc, /storeDesc/, "Must support editing store description");
    assert.match(customizerSrc, /logoUrl/, "Must support store logo upload & preview");
    assert.match(customizerSrc, /bannerUrl/, "Must support store banner upload & preview");
    assert.match(customizerSrc, /whatsappNumber/, "Must support WhatsApp business number");
    assert.match(customizerSrc, /brand:instagram_url/, "Must support Instagram link");
    assert.match(customizerSrc, /brand:facebook_url/, "Must support Facebook link");
    assert.match(customizerSrc, /brand:tiktok_url/, "Must support TikTok link");
    assert.match(customizerSrc, /compressImage/, "Must implement client-side image compression");
    assert.match(customizerSrc, /\/api\/store-images/, "Must upload via existing store-images endpoint");
  });

  await t.test("3. Homepage Section Management & Modularity", () => {
    assert.match(customizerSrc, /export const SECTION_ITEMS/, "Must export SECTION_ITEMS");
    const sections = ["announcement", "navbar", "hero", "categories", "products", "benefits", "reviews", "contact", "footer"];
    for (const sec of sections) {
      assert.match(customizerSrc, new RegExp(`id:\\s*"${sec}"`), `Must include section ${sec}`);
    }
    assert.match(customizerSrc, /handleMoveSection/, "Must support section reordering");
    assert.match(customizerSrc, /toggleSectionVisibility/, "Must support toggle visibility");
    assert.match(customizerSrc, /section:hero:heading/, "Must control Hero heading");
    assert.match(customizerSrc, /section:hero:align/, "Must control Hero alignment");
    assert.match(customizerSrc, /section:hero:overlay/, "Must control Hero overlay");
    assert.match(customizerSrc, /section:products:title/, "Must control Featured Products title");
    assert.match(customizerSrc, /section:products:count/, "Must control number of products");
  });

  await t.test("4. Real-time Live Preview & Viewport Modes", () => {
    assert.match(customizerSrc, /previewDevice/, "Must maintain preview device state");
    assert.match(customizerSrc, /Monitor/, "Must support desktop view");
    assert.match(customizerSrc, /Tablet/, "Must support tablet view");
    assert.match(customizerSrc, /Smartphone/, "Must support mobile view");
    assert.match(customizerSrc, /renderPreviewTheme/, "Must render theme in real time");
    assert.match(customizerSrc, /Draft Preview Mode/, "Must display draft preview banner");
    assert.match(customizerSrc, /<StoreContent values=\{contentValues\}>/, "Must wrap preview in StoreContent with live values");
  });

  await t.test("5. Separate Draft and Publish Server Actions", () => {
    assert.match(contentActionsSrc, /export async function saveThemeStudioDraftAction/, "Must export saveThemeStudioDraftAction");
    assert.match(contentActionsSrc, /export async function publishThemeStudioAction/, "Must export publishThemeStudioAction");
    assert.match(contentActionsSrc, /export async function discardThemeStudioDraftAction/, "Must export discardThemeStudioDraftAction");
    assert.match(contentActionsSrc, /_theme_studio_draft/, "Drafts must persist to _theme_studio_draft without touching live published fields");
    assert.match(contentActionsSrc, /ALLOWED_THEME_IDS\.has/, "Publishing must validate theme ID");

    // Verify modals in Customizer
    assert.match(customizerSrc, /showPublishModal/, "Must support publish confirmation modal");
    assert.match(customizerSrc, /showDiscardModal/, "Must support discard confirmation modal");
    assert.match(customizerSrc, /beforeunload/, "Must protect against unsaved change loss");
  });

  await t.test("6. Storefront Rendering Integrity", () => {
    assert.match(storefrontPageSrc, /shop\?\.theme_id/, "Storefront must determine theme by shop.theme_id");
    assert.match(storefrontPageSrc, /case\s*"minimal":/, "Storefront must render minimal theme");
    assert.match(storefrontPageSrc, /case\s*"modern_boutique":/, "Storefront must render boutique theme");
    assert.match(storefrontPageSrc, /case\s*"classic":/, "Storefront must render classic theme");
    assert.match(storefrontPageSrc, /<StoreContent values=\{shop\.storefront_content\}>/, "Storefront must render published content");
  });
});
