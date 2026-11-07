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
  const heroVisible = (part: string) => t(`visibility:hero:${part}`, "shown") !== "hidden";
  const heroContentVisible = heroVisible("content") && ["eyebrow","title","description","button","trust"].some(heroVisible);
  const active = search || category !== "all" || inStock || savedOnly;
  return <div className={styles.retail} data-card-layout={t("layout:card", "stacked")} data-navbar-layout={t("layout:navbar", "left")} data-search-layout={searchLayout} data-card-style={t("style:card", "glass")} data-navbar-style={t("style:navbar", "glass")} data-search-style={t("style:search", "glass")} data-button-style={t("style:buttons", "glass")}>
    <a href="#retail-products" className={styles.skip}>{t("d39d5654302e", "Skip to products")}</a>
    <div className={styles.announcement}><span><StoreIcon name="Truck" size={13} />{t("4ea9da43bdb2", "Everyday finds, delivered to your door")}</span><span>{t("9eb4eeda8249", "Locally owned. Thoughtfully selected.")}</span><a href={wa} target="_blank" rel="noreferrer">{t("6fc1d0ccb663", "Questions? Chat with us")}<StoreIcon name="ArrowRight" size={13} /></a></div>
    <header className={styles.header} data-style-part="navbar" data-custom-text={Boolean(navbarStyle.color)} style={navbarStyle}>
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
    <main className={styles.main}>
      <section data-editor-image="banner_url" className={styles.hero} data-content-visible={heroContentVisible} aria-labelledby={heroContentVisible && heroVisible("title") ? "retail-hero-title" : undefined} aria-label={heroContentVisible && heroVisible("title") ? undefined : "Featured collection"}>
        <img className={styles.heroImage} src={shop.banner_url || editorialImage} alt="A thoughtfully styled living space with natural textures" fetchPriority="high" />
        {heroContentVisible && <div className={styles.heroContent}>{heroVisible("eyebrow") && <span className={styles.eyebrow}>{t("bc8b2eacb376", "A LITTLE MORE EVERYDAY JOY")}</span>}{heroVisible("title") && <h1 id="retail-hero-title">{t("2e3e53c92e34", "Elevate your")}<br />{t("b3ce3aa49140", "everyday")}<span>.</span></h1>}{heroVisible("description") && <p>{t("5779ac00b259", "Thoughtful finds. Beautiful essentials.")}<br />{t("38db6f3b9053", "Discover something you’ll love coming home to.")}</p>}{heroVisible("button") && <button className={styles.primary} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} onClick={() => browse()}>{t("cb0301452f41", "Shop the collection")}<StoreIcon name="ArrowRight" size={16} /></button>}{heroVisible("trust") && <div className={styles.heroTrust}><span><StoreIcon name="Check" size={14} />{t("20c982311737", "Selected with care")}</span><span><StoreIcon name="MessageCircle" size={14} />{t("b5661549e55b", "A real local seller")}</span></div>}</div>}
        {heroVisible("note") && <div className={styles.heroNote}><span>{t("c06135fbcd9c", "THE EVERYDAY EDIT")}</span><strong>{t("56acf6d3861d", "Small details.")}<br />{t("fff129d40982", "Big difference.")}</strong><a href="#retail-products">{t("1fd8cd4d6d59", "Find your favourite")}<StoreIcon name="ArrowRight" size={14} /></a></div>}
      </section>
      {categoryNames.length > 0 && <section className={styles.categories} aria-label="Browse by category">{categoryNames.map((name, i) => {
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
      })}<button onClick={() => browse()}><span className={styles.categoryCircle} style={{ background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)" }}><StoreIcon name="LayoutGrid" size={24} strokeWidth={1.4} /></span><span>{t("54fd70af2dcc", "Shop all")}</span></button></section>}
      <section id="retail-products" className={styles.catalog} aria-labelledby="retail-products-title">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{t("bbf99ed7c027", "FIND YOUR NEW FAVOURITE")}</span><h2 id="retail-products-title">{savedOnly ? t("4b7755700fe9", "Your saved finds") : category !== "all" ? category : t("bddff8ac6906", "Top picks for you")}<span> ✧</span></h2></div><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "product" : "products"}</span></div>
        <div className={styles.toolbar}><label className={styles.stock}><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />{t("95c6a15bc701", "In stock only")}</label>{active && <button className={styles.clear} onClick={reset}>{t("412226715c56", "Clear filters")}<StoreIcon name="X" size={13} /></button>}<label className={styles.sort}><StoreIcon name="SlidersHorizontal" size={14} /><span>{t("8b335a234e41", "Sort:")}</span><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">{t("ae31ad5d6f76", "Featured")}</option><option value="price-low">{t("2585bcdd1947", "Price: low to high")}</option><option value="price-high">{t("d1fbecd113d3", "Price: high to low")}</option><option value="name">{t("d7fd54f0f4f9", "Name: A–Z")}</option></select></label></div>
        {filtered.length ? <div className={styles.grid}>{filtered.map(p => {
          const discount = p.compare_at_price && p.compare_at_price > p.price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;
          return <article className={styles.product} data-style-part="card" data-custom-text={Boolean(cardStyle.color)} style={cardStyle} key={p.id}><div className={styles.productVisual}><button className={styles.productImage} onClick={() => setDetail(p)} aria-label={`View ${p.name}`}>{photo(p)}</button>{discount > 0 && <span className={styles.discount}>−{discount}%</span>}<button className={styles.save} aria-label={`${wishlist.includes(p.id) ? "Unsave" : "Save"} ${p.name}`} aria-pressed={wishlist.includes(p.id)} onClick={() => save(p.id)}><StoreIcon name="Heart" size={16} fill={wishlist.includes(p.id) ? "currentColor" : "none"} /></button></div><div className={styles.productInfo}><small>{p.category?.name || t("10ddb7727da2", "The everyday collection")}</small><button className={styles.productName} onClick={() => setDetail(p)}>{p.name}</button><span className={styles.availability}>{p.stock_quantity > 0 ? t("3f1356ad0e5c", "In stock") : t("a23bcb769dcc", "Currently sold out")}</span><div className={styles.priceRow}><div><strong>{formatCurrency(Number(p.price))}</strong>{discount > 0 && <del>{formatCurrency(Number(p.compare_at_price))}</del>}</div><button className={styles.add} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} disabled={p.stock_quantity <= 0} aria-label={`Add ${p.name} to bag`} onClick={() => add(p)}><StoreIcon name="ShoppingBag" size={16} /></button></div></div></article>;
        })}</div> : <div className={styles.empty}><StoreIcon name="Search" size={32} /><h3>{products.length ? t("05faba4f94c8", "No finds just yet") : t("051797dffa55", "Good things are on their way")}</h3><p>{savedOnly ? t("59baf30af913", "Save a product with the heart button, or clear your filters.") : products.length ? t("8b38093efc9b", "Try a different search or clear your filters.") : t("57cb51d6dd9c", "This store is preparing its collection. Ask the seller what’s coming next.")}</p>{products.length ? <button className={styles.primary} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} onClick={reset}>{t("5fb5e1bbc09c", "Browse all products")}<StoreIcon name="ArrowRight" size={16} /></button> : <a className={styles.primary} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} href={wa}>{t("eed04d3eb5c7", "Chat with the seller")}</a>}</div>}
      </section>
      {categoryNames.length > 0 && <section className={styles.promos} aria-label="Collection highlights">{categoryNames.slice(0, 3).map((name, i) => {
        const item = products.find(p => p.category?.name === name && p.images?.[0]?.storage_path);
        return <button key={name} onClick={() => browse(name)} className={styles.promo}><span><small>{[t("29b489c19e95", "A FRESH PERSPECTIVE"), t("3a21d61e0bb6", "MAKE IT YOURS"), t("db2cd7f0a002", "EVERYDAY, UPGRADED")][i]}</small><strong>{name}</strong><span>{t("181f9a9c60e3", "Explore collection")}<StoreIcon name="ArrowRight" size={14} /></span></span>{item && <div>{photo(item)}</div>}</button>;
      })}</section>}
      <section className={styles.personal}><div><span className={styles.eyebrow}>{t("719dd666c432", "A STORE WITH A HUMAN TOUCH")}</span><h2>{t("a106450de7dd", "Good finds. Real conversations.")}</h2><p>{t("af6939e89a80", "Need a closer look, a little advice, or an update on your order?")}<br />{t("1e613e81ba92", "Your seller is just a message away.")}</p></div><a className={styles.outline} href={wa} target="_blank" rel="noreferrer"><StoreIcon name="MessageCircle" size={18} />{t("db1c996cb113", "Let’s talk on WhatsApp")}<StoreIcon name="ArrowRight" size={16} /></a></section>
      <section className={styles.contact}><span className={styles.contactIcon}><StoreIcon name="MessageCircle" size={32} strokeWidth={1.4} /></span><div><h2>{t("bd15b81eac78", "Stay in the loop.")}</h2><p>{t("10c63674ae76", "Ask your seller about new arrivals and the latest finds.")}</p></div><a href={`${wa}?text=${encodeURIComponent("Hi! I would love to hear about your latest arrivals.")}`} target="_blank" rel="noreferrer">{t("2a1bfa9ba6bd", "Discover what’s new")}<StoreIcon name="ArrowRight" size={16} /></a></section>
      <section className={styles.benefits} aria-label="Shopping information">{[[Package, t("af44869a4186", "Thoughtful selection"), t("00bd2c7c7f41", "Explore the store’s collection")], [Truck, t("7760059a4e6d", "Delivery details"), t("78b0f5782ee0", "Confirm availability with your seller")], [ShoppingBag, t("dfc9aea4d667", "Easy ordering"), t("1ba05e2c54e2", "Build your bag in a few taps")], [MessageCircle, t("c0e7105a8fd8", "Personal support"), t("765637f188bf", "Talk directly with the seller")]].map(([Icon, title, subtitle], iconIndex) => { const Symbol = Icon as typeof Package; return <div key={String(title)}><StoreIcon name={["Package","Truck","ShoppingBag","MessageCircle"][iconIndex]} size={25} strokeWidth={1.3} /><span><strong>{String(title)}</strong><small>{String(subtitle)}</small></span></div>; })}</section>
    </main>
    <footer className={styles.footer}><div className={styles.footerInner}><div className={styles.footerBrand}><StoreIcon name="ShoppingBag" size={28} strokeWidth={1.2} /><h2>{shop.name}</h2><p>{shop.description || t("b0698edfa775", "A little inspiration for your everyday. Shop local, discover more.")}</p><small>{shop.address || t("197042c4de91", "Sri Lanka")}</small></div><div><h3>{t("b965ae66fcc4", "Explore")}</h3><button onClick={() => browse()}>{t("3ffece7c47ca", "All products")}</button>{categoryNames.slice(0, 4).map(name => <button key={name} onClick={() => browse(name)}>{name}</button>)}</div><div><h3>{t("92ee0cb4892d", "Here to help")}</h3><Link href={`/shop/${shop.slug}/track`}>{t("4b032baa50a7", "Track my order")}</Link><StorePoliciesModal shopName={shop.name} whatsappNumber={shop.whatsapp_number} triggerLabel={t("d4b070b0c5e1", "Shipping & delivery")} triggerClassName="text-left text-inherit cursor-pointer hover:underline" /><StorePoliciesModal shopName={shop.name} whatsappNumber={shop.whatsapp_number} triggerLabel={t("5c765f870850", "Returns & exchanges")} triggerClassName="text-left text-inherit cursor-pointer hover:underline" /></div><div><h3>{t("1bf6046ed970", "Let’s connect")}</h3><p>{t("8d5a51b59fb1", "Have something in mind?")}<br />{t("bb28340f5474", "We’d love to help.")}</p><a href={wa} target="_blank" rel="noreferrer" className={styles.footerChat}><StoreIcon name="MessageCircle" size={15} />{t("8eb8a88ae376", "Chat on WhatsApp")}</a></div></div><div className={styles.copyright}><span>© {new Date().getFullYear()} {shop.name}</span><span>{t("adb39da567f6", "Made for local ambition. Powered by KADEO.")}</span></div></footer>
    {detail && <dialog className={styles.dialog} ref={node => { if (node && !node.open) node.showModal(); }} onCancel={() => setDetail(null)} onClick={e => { if (e.target === e.currentTarget) setDetail(null); }} aria-labelledby="product-detail-title"><button className={styles.close} aria-label="Close product details" onClick={() => setDetail(null)} autoFocus><StoreIcon name="X" size={20} /></button><div className={styles.detailImage}>{photo(detail)}</div><div className={styles.detailText}><span className={styles.eyebrow}>{detail.category?.name || t("e07b41acde23", "THE COLLECTION")}</span><h2 id="product-detail-title">{detail.name}</h2><strong>{formatCurrency(Number(detail.price))}</strong><p>{detail.description || t("4098066ef76b", "Ask the seller for more details about this product.")}</p><p>{detail.stock_quantity > 0 ? t("38f8c64a0e57", "Available to order") : t("a23bcb769dcc", "Currently sold out")}</p><button className={styles.primary} data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} disabled={detail.stock_quantity <= 0} onClick={() => { add(detail); setDetail(null); }}>{t("95355cde18ea", "Add to bag")}<StoreIcon name="ShoppingBag" size={16} /></button></div></dialog>}
  </div>;
}
