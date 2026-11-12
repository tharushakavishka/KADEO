"use client";
import { customStyle } from "@/lib/store-custom-styles";
import { StoreIcon } from "../StoreIcon";

import { useStoreText } from "../StoreContent";

import { useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Heart, LayoutGrid, MessageCircle, Package, Search, ShoppingBag, SlidersHorizontal, Truck, X } from "lucide-react";
import { useCart } from "../CartDrawer";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { buildWhatsAppUrl, normalizePhoneNumber } from "@/lib/phone";
import { StorePoliciesModal } from "../StorePoliciesModal";
import styles from "./ModernRetailTheme.module.css";

interface ProductItem {
  id: string; name: string; slug: string; description: string | null;
  price: number; compare_at_price: number | null; stock_quantity: number;
  images?: { storage_path: string }[]; category?: { name: string } | null;
}
interface ThemeProps {
  shop: { name: string; description: string | null; banner_url: string | null; whatsapp_number: string; address: string | null; slug?: string; logo_url?: string | null };
  categories: { id: string; name: string; slug: string }[];
  products: ProductItem[];
}
const editorialImage = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85";

export function ModernRetailTheme({ shop, categories, products }: ThemeProps) {
  const t = useStoreText();
  const cardStyle = customStyle(t, "card"), navbarStyle = customStyle(t, "navbar"), searchStyle = customStyle(t, "search"), buttonStyle = customStyle(t, "buttons");

  const heroTitleStyle: React.CSSProperties = {
    fontSize: t("element:hero_title:font_size") ? `${t("element:hero_title:font_size")}px` : undefined,
    color: t("element:hero_title:color") || undefined,
    fontFamily: t("element:hero_title:font_family") === "sinhala_sans" ? "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif"
      : t("element:hero_title:font_family") === "sinhala_display" ? "'Gemunu Libre', var(--font-geist-sans), sans-serif"
      : t("element:hero_title:font_family") === "sinhala_traditional" ? "'Iskoola Pota', 'Noto Sans Sinhala', serif"
      : t("element:hero_title:font_family") === "serif" ? "Playfair Display, Georgia, serif"
      : t("element:hero_title:font_family") === "mono" ? "monospace"
      : t("element:hero_title:font_family") === "rounded" ? "Outfit, sans-serif"
      : undefined,
    textAlign: (t("element:hero_title:align") || t("element:hero_cta:align", "left")) as any,
  };

  const heroDescStyle: React.CSSProperties = {
    fontSize: t("element:hero_desc:font_size") ? `${t("element:hero_desc:font_size")}px` : undefined,
    color: t("element:hero_desc:color") || undefined,
    fontFamily: t("element:hero_desc:font_family") === "sinhala_sans" ? "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif"
      : t("element:hero_desc:font_family") === "sinhala_display" ? "'Gemunu Libre', var(--font-geist-sans), sans-serif"
      : t("element:hero_desc:font_family") === "sinhala_traditional" ? "'Iskoola Pota', 'Noto Sans Sinhala', serif"
      : t("element:hero_desc:font_family") === "serif" ? "Playfair Display, Georgia, serif"
      : t("element:hero_desc:font_family") === "mono" ? "monospace"
      : t("element:hero_desc:font_family") === "rounded" ? "Outfit, sans-serif"
      : undefined,
    textAlign: (t("element:hero_desc:align") || t("element:hero_cta:align", "left")) as any,
  };

  const heroEyebrowStyle: React.CSSProperties = {
    fontSize: t("element:hero_eyebrow:font_size") ? `${t("element:hero_eyebrow:font_size")}px` : undefined,
    color: t("element:hero_eyebrow:color") || undefined,
    fontFamily: t("element:hero_eyebrow:font_family") === "sinhala_sans" ? "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif"
      : t("element:hero_eyebrow:font_family") === "sinhala_display" ? "'Gemunu Libre', var(--font-geist-sans), sans-serif"
      : t("element:hero_eyebrow:font_family") === "sinhala_traditional" ? "'Iskoola Pota', 'Noto Sans Sinhala', serif"
      : t("element:hero_eyebrow:font_family") === "serif" ? "Playfair Display, Georgia, serif"
      : t("element:hero_eyebrow:font_family") === "mono" ? "monospace"
      : t("element:hero_eyebrow:font_family") === "rounded" ? "Outfit, sans-serif"
      : undefined,
  };

  const { addItem, setIsOpen, totalCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const searchId = useId();
  const searchLayout = t("layout:search", "inline");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [inStock, setInStock] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState<ProductItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const wa = buildWhatsAppUrl(shop.whatsapp_number);
  const categoryNames = [...new Set([...categories.map(c => c.name), ...products.flatMap(p => p.category?.name ? [p.category.name] : [])])];
  const filtered = useMemo(() => products.filter(p =>
    (category === "all" || p.category?.name === category) &&
    (!inStock || p.stock_quantity > 0) && (!savedOnly || wishlist.includes(p.id)) &&
    `${p.name} ${p.description || ""}`.toLowerCase().includes(search.trim().toLowerCase())
  ).sort((a, b) => sort === "price-low" ? Number(a.price) - Number(b.price) : sort === "price-high" ? Number(b.price) - Number(a.price) : sort === "name" ? a.name.localeCompare(b.name) : 0), [products, category, inStock, savedOnly, wishlist, search, sort]);
  function browse(name = "all") {
    setCategory(name); setSavedOnly(false);
    document.getElementById("retail-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function reset() { setSearch(""); setCategory("all"); setInStock(false); setSavedOnly(false); setSort("featured"); }
  function save(id: string) { setWishlist(old => old.includes(id) ? old.filter(v => v !== id) : [...old, id]); }
  function add(p: ProductItem) {
    if (p.stock_quantity <= 0) return;
    addItem({ id: p.id, name: p.name, price: Number(p.price), imageUrl: p.images?.[0]?.storage_path, maxStock: p.stock_quantity });
  }
  function photo(p: ProductItem) {
    const url = p.images?.[0]?.storage_path;
    return url && !brokenImages.includes(p.id) ? <img src={url} alt={p.name} loading="lazy" ref={node => { if (node?.complete && node.naturalWidth === 0) setBrokenImages(old => old.includes(p.id) ? old : [...old, p.id]); }} onError={() => setBrokenImages(old => [...old, p.id])} /> : <span className={styles.placeholder}><StoreIcon name="Package" size={32} strokeWidth={1.4} /></span>;
  }
  const isSectionVisible = (id: string) => t(`visibility:section:${id}`, "shown") !== "hidden";
  const heroVisible = (part: string) => t(`visibility:hero:${part}`, "shown") !== "hidden";
  const heroContentVisible = heroVisible("content") && ["eyebrow","title","description","button","trust"].some(heroVisible);
  const active = search || category !== "all" || inStock || savedOnly;
  return <div className={styles.retail} data-card-layout={t("layout:card", "stacked")} data-navbar-layout={t("layout:navbar", "left")} data-search-layout={searchLayout} data-card-style={t("style:card", "glass")} data-navbar-style={t("style:navbar", "glass")} data-search-style={t("style:search", "glass")} data-button-style={t("style:buttons", "glass")}>
    <a href="#retail-products" className={styles.skip}>{t("d39d5654302e", "Skip to products")}</a>
    {isSectionVisible("announcement") && (
      <div className={styles.announcement} data-studio-element="announcement" data-studio-section="announcement">
        <span><StoreIcon name="Truck" size={13} />{t("4ea9da43bdb2", "Everyday finds, delivered to your door")}</span>
        <span>{t("9eb4eeda8249", "Locally owned. Thoughtfully selected.")}</span>
        <a href={wa} target="_blank" rel="noreferrer">{t("6fc1d0ccb663", "Questions? Chat with us")}<StoreIcon name="ArrowRight" size={13} /></a>
      </div>
    )}
    {isSectionVisible("navbar") && (
      <header className={styles.header} data-studio-element="branding" data-studio-section="navbar" data-style-part="navbar" data-custom-text={Boolean(navbarStyle.color)} style={navbarStyle}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href={`/shop/${shop.slug || ""}`} aria-label={`${shop.name} home`}>
            {shop.logo_url ? <img src={shop.logo_url} alt="" /> : <StoreIcon name="ShoppingBag" size={32} strokeWidth={1.3} />}
            <span><strong>{shop.name}</strong><small>{t("4e4d32a10220", "GOOD FINDS. EVERY DAY.")}</small></span>
          </a>
          {searchLayout === "expand" && <button type="button" ref={searchToggle} className={styles.searchToggle} data-style-part="search" aria-label={searchOpen ? "Close product search" : "Open product search"} aria-expanded={searchOpen} aria-controls={searchId} onClick={()=>{setSearchOpen(!searchOpen); if (!searchOpen) requestAnimationFrame(()=>searchInput.current?.focus());}}><StoreIcon name="Search" size={20}/><span>Search</span></button>}
          <form id={searchId} hidden={searchLayout === "expand" && !searchOpen} onKeyDown={e=>{if(e.key === "Escape" && searchLayout === "expand"){setSearchOpen(false);searchToggle.current?.focus();}}} className={styles.search} data-style-part="search" data-custom-text={Boolean(searchStyle.color)} style={searchStyle} onSubmit={e => { e.preventDefault(); browse(category); }} role="search">
            <input ref={searchInput} aria-label="Search products" placeholder="Find your next everyday favourite…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><StoreIcon name="X" size={16} /></button>}
            <button aria-label="Search"><StoreIcon name="Search" size={17} /></button>
          </form>
          <div className={styles.actions}>
            <button aria-label={`Saved items, ${wishlist.length}`} aria-pressed={savedOnly} onClick={() => { setSavedOnly(!savedOnly); document.getElementById("retail-products")?.scrollIntoView({ behavior: "smooth" }); }}><StoreIcon name="Heart" size={21} /><span>{t("c0ae8f6ea841", "Saved")}{wishlist.length > 0 && `(${wishlist.length})`}</span></button>
            <button aria-label={`Open shopping bag, ${totalCount} items`} onClick={() => setIsOpen(true)}><span className={styles.bagIcon}><StoreIcon name="ShoppingBag" size={21} /><b>{totalCount}</b></span><span>{t("694fd79e26d5", "My bag")}</span></button>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Store categories"><button className={styles.allCategories} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} onClick={() => browse()}><StoreIcon name="LayoutGrid" size={15} />{t("060be00f4f26", "All categories")}</button><button onClick={reset}>{t("70f8bb9a8a53", "Home")}</button>{categoryNames.map(name => <button key={name} aria-pressed={category === name} onClick={() => browse(name)}>{name}</button>)}<a href={`${wa}?text=${encodeURIComponent("Hello, I would like an update on my order.")}`} target="_blank" rel="noreferrer" className={styles.track}>{t("51e971d97b28", "Track order")}<StoreIcon name="ArrowRight" size={13} /></a></nav>
      </header>
    )}
    <main className={styles.main}>
      {isSectionVisible("hero") && (
        <section data-editor-image="banner_url" data-studio-element="hero_image" data-studio-section="hero" className={styles.hero} data-content-visible={heroContentVisible && heroVisible("title")} aria-labelledby={heroContentVisible && heroVisible("title") ? "retail-hero-title" : undefined} aria-label={heroContentVisible && heroVisible("title") ? undefined : "Featured collection"}>
          {(() => {
            const heroSlide1 = t("slider:slide:1", t("element:hero:image", t("hero:image_url", shop.banner_url || editorialImage)));
            const heroSlide2 = t("slider:slide:2", "");
            const heroSlide3 = t("slider:slide:3", "");
            const heroSlide4 = t("slider:slide:4", "");
            const heroSlide5 = t("slider:slide:5", "");
            const heroSlide6 = t("slider:slide:6", "");
            const heroSlides = [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5, heroSlide6].filter(Boolean);
            if (heroSlides.length > 1) {
              return (
                <>
                  {heroSlides.map((slideUrl, idx) => (
                    <img
                      key={idx}
                      className={`${styles.heroImage} absolute inset-0 transition-opacity duration-700 ${idx === (currentHeroSlide % heroSlides.length) ? "opacity-100 z-0" : "opacity-0 -z-10"}`}
                      src={slideUrl}
                      alt={`Hero slide ${idx + 1}`}
                      fetchPriority={idx === 0 ? "high" : "low"}
                    />
                  ))}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                    {heroSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentHeroSlide(dotIdx)}
                        className={`transition-all rounded-full cursor-pointer ${dotIdx === (currentHeroSlide % heroSlides.length) ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </>
              );
            }
            return <img className={styles.heroImage} src={heroSlide1} alt="A thoughtfully styled living space with natural textures" fetchPriority="high" />;
          })()}
          {heroContentVisible && <div className={styles.heroContent} style={{
            alignItems: t("element:hero_cta:align", "left") === "center" ? "center" : t("element:hero_cta:align", "left") === "right" ? "flex-end" : "flex-start",
            textAlign: (t("element:hero_cta:align", "left") === "center" ? "center" : t("element:hero_cta:align", "left") === "right" ? "right" : "left") as any,
          }}>{heroVisible("eyebrow") && <span data-studio-element="hero_eyebrow" style={heroEyebrowStyle} className={styles.eyebrow}>{t("bc8b2eacb376", "A LITTLE MORE EVERYDAY JOY")}</span>}{heroVisible("title") && <h1 id="retail-hero-title" data-studio-element="hero_title" style={heroTitleStyle}>{t("2e3e53c92e34", "Elevate your")}{t("b3ce3aa49140", "everyday") && <><br />{t("b3ce3aa49140", "everyday")}<span>.</span></>}</h1>}{heroVisible("description") && <p data-studio-element="hero_desc" style={heroDescStyle}>{t("5779ac00b259", "Thoughtful finds. Beautiful essentials.")}{t("38db6f3b9053", "Discover something you’ll love coming home to.") && <><br />{t("38db6f3b9053", "Discover something you’ll love coming home to.")}</>}</p>}{heroVisible("button") && <div style={{ display: "flex", width: "100%", justifyContent: t("element:hero_cta:align", "left") === "center" ? "center" : t("element:hero_cta:align", "left") === "right" ? "flex-end" : "flex-start" }}><button data-studio-element="hero_cta" className={styles.primary} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} onClick={() => browse()}>{t("cb0301452f41", "Shop the collection")}<StoreIcon name="ArrowRight" size={16} /></button></div>}{heroVisible("trust") && <div className={styles.heroTrust}><span><StoreIcon name="Check" size={14} />{t("20c982311737", "Selected with care")}</span><span><StoreIcon name="MessageCircle" size={14} />{t("b5661549e55b", "A real local seller")}</span></div>}</div>}
          {heroVisible("note") && <div className={styles.heroNote}><span>{t("c06135fbcd9c", "THE EVERYDAY EDIT")}</span><strong>{t("56acf6d3861d", "Small details.")}<br />{t("fff129d40982", "Big difference.")}</strong><a href="#retail-products">{t("1fd8cd4d6d59", "Find your favourite")}<StoreIcon name="ArrowRight" size={14} /></a></div>}
        </section>
      )}
      {isSectionVisible("categories") && categoryNames.length > 0 && (
        <section className={styles.categories} data-studio-section="categories" aria-label="Browse by category">{categoryNames.map((name, i) => {
          const item = products.find(p => p.category?.name === name && p.images?.[0]?.storage_path && !brokenImages.includes(p.id));
          const catGradients = [
            "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
            "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
            "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
            "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
          ];
          const catIcons = ["Sparkles", "ShoppingBag", "Tag", "Package", "Grid"] as const;
          return <button key={name} aria-pressed={category === name} onClick={() => browse(name)}><span className={styles.categoryCircle} style={{ background: catGradients[i % catGradients.length] }}>{item && item.images?.[0]?.storage_path ? <img src={item.images[0].storage_path} alt={name} loading="lazy" onError={() => setBrokenImages(old => [...old, item.id])} /> : <StoreIcon name={catIcons[i % catIcons.length]} size={24} strokeWidth={1.4} />}</span><span>{name}</span></button>;
        })}<button onClick={() => browse()}><span className={styles.categoryCircle} style={{ background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)" }}><StoreIcon name="LayoutGrid" size={24} strokeWidth={1.4} /></span><span>{t("54fd70af2dcc", "Shop all")}</span></button></section>
      )}
      {isSectionVisible("products") && isSectionVisible("featured_products") && (
        <section id="retail-products" className={styles.catalog} data-studio-section="products" aria-labelledby="retail-products-title">
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{t("bbf99ed7c027", "FIND YOUR NEW FAVOURITE")}</span><h2 id="retail-products-title">{savedOnly ? t("4b7755700fe9", "Your saved finds") : category !== "all" ? category : t("bddff8ac6906", "Top picks for you")}<span> ✧</span></h2></div><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "product" : "products"}</span></div>
          <div className={styles.toolbar}>
            <label className={styles.stock}><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} /><span>In stock only</span></label>
            {active && <button className={styles.clear} onClick={reset}><StoreIcon name="X" size={13} />Clear all</button>}
            <label className={styles.sort}><span>Sort:</span><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
          </div>
          {filtered.length === 0 ? (
            <div className={styles.empty}><StoreIcon name="Package" size={44} strokeWidth={1.2} /><h3>No products match your search</h3><p>Try clearing filters or search terms to see available items.</p>{active && <button className={styles.primary} onClick={reset}>Reset all filters</button>}</div>
          ) : (
            <div className={styles.grid}>{filtered.map(p => (
              <article key={p.id} className={styles.product} data-studio-element="product_card" data-style-part="card" data-custom-text={Boolean(cardStyle.color)} style={cardStyle}>
                <div className={styles.productVisual}>
                  <a className={styles.productImage} href={`/shop/${shop.slug}/product/${p.slug}`} onClick={e => { e.preventDefault(); setDetail(p); }} aria-label={`View ${p.name}`}>{photo(p)}</a>
                  {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && <span className={styles.discount}>−{Math.round(((Number(p.compare_at_price) - Number(p.price)) / Number(p.compare_at_price)) * 100)}%</span>}
                  <button className={styles.save} aria-label={`Save ${p.name}`} aria-pressed={wishlist.includes(p.id)} onClick={() => save(p.id)}><StoreIcon name="Heart" size={15} strokeWidth={wishlist.includes(p.id) ? 0 : 1.8} fill={wishlist.includes(p.id) ? "currentColor" : "none"} /></button>
                </div>
                <div className={styles.productInfo}>
                  <small>{p.category?.name || "The everyday collection"}</small>
                  <button className={styles.productName} onClick={() => setDetail(p)}>{p.name}</button>
                  <span className={styles.availability} style={{ color: p.stock_quantity > 0 ? undefined : "#9a5247" }}>{p.stock_quantity > 0 ? "In stock" : "Sold out"}</span>
                  <div className={styles.priceRow}>
                    <div><strong>{formatCurrency(Number(p.price))}</strong>{p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && <del>{formatCurrency(Number(p.compare_at_price))}</del>}</div>
                    <button className={styles.add} data-style-part="buttons" style={buttonStyle} aria-label={`Add ${p.name} to bag`} disabled={p.stock_quantity <= 0} onClick={() => add(p)}><StoreIcon name="ShoppingBag" size={14} /></button>
                  </div>
                </div>
              </article>
            ))}</div>
          )}
        </section>
      )}
      {isSectionVisible("promos") && (
        <section className={styles.promos} data-studio-section="promos">
          <div className={styles.promo}><span><small>{t("d2fa65abef41", "A STORE WITH A HUMAN TOUCH")}</small><strong>{t("ee699ee9da69", "Good finds. Real conversations.")}</strong><span>{t("32c4bbf7a16b", "Order directly from this store")}</span></span><a href={wa} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp with this seller"><StoreIcon name="MessageCircle" size={16} /></a></div>
          <div className={styles.promo}><span><small>{t("214e214d0234", "THOUGHTFUL SELECTION")}</small><strong>{t("41203eb65c40", "Made to fit everyday life.")}</strong><span>{t("3bbdb0f08e4d", "Browse the full collection")}</span></span><div><img src={editorialImage} alt="" /></div></div>
          <div className={styles.promo}><span><small>{t("71fcf13db140", "REAL UPDATES")}</small><strong>{t("d87e07b7c250", "Questions about any piece?")}</strong><span>{t("24258aeaa9ea", "Ask your seller directly")}</span></span><a href={wa} target="_blank" rel="noreferrer" aria-label="Ask seller on WhatsApp"><StoreIcon name="ArrowRight" size={16} /></a></div>
        </section>
      )}
      {isSectionVisible("contact") && (
        <section className={styles.personal} data-studio-section="contact"><div><span className={styles.eyebrow}>{t("825d57d5ee11", "A STORE WITH A HUMAN TOUCH")}</span><h2>{t("ee699ee9da69", "Good finds. Real conversations.")}</h2><p>{t("193be942469a", "Need a closer look, a little advice, or an update on your order?")}<br />{t("ca90fa6b46b8", "Your seller is just a message away.")}</p></div><a href={wa} target="_blank" rel="noreferrer" className={styles.outline}><StoreIcon name="MessageCircle" size={16} />{t("ca8ff436f56c", "Let’s talk on WhatsApp")}<StoreIcon name="ArrowRight" size={14} /></a></section>
      )}
      {isSectionVisible("reviews") && (
        <section className={styles.contact} data-studio-section="reviews"><span className={styles.contactIcon}><StoreIcon name="Truck" size={28} strokeWidth={1.2} /></span><div><h2>{t("94553aa3d489", "Stay in the loop.")}</h2><p>{t("351474d262b7", "Ask your seller about new arrivals and the latest finds.")}</p></div><a href={wa} target="_blank" rel="noreferrer"><span>{t("35fa674797be", "Discover what’s new")}</span><StoreIcon name="ArrowRight" size={15} /></a></section>
      )}
      {isSectionVisible("benefits") && (
        <section className={styles.benefits} data-studio-section="benefits" aria-label="Shopping information">
          <div><StoreIcon name="Package" size={22} strokeWidth={1.4} /><div><strong>{t("0d96d2b38f87", "Thoughtful selection")}</strong><small>{t("f37a5f6e80b4", "Explore the store’s collection")}</small></div></div>
          <div><StoreIcon name="Truck" size={22} strokeWidth={1.4} /><div><strong>{t("2bc7b0ca78d0", "Delivery details")}</strong><small>{t("c86ba461622b", "Confirm availability with your seller")}</small></div></div>
          <div><StoreIcon name="ShoppingBag" size={22} strokeWidth={1.4} /><div><strong>{t("8d0119e64e5c", "Easy ordering")}</strong><small>{t("8d754160a0a5", "Build your bag in a few taps")}</small></div></div>
          <div><StoreIcon name="MessageCircle" size={22} strokeWidth={1.4} /><div><strong>{t("98c471c26b47", "Personal support")}</strong><small>{t("46c6ab44dfba", "Talk directly with the seller")}</small></div></div>
        </section>
      )}
    </main>
    {isSectionVisible("footer") && (
      <footer className={styles.footer} data-studio-section="footer">
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            {shop.logo_url ? <img src={shop.logo_url} alt="" style={{ width: 44, height: 44, objectFit: "contain", marginBottom: 10 }} /> : <StoreIcon name="ShoppingBag" size={32} strokeWidth={1.2} />}
            <h2>{shop.name}</h2>
            <p>{shop.description || t("c76c0ee9bb40", "A little inspiration for your everyday. Shop local, discover more.")}</p>
            {shop.address && <small>{shop.address}</small>}
          </div>
          <div><h3>{t("97fec6c11718", "Explore")}</h3><button onClick={() => browse()}>{t("9a6ff3c17849", "All products")}</button>{categoryNames.slice(0, 4).map(name => <button key={name} onClick={() => browse(name)}>{name}</button>)}</div>
          <div><h3>{t("faee3b578500", "Here to help")}</h3><a href={`${wa}?text=${encodeURIComponent("Hello, I would like to track my order.")}`} target="_blank" rel="noreferrer">{t("51e971d97b28", "Track my order")}</a><StorePoliciesModal shopName={shop.name} whatsappNumber={shop.whatsapp_number} triggerLabel={t("77a0bcde89cb", "Shipping & delivery")} triggerClassName={styles.footerLink || ""} /><StorePoliciesModal shopName={shop.name} whatsappNumber={shop.whatsapp_number} triggerLabel={t("f1ecb2d2f831", "Returns & exchanges")} triggerClassName={styles.footerLink || ""} /></div>
          <div><h3>{t("f1883fa7163c", "Let’s connect")}</h3><p>{t("3517cb5ea004", "Have something in mind?")}<br />{t("93d6d5389da6", "We’d love to help.")}</p><a href={wa} target="_blank" rel="noreferrer" className={styles.footerChat}><StoreIcon name="MessageCircle" size={15} /><span>{t("a3b839215da0", "Chat on WhatsApp")}</span></a></div>
        </div>
        <div className={styles.copyright}><span>© {new Date().getFullYear()} {shop.name}</span><span>Made for local ambition. Powered by KADEO.</span></div>
      </footer>
    )}
    {detail && (
      <dialog className={styles.dialog} open aria-modal="true">
        <button className={styles.close} aria-label="Close details" onClick={() => setDetail(null)}><StoreIcon name="X" size={18} /></button>
        <div className={styles.detailImage}>{detail.images?.[0]?.storage_path ? <img src={detail.images[0].storage_path} alt={detail.name} /> : <div className={styles.placeholder}><StoreIcon name="Package" size={48} strokeWidth={1.2} /></div>}</div>
        <div className={styles.detailText}>
          <small>{detail.category?.name || "The everyday collection"}</small>
          <h2>{detail.name}</h2>
          <div className={styles.priceRow}><div><strong>{formatCurrency(Number(detail.price))}</strong>{detail.compare_at_price && Number(detail.compare_at_price) > Number(detail.price) && <del>{formatCurrency(Number(detail.compare_at_price))}</del>}</div></div>
          {detail.description && <p>{detail.description}</p>}
          <span className={styles.availability} style={{ color: detail.stock_quantity > 0 ? undefined : "#9a5247", margin: "15px 0" }}>{detail.stock_quantity > 0 ? `In stock (${detail.stock_quantity} available)` : "Sold out"}</span>
          <button className={styles.primary} disabled={detail.stock_quantity <= 0} onClick={() => { add(detail); setDetail(null); }}><StoreIcon name="ShoppingBag" size={16} />{detail.stock_quantity > 0 ? "Add to bag" : "Out of stock"}</button>
        </div>
      </dialog>
    )}
  </div>;
}
