"use client";
import { EliteCommerceTheme } from "@/components/storefront/themes/EliteCommerceTheme";
import { useEffect, useState, type ComponentProps, type MouseEvent } from "react";
import Link from "next/link";
import { LayoutTemplate, Type, Image as ImageIcon, PanelTop, Search, MousePointer2, CreditCard, SlidersHorizontal } from "lucide-react";
import { saveStoreContent } from "@/features/shops/content-actions";
import fields from "@/lib/store-content-fields.json";
import { styleAreas, type StyleArea } from "@/lib/store-custom-styles";
import { StoreStyleControls } from "./StoreStyleControls";
import icons from "@/lib/store-icons.json";
import { HeroVisibilityControls } from "./HeroVisibilityControls";
import { StoreIconEditor } from "./StoreIconEditor";
import { StoreContent } from "../storefront/StoreContent";
import { CartProvider } from "../storefront/CartDrawer";
import { StorefrontHeader } from "../storefront/StorefrontHeader";
import { ModernRetailTheme } from "../storefront/themes/ModernRetailTheme";
import { MinimalTheme } from "../storefront/themes/MinimalTheme";
import { BoutiqueTheme } from "../storefront/themes/BoutiqueTheme";
import { ClassicTheme } from "../storefront/themes/ClassicTheme";
import { ShopAppTheme } from "../storefront/themes/ShopAppTheme";
import s from "./StoreContentEditor.module.css";

type Props = Omit<ComponentProps<typeof ModernRetailTheme>, "shop"> & {
  shop: ComponentProps<typeof ModernRetailTheme>["shop"] & {
    theme_id: string;
    storefront_content?: Record<string, string>;
  };
};

export function StoreContentEditor({ shop, categories, products }: Props) {
  const initial = {
    name: shop.name,
    description: shop.description || "",
    logo_url: shop.logo_url || "",
    banner_url: shop.banner_url || "",
    storefront_content: shop.storefront_content || {},
  };
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState("Click text or an image in your store to edit it.");
  const dirty = saved !== JSON.stringify(draft);
  const activeFields = fields
    .filter((f) => f.theme === shop.theme_id || (f.theme === "shared" && shop.theme_id !== "modern_retail"))
    .filter((f, i, list) => list.findIndex((other) => other.key === f.key) === i);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const update = (key: "name" | "description" | "logo_url" | "banner_url", value: string) => {
    setDraft((old) => ({ ...old, [key]: value }));
    setMessage("");
  };

  function selectFromPreview(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (selected?.startsWith("style:")) {
      const part = target.closest("[data-style-part]")?.getAttribute("data-style-part");
      if (part) setSelected(`style:${part}`);
      else setHint("Choose a card, navbar, search bar or button. Switch to Edit text & images for other content.");
      return;
    }
    const icon = target.closest("[data-store-icon]");
    if (icon) {
      setSelected(`icon:${icon.getAttribute("data-store-icon")}`);
      return;
    }
    const img = target.closest("img");
    if (img) {
      const src = img.getAttribute("src");
      if (src === draft.logo_url) {
        setSelected("logo_url");
        return;
      }
      if (
        src === draft.banner_url ||
        img.className.includes("heroImage") ||
        target.closest('[data-editor-image="banner_url"]') ||
        target.closest('[data-editor-slider="true"]')
      ) {
        setSelected("banner_url");
        return;
      }
      const product = products.find((p) => p.images?.some((i) => i.storage_path === src));
      if (product) {
        setSelected(`product:${product.id}`);
        return;
      }
    }
    // Use the actual text under the pointer, including adjacent lines inside a heading.
    const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
    const nodeText =
      range?.startContainer.nodeType === Node.TEXT_NODE && event.currentTarget.contains(range.startContainer)
        ? range.startContainer.textContent?.trim()
        : "";
    const text = nodeText || target.textContent?.trim() || "";
    if (text === draft.name || target.closest("h1")?.textContent?.trim() === draft.name) {
      setSelected("name");
      return;
    }
    if (draft.description && text === draft.description) {
      setSelected("description");
      return;
    }
    const product = products.find((p) => p.name === text || (p.description && p.description === text));
    if (product) {
      setSelected(`product:${product.id}`);
      return;
    }
    const field =
      activeFields.find((f) => (draft.storefront_content[f.key] ?? f.text) === text) ||
      [...activeFields]
        .sort((a, b) => b.text.length - a.text.length)
        .find((f) => {
          const value = draft.storefront_content[f.key] ?? f.text;
          return value.length > 2 && text.includes(value);
        });
    if (field) {
      setSelected(field.key);
      return;
    }
    if (target.closest('[data-editor-image="banner_url"]') || target.closest('[data-editor-slider="true"]')) {
      setSelected("banner_url");
      return;
    }
    setHint(
      "Select a heading, label or image. Use All fields for hidden or empty content; product and category names come from your catalog."
    );
  }

  const styleSelected = selected?.startsWith("style:")
    ? styleAreas.find((area) => `style:${area.id}` === selected)
    : undefined;
  const selectedField = activeFields.find((f) => f.key === selected);
  const iconSelected = selected?.startsWith("icon:") ? selected.slice(5) : null;
  const selectedProduct = products.find((p) => `product:${p.id}` === selected);

  function updateIcon(changes: Record<string, string | undefined>) {
    setDraft((old) => {
      const content = { ...old.storefront_content };
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined) delete content[key];
        else content[key] = value;
      }
      return { ...old, storefront_content: content };
    });
    setMessage("");
  }

  async function upload(
    key: "logo_url" | "banner_url" | `icon-image:${string}` | `slider:slide:${string}` | `slider:slide:${number}`,
    file?: File
  ) {
    if (!file) return;
    setError("");
    setUploading(key as string);
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/store-images", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      if (key === "logo_url") {
        update("logo_url", result.url);
      } else if (key === "banner_url" || key === "slider:slide:1") {
        update("banner_url", result.url);
        setDraft((old) => ({
          ...old,
          banner_url: result.url,
          storefront_content: { ...old.storefront_content, "slider:slide:1": result.url },
        }));
      } else if (typeof key === "string" && key.startsWith("slider:slide:")) {
        setDraft((old) => ({
          ...old,
          storefront_content: { ...old.storefront_content, [key]: result.url },
        }));
      } else {
        updateIcon({ [key]: result.url });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }

  async function save() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await saveStoreContent(draft);
      if (result.error) setError(result.error);
      else {
        setSaved(JSON.stringify(draft));
        setMessage("Published. Your live store is updated.");
      }
    } catch {
      setError("Could not save. Your draft is still here; please try again.");
    } finally {
      setPending(false);
    }
  }

  const Theme =
    shop.theme_id === "elite_commerce"
      ? EliteCommerceTheme
      : shop.theme_id === "shop_app"
      ? ShopAppTheme
      : shop.theme_id === "modern_retail"
      ? ModernRetailTheme
      : shop.theme_id === "modern_boutique"
      ? BoutiqueTheme
      : shop.theme_id === "classic"
      ? ClassicTheme
      : MinimalTheme;

  return (
    <div className={s.editor}>
      <div className={s.heading}>
        <div>
          <Link href="/dashboard/design">← Store design</Link>
          <h1>Make your store yours.</h1>
          <p>Change styles, images and wording, preview your draft, then publish.</p>
        </div>
        <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer">
          View live store ↗
        </a>
      </div>
      <div className={s.bar}>
        <span>{dirty ? "Unpublished changes" : "All changes published"}</span>
        <div>
          <button
            type="button"
            onClick={() => {
              setPreview(!preview);
              if (preview) {
                setSelected(null);
                setHint("Edit your store content using the fields below.");
              }
            }}
          >
            {preview ? "All fields" : "Visual editor"}
          </button>
          <button
            type="button"
            disabled={!dirty || pending || !!uploading}
            onClick={() => {
              setDraft(JSON.parse(saved));
              setError("");
              setMessage("");
            }}
          >
            Discard draft
          </button>
          <button
            type="button"
            className={s.publish}
            disabled={pending || !!uploading || !dirty}
            onClick={save}
          >
            {pending ? "Publishing…" : "Publish changes"}
          </button>
        </div>
      </div>
      {error && <p role="alert" className={s.error}>{error}</p>}
      {message && <p role="status" className={s.success}>{message}</p>}
      <section className={s.workspaceTools} aria-label="Editor tools">
        <div className={s.modeHeading}>
          <div>
            <span className={s.eyebrow}>YOUR STOREFRONT</span>
            <h2>What would you like to edit?</h2>
          </div>
          <div className={s.modeSwitch} role="group" aria-label="Editing mode">
            <button
              type="button"
              aria-pressed={Boolean(styleSelected)}
              onClick={() => {
                setPreview(true);
                setSelected("style:card");
                setHint("Click a component in the preview, or choose one above, to edit its layout and appearance.");
              }}
            >
              <LayoutTemplate size={17} />
              <span>Edit styles</span>
            </button>
            <button
              type="button"
              aria-pressed={!styleSelected}
              onClick={() => {
                setPreview(true);
                setSelected("name");
                setHint("Click text or an image in the preview, or choose a field above.");
              }}
            >
              <Type size={17} />
              <span>Edit text & images</span>
            </button>
          </div>
        </div>
        {styleSelected ? (
          <div className={s.componentChoices} aria-label="Choose component">
            {styleAreas.map((area) => {
              const Icon =
                area.id === "card"
                  ? CreditCard
                  : area.id === "navbar"
                  ? PanelTop
                  : area.id === "search"
                  ? Search
                  : MousePointer2;
              return (
                <button
                  type="button"
                  key={area.id}
                  aria-pressed={selected === `style:${area.id}`}
                  onClick={() => {
                    setPreview(true);
                    setSelected(`style:${area.id}`);
                  }}
                >
                  <span className={s.choiceIcon}>
                    <Icon size={21} />
                  </span>
                  <span>
                    <strong>{area.label}</strong>
                    <small>
                      {area.id === "card"
                        ? "Image placement & layout"
                        : area.id === "navbar"
                        ? "Brand & navigation"
                        : area.id === "search"
                        ? "Search experience"
                        : "Shape & appearance"}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={s.contentTools}>
            <div className={s.contentShortcuts}>
              {[
                { key: "name", label: "Store name", icon: Type },
                { key: "description", label: "Description", icon: Type },
                { key: "banner_url", label: "Hero slider", icon: ImageIcon },
                { key: "logo_url", label: "Logo", icon: ImageIcon },
              ].map((item) => (
                <button
                  type="button"
                  key={item.key}
                  aria-pressed={selected === item.key}
                  onClick={() => {
                    setPreview(true);
                    setSelected(item.key);
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
            <label className={s.iconSelect}>
              <SlidersHorizontal size={16} />
              <span>Icons</span>
              <select
                aria-label="Choose icon to edit"
                value={iconSelected || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setPreview(true);
                    setSelected(`icon:${e.target.value}`);
                  }
                }}
              >
                <option value="">Choose an icon</option>
                {icons.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </section>
      <HeroVisibilityControls values={draft.storefront_content} onChange={updateIcon}/>
      {preview ? (
        <div className={s.visualLayout}>
          <div className={s.preview}>
            <p role="status">{hint}</p>
            <div
              className={s.canvas}
              onClickCapture={selectFromPreview}
              onKeyDownCapture={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setHint("Use All fields to edit every field with your keyboard.");
                }
              }}
              onSubmitCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <StoreContent values={draft.storefront_content}>
                <CartProvider shopSlug={`preview-${shop.slug}`}>
                  {shop.theme_id !== "modern_retail" && shop.theme_id !== "shop_app" && (
                    <StorefrontHeader
                      shopName={draft.name}
                      shopSlug={shop.slug || ""}
                      whatsappNumber={shop.whatsapp_number}
                      logoUrl={draft.logo_url}
                    />
                  )}
                  <Theme shop={{ ...shop, ...draft }} categories={categories} products={products} />
                </CartProvider>
              </StoreContent>
            </div>
          </div>
          <aside className={`${s.card} ${s.inspector}`} aria-label="Selected content editor">
            <div className={s.inspectorHeading}>
              <span className={s.eyebrow}>{styleSelected ? "STYLE SETTINGS" : "CONTENT SETTINGS"}</span>
              <h2>
                {styleSelected
                  ? `${styleSelected.label} style`
                  : iconSelected
                  ? `Change ${iconSelected} icon`
                  : selectedProduct
                  ? "Product content"
                  : selected === "logo_url"
                  ? "Store logo"
                  : selected === "banner_url"
                  ? "Hero image slider"
                  : selected === "name"
                  ? "Store name"
                  : selected === "description"
                  ? "Store description"
                  : selectedField
                  ? "Edit text"
                  : "Click to customise"}
              </h2>
              <p>
                {styleSelected ? "Make it your own, one detail at a time." : "Select a field or click directly on the preview."}
              </p>
            </div>
            {styleSelected && (
              <StoreStyleControls
                areaId={styleSelected.id as StyleArea}
                values={draft.storefront_content}
                onChange={(key, value) => {
                  setDraft((old) => ({
                    ...old,
                    storefront_content: { ...old.storefront_content, [key]: value },
                  }));
                  setMessage("");
                }}
                onReset={() => {
                  setDraft((old) => ({
                    ...old,
                    storefront_content: Object.fromEntries(
                      Object.entries(old.storefront_content).filter(
                        ([key]) => !key.startsWith(`custom:${styleSelected.id}:`) && key !== `style:${styleSelected.id}`
                      )
                    ),
                  }));
                  setMessage("");
                }}
              />
            )}
            {iconSelected && (
              <StoreIconEditor
                name={iconSelected}
                values={draft.storefront_content}
                busy={pending || !!uploading}
                onChange={updateIcon}
                onUpload={(file) => {
                  void upload(`icon-image:${iconSelected}`, file);
                }}
              />
            )}
            {!selected && <p>Select something on the preview to start. You can also choose a field below.</p>}
            {!styleSelected && (
              <label>
                Choose content
                <select
                  aria-label="Choose content to edit"
                  value={selected || ""}
                  onChange={(e) => setSelected(e.target.value || null)}
                >
                  <option value="">Select a field</option>
                  <option value="name">Store name</option>
                  <option value="description">Store description</option>
                  <option value="logo_url">Store logo</option>
                  <option value="banner_url">Hero banner & Image slider</option>
                  {activeFields.map((f) => (
                    <option value={f.key} key={f.key}>
                      {f.text}
                    </option>
                  ))}
                  {products.map((p) => (
                    <option key={p.id} value={`product:${p.id}`}>
                      Product: {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selectedField && (
              <>
                <label>
                  {selectedField.text}
                  <textarea
                    aria-label="Selected text"
                    rows={5}
                    maxLength={2000}
                    value={draft.storefront_content[selectedField.key] ?? selectedField.text}
                    onChange={(e) => {
                      setDraft((old) => ({
                        ...old,
                        storefront_content: { ...old.storefront_content, [selectedField.key]: e.target.value },
                      }));
                      setMessage("");
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((old) => {
                      const next = { ...old.storefront_content };
                      delete next[selectedField.key];
                      return { ...old, storefront_content: next };
                    })
                  }
                >
                  Reset text
                </button>
              </>
            )}
            {(selected === "name" || selected === "description") && (
              <label>
                {selected === "name" ? "Store name" : "Store description"}
                <textarea
                  rows={selected === "name" ? 2 : 5}
                  maxLength={selected === "name" ? 100 : 2000}
                  value={draft[selected]}
                  onChange={(e) => update(selected, e.target.value)}
                />
              </label>
            )}
            {selected === "banner_url" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "12px", color: "#166534" }}>
                  <strong style={{ display: "block", marginBottom: "4px" }}>📐 Recommended Banner Dimensions:</strong>
                  <span><strong>1920 × 750 px</strong> (or <strong>1600 × 600 px</strong>, Aspect Ratio <strong>16:9</strong> or <strong>21:9</strong> landscape).</span>
                  <span style={{ display: "block", marginTop: "2px", color: "#15803d", fontSize: "11px" }}>Upload PNG, JPEG or WebP up to 4 MB per slide. Add up to 6 slides for your auto-advancing Hero slider.</span>
                </div>
                {[1, 2, 3, 4, 5, 6]
                  .filter((n) => n === 1 || draft.storefront_content[`slider:slide:${n}`] !== undefined)
                  .map((n) => {
                    const url =
                      n === 1
                        ? draft.storefront_content["slider:slide:1"] || draft.banner_url || ""
                        : draft.storefront_content[`slider:slide:${n}`] || "";
                    return (
                      <div key={n} className={s.imageField}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "12px" }}>Slide {n} {n === 1 ? "(Primary)" : ""}</strong>
                          {n > 1 && (
                            <button
                              type="button"
                              style={{ fontSize: "11px", padding: "2px 7px", color: "#b91c1c", borderColor: "#fecaca" }}
                              onClick={() => {
                                setDraft((old) => {
                                  const next = { ...old.storefront_content };
                                  delete next[`slider:slide:${n}`];
                                  return { ...old, storefront_content: next };
                                });
                                setMessage("");
                              }}
                            >
                              Remove slide
                            </button>
                          )}
                        </div>
                        <label>
                          Image URL
                          <input
                            value={url}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (n === 1) update("banner_url", val);
                              setDraft((old) => ({
                                ...old,
                                banner_url: n === 1 ? val : old.banner_url,
                                storefront_content: { ...old.storefront_content, [`slider:slide:${n}`]: val },
                              }));
                              setMessage("");
                            }}
                            placeholder="https://…"
                          />
                        </label>
                        {url && <img src={url} alt={`Slide ${n} preview`} />}
                        <label className={s.upload}>
                          {uploading === (n === 1 ? "banner_url" : `slider:slide:${n}`)
                            ? "Uploading…"
                            : "Upload replacement"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={!!uploading || pending}
                            onChange={(e) => {
                              void upload(n === 1 ? "banner_url" : (`slider:slide:${n}` as any), e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {n === 1 && (
                          <button
                            type="button"
                            disabled={!url || !!uploading}
                            onClick={() => {
                              update("banner_url", "");
                              setDraft((old) => {
                                const next = { ...old.storefront_content };
                                delete next["slider:slide:1"];
                                return { ...old, banner_url: "", storefront_content: next };
                              });
                              setMessage("");
                            }}
                          >
                            Clear image
                          </button>
                        )}
                      </div>
                    );
                  })}
                {[1, 2, 3, 4, 5, 6].filter((n) => n === 1 || draft.storefront_content[`slider:slide:${n}`] !== undefined)
                  .length < 6 && (
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      borderStyle: "dashed",
                      fontWeight: 600,
                      padding: "10px",
                    }}
                    onClick={() => {
                      const nextN = [2, 3, 4, 5, 6].find(
                        (n) => draft.storefront_content[`slider:slide:${n}`] === undefined
                      );
                      if (nextN) {
                        setDraft((old) => ({
                          ...old,
                          storefront_content: { ...old.storefront_content, [`slider:slide:${nextN}`]: "" },
                        }));
                        setMessage("");
                      }
                    }}
                  >
                    + Add another slide
                  </button>
                )}
              </div>
            )}
            {selected === "logo_url" && (
              <div className={s.imageField}>
                <label>
                  Image URL
                  <input
                    value={draft.logo_url}
                    onChange={(e) => update("logo_url", e.target.value)}
                    placeholder="https://…"
                  />
                </label>
                {draft.logo_url && <img src={draft.logo_url} alt="Selected image preview" />}
                <label className={s.upload}>
                  {uploading === "logo_url" ? "Uploading…" : "Upload replacement"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!!uploading || pending}
                    onChange={(e) => {
                      void upload("logo_url", e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p>PNG, JPEG or WebP, up to 4 MB. Publish when you are happy with the preview.</p>
                <button
                  type="button"
                  disabled={!draft.logo_url || !!uploading}
                  onClick={() => update("logo_url", "")}
                >
                  Remove image
                </button>
              </div>
            )}
            {selectedProduct && (
              <>
                <p>{selectedProduct.name}</p>
                <p>
                  Product images and descriptions are shared across the catalog.{" "}
                  {dirty
                    ? "Publish or discard your store draft before opening the product editor."
                    : "Open the product editor to change this item."}
                </p>
                {!dirty && (
                  <Link href={`/dashboard/products/${selectedProduct.id}/edit`}>Edit this product →</Link>
                )}
              </>
            )}
          </aside>
        </div>
      ) : (
        <div className={s.columns}>
          <div>
            <section className={s.card}>
              <h2>Store identity</h2>
              <label>
                Store name
                <input maxLength={100} value={draft.name} onChange={(e) => update("name", e.target.value)} />
              </label>
              <label>
                Store description
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </label>
            </section>
            <section className={s.card}>
              <h2>Store images & Hero slider</h2>
              <p>
                Upload PNG, JPEG or WebP up to 4 MB, or paste an HTTPS image URL. Uploading adds it to your draft;
                publish to make it live.
              </p>
              <div style={{ padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "12px", color: "#166534", marginBottom: "14px" }}>
                <strong>📐 Recommended Hero Slider Size: 1920 × 750 px</strong> (or 1600 × 600 px, 16:9 / 21:9 landscape). Center important visual elements for best display across mobile and desktop screens.
              </div>
              <div className={s.imageField}>
                <label>
                  Store logo
                  <input
                    value={draft.logo_url}
                    placeholder="https://…"
                    onChange={(e) => update("logo_url", e.target.value)}
                  />
                </label>
                {draft.logo_url && <img src={draft.logo_url} alt="Logo preview" />}
                <label className={s.upload}>
                  {uploading === "logo_url" ? "Uploading…" : "Choose image"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!!uploading || pending}
                    onChange={(e) => {
                      void upload("logo_url", e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button type="button" onClick={() => update("logo_url", "")} disabled={!draft.logo_url}>
                  Remove logo
                </button>
              </div>
              {[1, 2, 3, 4, 5, 6]
                .filter((n) => n === 1 || draft.storefront_content[`slider:slide:${n}`] !== undefined)
                .map((n) => {
                  const url =
                    n === 1
                      ? draft.storefront_content["slider:slide:1"] || draft.banner_url || ""
                      : draft.storefront_content[`slider:slide:${n}`] || "";
                  return (
                    <div key={n} className={s.imageField}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label>
                          Hero slider: Slide {n} {n === 1 ? "(Primary)" : ""}
                        </label>
                        {n > 1 && (
                          <button
                            type="button"
                            style={{ fontSize: "10px", padding: "2px 6px", color: "#b91c1c" }}
                            onClick={() =>
                              setDraft((old) => {
                                const next = { ...old.storefront_content };
                                delete next[`slider:slide:${n}`];
                                return { ...old, storefront_content: next };
                              })
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        value={url}
                        placeholder="https://…"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (n === 1) update("banner_url", val);
                          setDraft((old) => ({
                            ...old,
                            banner_url: n === 1 ? val : old.banner_url,
                            storefront_content: { ...old.storefront_content, [`slider:slide:${n}`]: val },
                          }));
                        }}
                      />
                      {url && <img src={url} alt={`Slide ${n} preview`} />}
                      <label className={s.upload}>
                        {uploading === (n === 1 ? "banner_url" : `slider:slide:${n}`)
                          ? "Uploading…"
                          : "Choose image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          disabled={!!uploading || pending}
                          onChange={(e) => {
                            void upload(n === 1 ? "banner_url" : (`slider:slide:${n}` as any), e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              {[1, 2, 3, 4, 5, 6].filter(
                (n) => n === 1 || draft.storefront_content[`slider:slide:${n}`] !== undefined
              ).length < 6 && (
                <button
                  type="button"
                  style={{ marginTop: "12px", width: "100%", borderStyle: "dashed" }}
                  onClick={() => {
                    const nextN = [2, 3, 4, 5, 6].find(
                      (n) => draft.storefront_content[`slider:slide:${n}`] === undefined
                    );
                    if (nextN)
                      setDraft((old) => ({
                        ...old,
                        storefront_content: { ...old.storefront_content, [`slider:slide:${nextN}`]: "" },
                      }));
                  }}
                >
                  + Add another slider slide
                </button>
              )}
            </section>
            <section className={s.card}>
              <h2>Products & categories</h2>
              <p>Product names, prices and pictures come from your catalog. Category labels come from your categories.</p>
              <Link href="/dashboard/products">Manage products →</Link>
              <br />
              <Link href="/dashboard/categories">Manage categories →</Link>
            </section>
          </div>
          <section className={s.card}>
            <h2>Theme wording</h2>
            <p>
              These are the text fields used by your selected theme. Reset restores the original wording. Your edits stay
              saved when you change themes.
            </p>
            <label>
              Find text
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, buttons or footer text…"
              />
            </label>
            <div className={s.textList}>
              {activeFields
                .filter((f) => `${f.text} ${draft.storefront_content[f.key] || ""}`.toLowerCase().includes(query.toLowerCase()))
                .map((f) => (
                  <div key={f.key} className={s.textField}>
                    <label>
                      {f.text}
                      <textarea
                        rows={f.text.length > 80 ? 3 : 2}
                        maxLength={2000}
                        value={draft.storefront_content[f.key] ?? f.text}
                        onChange={(e) => {
                          setDraft((old) => ({
                            ...old,
                            storefront_content: { ...old.storefront_content, [f.key]: e.target.value },
                          }));
                          setMessage("");
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={draft.storefront_content[f.key] === undefined}
                      onClick={() =>
                        setDraft((old) => {
                          const next = { ...old.storefront_content };
                          delete next[f.key];
                          return { ...old, storefront_content: next };
                        })
                      }
                    >
                      Reset text
                    </button>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
