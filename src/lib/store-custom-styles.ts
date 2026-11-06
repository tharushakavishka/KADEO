import type { CSSProperties } from "react";

export const styleAreas = [
  { id: "card", label: "Product cards", background: "#ffffff", color: "#183b35", opacity: 62, radius: 23, padding: 9, blur: 0 },
  { id: "navbar", label: "Navbar", background: "#f6faf7", color: "#183b35", opacity: 90, radius: 0, padding: 0, blur: 24 },
  { id: "search", label: "Search bar", background: "#ffffff", color: "#183b35", opacity: 52, radius: 30, padding: 5, blur: 0 },
  { id: "buttons", label: "Buttons", background: "#174c42", color: "#ffffff", opacity: 100, radius: 25, padding: 10, blur: 0 },
] as const;
export type StyleArea = typeof styleAreas[number]["id"];
export const customControls = [
  { id: "background", label: "Background colour", type: "color" },
  { id: "color", label: "Text colour", type: "color" },
  { id: "borderColor", label: "Border colour", type: "color" },
  { id: "opacity", label: "Background opacity", type: "range", min: 0, max: 100, unit: "%" },
  { id: "radius", label: "Corner radius", type: "range", min: 0, max: 50, unit: "px" },
  { id: "borderWidth", label: "Border width", type: "range", min: 0, max: 6, unit: "px" },
  { id: "padding", label: "Inner spacing", type: "range", min: 0, max: 32, unit: "px" },
  { id: "blur", label: "Glass blur", type: "range", min: 0, max: 40, unit: "px" },
  { id: "shadow", label: "Shadow strength", type: "range", min: 0, max: 40, unit: "%" },
] as const;
export const customStyleKeys = new Set(styleAreas.flatMap(area => customControls.map(control => `custom:${area.id}:${control.id}`)));
export function validCustomStyle(key: string, value: string) {
  if (!customStyleKeys.has(key)) return false;
  const control = customControls.find(item => item.id === key.split(":")[2])!;
  return control.type === "color" ? /^#[0-9a-f]{6}$/i.test(value) : /^\d{1,3}$/.test(value) && Number(value) >= control.min && Number(value) <= control.max;
}
export function customStyle(t: (key: string, fallback: string) => string, id: StyleArea): CSSProperties {
  const area = styleAreas.find(area => area.id === id)!;
  const read = (name: string) => { const key = `custom:${id}:${name}`; const value = t(key, ""); return validCustomStyle(key, value) ? value : undefined; };
  const style: CSSProperties & Record<string, string | number | undefined> = {};
  const background = read("background"), opacity = read("opacity");
  if (background !== undefined || opacity !== undefined) {
    const hex = background || area.background;
    style.background = `rgba(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}, ${Number(opacity ?? area.opacity) / 100})`;
  }
  const color = read("color");
  if (color) { style.color = color; style["--custom-text"] = color; }
  for (const [key, property] of [["radius", "borderRadius"], ["padding", "padding"], ["borderWidth", "borderWidth"]] as const) {
    const value = read(key); if (value !== undefined) style[property] = `${value}px`;
  }
  if (read("borderColor")) style.borderColor = read("borderColor");
  if (read("borderWidth") !== undefined || read("borderColor")) style.borderStyle = "solid";
  const blur = read("blur");
  if (blur !== undefined) style.backdropFilter = style.WebkitBackdropFilter = `blur(${blur}px)`;
  const shadow = read("shadow");
  if (shadow !== undefined) style.boxShadow = Number(shadow) === 0 ? "none" : `0 8px 24px rgba(15, 35, 28, ${Number(shadow)/100})`;
  return style;
}
