"use client";
import React, { createContext, useContext } from "react";

const Content = createContext<Record<string, string>>({});

export function StoreContent({
  values,
  children,
}: {
  values?: Record<string, string>;
  children: React.ReactNode;
}) {
  const content = values || {};
  const buttonBg = content["custom:buttons:background"] || content["color:primary"] || content["element:hero_cta:bg"];
  const buttonColor = content["custom:buttons:color"] || content["color:button_text"] || content["element:hero_cta:color"];
  const buttonRadius = content["custom:buttons:radius"] || content["shape:btn_radius"];
  const cardBg = content["custom:card:background"] || content["color:surface"];
  const cardBorder = content["custom:card:borderColor"] || content["color:border"];
  const cardRadius = content["custom:card:radius"] || content["shape:card_radius"];
  const navbarBg = content["custom:navbar:background"] || content["color:primary"];
  const navbarColor = content["custom:navbar:color"] || content["color:surface"];
  const fontChoice = content["typography:family"] || content["style:font"];
  const lineHeightChoice = content["typography:line_height"] || "normal";

  const themeVars: React.CSSProperties & Record<string, string> = {};
  if (buttonBg) themeVars["--theme-btn-bg"] = buttonBg;
  if (buttonColor) themeVars["--theme-btn-color"] = buttonColor;
  if (buttonRadius) {
    themeVars["--theme-btn-radius"] = buttonRadius === "99" ? "9999px" : `${buttonRadius}px`;
  }
  if (cardBg) themeVars["--theme-card-bg"] = cardBg;
  if (cardBorder) themeVars["--theme-card-border"] = cardBorder;
  if (cardRadius) themeVars["--theme-card-radius"] = `${cardRadius}px`;
  if (navbarBg) themeVars["--theme-nav-bg"] = navbarBg;
  if (navbarColor) themeVars["--theme-nav-color"] = navbarColor;

  if (content["element:hero_cta:width"] && content["element:hero_cta:width"] !== "auto") {
    themeVars["--theme-btn-width"] = `${content["element:hero_cta:width"]}px`;
  }
  if (content["element:hero_cta:height"] && content["element:hero_cta:height"] !== "auto") {
    themeVars["--theme-btn-height"] = `${content["element:hero_cta:height"]}px`;
  }
  if (content["element:hero_cta:font_size"]) {
    themeVars["--theme-btn-font-size"] = `${content["element:hero_cta:font_size"]}px`;
  }
  if (content["element:hero_cta:gap"]) {
    themeVars["--theme-btn-gap"] = `${content["element:hero_cta:gap"]}px`;
  }

  // Hero Title Real-time Visual Overrides
  if (content["element:hero_title:font_size"]) {
    themeVars["--theme-hero-title-size"] = `${content["element:hero_title:font_size"]}px`;
  }
  if (content["element:hero_title:color"]) {
    themeVars["--theme-hero-title-color"] = content["element:hero_title:color"];
  }
  if (content["element:hero_title:font_family"]) {
    const f = content["element:hero_title:font_family"];
    if (f === "sinhala_sans") themeVars["--theme-hero-title-font"] = "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif";
    else if (f === "sinhala_display") themeVars["--theme-hero-title-font"] = "'Gemunu Libre', var(--font-geist-sans), sans-serif";
    else if (f === "sinhala_traditional") themeVars["--theme-hero-title-font"] = "'Iskoola Pota', 'Noto Sans Sinhala', serif";
    else if (f === "serif") themeVars["--theme-hero-title-font"] = "Playfair Display, Georgia, serif";
    else if (f === "mono") themeVars["--theme-hero-title-font"] = "monospace";
    else if (f === "rounded") themeVars["--theme-hero-title-font"] = "Outfit, sans-serif";
    else themeVars["--theme-hero-title-font"] = "inherit";
  }
  if (content["element:hero_title:align"]) {
    themeVars["--theme-hero-title-align"] = content["element:hero_title:align"];
  }

  // Hero Subtitle Real-time Visual Overrides
  if (content["element:hero_desc:font_size"]) {
    themeVars["--theme-hero-desc-size"] = `${content["element:hero_desc:font_size"]}px`;
  }
  if (content["element:hero_desc:color"]) {
    themeVars["--theme-hero-desc-color"] = content["element:hero_desc:color"];
  }
  if (content["element:hero_desc:font_family"]) {
    const f = content["element:hero_desc:font_family"];
    if (f === "sinhala_sans") themeVars["--theme-hero-desc-font"] = "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif";
    else if (f === "sinhala_display") themeVars["--theme-hero-desc-font"] = "'Gemunu Libre', var(--font-geist-sans), sans-serif";
    else if (f === "sinhala_traditional") themeVars["--theme-hero-desc-font"] = "'Iskoola Pota', 'Noto Sans Sinhala', serif";
    else if (f === "serif") themeVars["--theme-hero-desc-font"] = "Playfair Display, Georgia, serif";
    else if (f === "mono") themeVars["--theme-hero-desc-font"] = "monospace";
    else if (f === "rounded") themeVars["--theme-hero-desc-font"] = "Outfit, sans-serif";
    else themeVars["--theme-hero-desc-font"] = "inherit";
  }
  if (content["element:hero_desc:align"]) {
    themeVars["--theme-hero-desc-align"] = content["element:hero_desc:align"];
  }

  // Hero Eyebrow Real-time Visual Overrides
  if (content["element:hero_eyebrow:font_size"]) {
    themeVars["--theme-hero-eyebrow-size"] = `${content["element:hero_eyebrow:font_size"]}px`;
  }
  if (content["element:hero_eyebrow:color"]) {
    themeVars["--theme-hero-eyebrow-color"] = content["element:hero_eyebrow:color"];
  }
  if (content["element:hero_eyebrow:font_family"]) {
    const f = content["element:hero_eyebrow:font_family"];
    if (f === "sinhala_sans") themeVars["--theme-hero-eyebrow-font"] = "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif";
    else if (f === "sinhala_display") themeVars["--theme-hero-eyebrow-font"] = "'Gemunu Libre', var(--font-geist-sans), sans-serif";
    else if (f === "sinhala_traditional") themeVars["--theme-hero-eyebrow-font"] = "'Iskoola Pota', 'Noto Sans Sinhala', serif";
    else if (f === "serif") themeVars["--theme-hero-eyebrow-font"] = "Playfair Display, Georgia, serif";
    else if (f === "mono") themeVars["--theme-hero-eyebrow-font"] = "monospace";
    else if (f === "rounded") themeVars["--theme-hero-eyebrow-font"] = "Outfit, sans-serif";
    else themeVars["--theme-hero-eyebrow-font"] = "inherit";
  }

  // Line Height support (Ideal for Sinhala characters and accents / පිල්ලම්)
  const lineHeightVal =
    lineHeightChoice === "relaxed"
      ? "1.65"
      : lineHeightChoice === "loose"
      ? "1.85"
      : lineHeightChoice === "tight"
      ? "1.25"
      : "1.5";
  themeVars["--theme-line-height"] = lineHeightVal;
  themeVars["lineHeight"] = lineHeightVal;

  let fontClass = "";
  if (fontChoice === "sinhala_sans") {
    themeVars["fontFamily"] = "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif";
  } else if (fontChoice === "sinhala_display") {
    themeVars["fontFamily"] = "'Gemunu Libre', var(--font-geist-sans), sans-serif";
  } else if (fontChoice === "sinhala_traditional") {
    themeVars["fontFamily"] = "'Iskoola Pota', 'Noto Sans Sinhala', serif";
  } else if (fontChoice === "serif") {
    fontClass = "font-serif";
  } else if (fontChoice === "rounded") {
    fontClass = "font-sans font-medium";
  } else if (fontChoice === "mono") {
    fontClass = "font-mono";
  }

  const productCols = content["products:columns"] || "4";
  const cardElevation = content["products:card_elevation"] || "border";

  return (
    <Content.Provider value={content}>
      <div
        className={`kadeo-store-content storefront-theme-container ${fontClass}`}
        data-grid-cols={productCols}
        data-card-elevation={cardElevation}
        style={themeVars}
      >
        {children}
      </div>
    </Content.Provider>
  );
}

export function useStoreContent() {
  return useContext(Content);
}

export function useStoreText() {
  const values = useContext(Content);
  return (key: string, fallback?: string) => {
    // 1. Direct explicit key lookup
    if (values[key] !== undefined && values[key] !== "") {
      return values[key];
    }

    // 2. Semantic element overrides for visual builder & theme customizer
    if (
      (key === "cb0301452f41" ||
        key === "hero:cta" ||
        key === "hero:button" ||
        key === "da0bf4f5c15f" ||
        key === "slider:button" ||
        key === "section:hero:button_text" ||
        key === "elite:hero:btn_text") &&
      values["element:hero_cta:text"]
    ) {
      return values["element:hero_cta:text"];
    }
    if (
      (key === "2e3e53c92e34" ||
        key === "hero:title" ||
        key === "slider:title" ||
        key === "hero:heading" ||
        key === "section:hero:heading" ||
        key === "elite:hero:title") &&
      values["element:hero_title:text"]
    ) {
      return values["element:hero_title:text"];
    }
    if (key === "b3ce3aa49140" && values["element:hero_title:text"]) {
      return "";
    }
    if (
      (key === "bc8b2eacb376" ||
        key === "0debef41f459" ||
        key === "fec5c948265e" ||
        key === "hero:eyebrow" ||
        key === "slider:eyebrow" ||
        key === "hero:tagline" ||
        key === "section:hero:badge" ||
        key === "elite:hero:tag") &&
      values["element:hero_eyebrow:text"]
    ) {
      return values["element:hero_eyebrow:text"];
    }
    if (
      (key === "5779ac00b259" ||
        key === "hero:description" ||
        key === "slider:sub" ||
        key === "hero:desc" ||
        key === "section:hero:subheading" ||
        key === "elite:hero:desc") &&
      values["element:hero_desc:text"]
    ) {
      return values["element:hero_desc:text"];
    }
    if (key === "38db6f3b9053" && values["element:hero_desc:text"]) {
      return "";
    }
    if (
      (key === "4ea9da43bdb2" || key === "announcement:text" || key === "elite:topbar:announcement") &&
      values["element:announcement:text"]
    ) {
      return values["element:announcement:text"];
    }
    if (
      (key === "51e971d97b28" || key === "hero:secondary" || key === "hero:chat_cta") &&
      values["element:hero_sec:text"]
    ) {
      return values["element:hero_sec:text"];
    }
    if (
      (key === "element:hero:image" || key === "hero:image_url" || key === "image:hero") &&
      (values["element:hero:image"] || values["hero:image_url"] || values["image:hero"])
    ) {
      return values["element:hero:image"] || values["hero:image_url"] || values["image:hero"];
    }
    return fallback ?? "";
  };
}
