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
  const buttonBg = content["custom:buttons:background"];
  const buttonColor = content["custom:buttons:color"];
  const buttonRadius = content["custom:buttons:radius"];
  const cardBg = content["custom:card:background"];
  const cardBorder = content["custom:card:borderColor"];
  const cardRadius = content["custom:card:radius"];
  const navbarBg = content["custom:navbar:background"];
  const navbarColor = content["custom:navbar:color"];
  const fontChoice = content["style:font"];

  const themeVars: React.CSSProperties & Record<string, string> = {};
  if (buttonBg) themeVars["--theme-btn-bg"] = buttonBg;
  if (buttonColor) themeVars["--theme-btn-color"] = buttonColor;
  if (buttonRadius) themeVars["--theme-btn-radius"] = `${buttonRadius}px`;
  if (cardBg) themeVars["--theme-card-bg"] = cardBg;
  if (cardBorder) themeVars["--theme-card-border"] = cardBorder;
  if (cardRadius) themeVars["--theme-card-radius"] = `${cardRadius}px`;
  if (navbarBg) themeVars["--theme-nav-bg"] = navbarBg;
  if (navbarColor) themeVars["--theme-nav-color"] = navbarColor;

  const fontClass =
    fontChoice === "serif"
      ? "font-serif"
      : fontChoice === "rounded"
      ? "font-sans font-medium"
      : "";

  return (
    <Content.Provider value={content}>
      <div className={`storefront-theme-container ${fontClass}`} style={themeVars}>
        {children}
      </div>
    </Content.Provider>
  );
}

export function useStoreText() {
  const values = useContext(Content);
  return (key: string, fallback?: string) => values[key] ?? (fallback ?? "");
}
