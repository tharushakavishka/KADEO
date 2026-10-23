var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express6 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);

// server/db.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var isConnected = false;
var connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("\u26A0\uFE0F [MongoDB Atlas] MONGODB_URI is not defined in .env file.");
    console.warn("\u2139\uFE0F [MongoDB Atlas] Running in offline fallback mode with local storage sync.");
    return false;
  }
  try {
    const conn = await import_mongoose.default.connect(uri, {
      serverSelectionTimeoutMS: 5e3
    });
    isConnected = true;
    console.log(`\u2705 [MongoDB Atlas] Successfully connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.error("\u274C [MongoDB Atlas] Connection failed:", err.message);
    return false;
  }
};
var getDbStatus = () => ({
  connected: isConnected,
  readyState: import_mongoose.default.connection.readyState,
  host: import_mongoose.default.connection.host || null,
  name: import_mongoose.default.connection.name || null
});

// server/seed.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);

// server/models/User.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var UserSchema = new import_mongoose2.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["seller", "admin", "customer"], default: "customer" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    shopId: { type: String },
    avatar: { type: String },
    createdAt: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString() }
  },
  {
    timestamps: true
  }
);
var UserModel = import_mongoose2.default.models.User || import_mongoose2.default.model("User", UserSchema);

// server/models/Shop.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var ShopSchema = new import_mongoose3.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverVideo: { type: String },
    coverMediaType: { type: String, enum: ["image", "video"], default: "image" },
    whatsappNumber: { type: String, default: "" },
    displayPhone: { type: String, default: "" },
    contactDetails: {
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      instagram: { type: String, default: "" },
      deliveryCoverage: { type: String, default: "" }
    },
    themeId: { type: String, enum: ["minimal", "beauty", "modern"], default: "minimal" },
    heroBanner: { type: import_mongoose3.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    createdAt: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString() },
    subscriptionPlanId: { type: String, enum: ["free", "starter", "pro"], default: "starter" }
  },
  {
    timestamps: true
  }
);
var ShopModel = import_mongoose3.default.models.Shop || import_mongoose3.default.model("Shop", ShopSchema);

// server/models/Product.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var VariantSchema = new import_mongoose4.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    options: { type: [String], default: [] },
    priceModifier: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String }
  },
  { _id: false }
);
var ProductSchema = new import_mongoose4.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    shopId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    compareAtPrice: { type: Number },
    costPrice: { type: Number },
    images: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active" },
    featured: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    createdAt: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString() },
    updatedAt: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString() }
  },
  {
    timestamps: true
  }
);
ProductSchema.pre("save", function() {
  if (this.stockQuantity !== void 0 && (this.stock === void 0 || this.stock === 0)) {
    this.stock = this.stockQuantity;
  } else if (this.stock !== void 0 && (this.stockQuantity === void 0 || this.stockQuantity === 0)) {
    this.stockQuantity = this.stock;
  }
  if (this.featured !== void 0 && this.isFeatured === void 0) {
    this.isFeatured = this.featured;
  }
});
var ProductModel = import_mongoose4.default.models.Product || import_mongoose4.default.model("Product", ProductSchema);

// server/models/Category.ts
var import_mongoose5 = __toESM(require("mongoose"), 1);
var CategorySchema = new import_mongoose5.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    iconName: { type: String },
    imageUrl: { type: String }
  },
  {
    timestamps: true
  }
);
var CategoryModel = import_mongoose5.default.models.Category || import_mongoose5.default.model("Category", CategorySchema);

// src/data/initialData.ts
var INITIAL_CATEGORIES = [
  {
    id: "cat-apparel",
    name: "Apparel & Linen",
    slug: "apparel-linen",
    description: "Breathable handcrafted linens, modern resort wear, and ethical garments.",
    imageUrl: "/src/assets/images/category_apparel_linen_1792347729400.jpg"
  },
  {
    id: "cat-skincare",
    name: "Beauty & Wellness",
    slug: "skincare-wellness",
    description: "Ayurvedic formulations, botanical serums, and natural remedies.",
    imageUrl: "/src/assets/images/category_beauty_wellness_1792347729900.jpg"
  },
  {
    id: "cat-tech",
    name: "Audio & Mobile Tech",
    slug: "audio-tech",
    description: "Everyday carry electronics, active noise-cancelling audio, and accessories.",
    imageUrl: "/src/assets/images/category_audio_tech_1792347731311.jpg"
  },
  {
    id: "cat-living",
    name: "Handcrafted Living",
    slug: "handcrafted-living",
    description: "Ceramic tableware, woven homeware, and artisanal decor.",
    imageUrl: "/src/assets/images/category_handcrafted_living_1792347730298.jpg"
  },
  {
    id: "cat-gourmet",
    name: "Ceylon Artisanal Pantry",
    slug: "artisanal-pantry",
    description: "Single-estate highland teas, pure cinnamon, and wild honey.",
    imageUrl: "/src/assets/images/marketplace_hero_lifestyle_1792347748759.jpg"
  }
];
var INITIAL_USERS = [
  {
    id: "user-1",
    name: "Kasun Jayawardena",
    email: "kasun@ceylonlinen.lk",
    phone: "+94 77 123 4567",
    role: "seller",
    status: "active",
    shopId: "shop-1",
    createdAt: "2026-08-10T09:00:00Z"
  },
  {
    id: "user-2",
    name: "Dilini Senanayake",
    email: "dilini@aaryabotanicals.com",
    phone: "+94 77 987 6543",
    role: "seller",
    status: "active",
    shopId: "shop-2",
    createdAt: "2026-08-14T11:30:00Z"
  },
  {
    id: "user-3",
    name: "Sanjeewa Perera",
    email: "sanjeewa@urbanpulse.lk",
    phone: "+94 71 555 4321",
    role: "seller",
    status: "active",
    shopId: "shop-3",
    createdAt: "2026-09-01T14:15:00Z"
  },
  {
    id: "user-admin",
    name: "Admin Kadeo",
    email: "admin@kadeo.lk",
    phone: "+94 11 234 5678",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z"
  }
];
var INITIAL_SHOPS = [
  {
    id: "shop-1",
    ownerId: "user-1",
    name: "Ceylon Linen Co.",
    slug: "ceylon-linen",
    description: "Ethically crafted pure linen menswear and everyday resort essentials designed in Colombo.",
    logo: "/src/assets/images/ceylon_linen_shirt_1792345877981.jpg",
    coverImage: "/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg",
    whatsappNumber: "94771234567",
    displayPhone: "+94 77 123 4567",
    contactDetails: {
      email: "orders@ceylonlinen.lk",
      address: "No. 42, Galle Road, Kollupitiya",
      city: "Colombo 03",
      instagram: "@ceylonlinenco",
      deliveryCoverage: "Islandwide Delivery (1-3 Business Days)"
    },
    heroBanner: {
      welcomeBadge: "Welcome to Ceylon Linen Co.",
      headlineMain: "Look Good",
      headlineHighlight: "Feel Beautiful",
      description: "Spun from 100% natural European flax fibers and cut by hand in Kollupitiya, Colombo. Tailored for equatorial ease and timeless elegance.",
      primaryCtaText: "Shop Collection",
      secondaryCtaText: "WhatsApp Concierge",
      backgroundImage: "/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg",
      spotlightImage: "/src/assets/images/ceylon_linen_shirt_1792345877981.jpg",
      trustBadge1: {
        title: "100% Pure Flax & Organic",
        subtitle: "Certified & Quality Tested",
        icon: "leaf"
      },
      trustBadge2: {
        title: "Fast Delivery",
        subtitle: "Island Wide (1-3 Days)",
        icon: "truck"
      },
      trustBadge3: {
        title: "Secure Checkout",
        subtitle: "Cash on Delivery / Bank",
        icon: "shield"
      }
    },
    themeId: "minimal",
    status: "active",
    createdAt: "2026-08-10T10:00:00Z",
    subscriptionPlanId: "starter"
  },
  {
    id: "shop-2",
    ownerId: "user-2",
    name: "Aarya Botanicals",
    slug: "aarya-botanicals",
    description: "Pure Ayurvedic botanical skincare handcrafted in small batches using sustainably wildcrafted indigenous flora.",
    logo: "/src/assets/images/aarya_botanicals_serum_1792345879113.jpg",
    coverImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=80",
    coverVideo: "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-green-leaves-40243-large.mp4",
    coverMediaType: "video",
    whatsappNumber: "94779876543",
    displayPhone: "+94 77 987 6543",
    contactDetails: {
      email: "care@aaryabotanicals.com",
      address: "18/4, Peradeniya Road",
      city: "Kandy",
      instagram: "@aaryabotanicals",
      deliveryCoverage: "Islandwide Express & Eco-Pouch Delivery"
    },
    themeId: "beauty",
    status: "active",
    createdAt: "2026-08-14T12:00:00Z",
    subscriptionPlanId: "pro"
  },
  {
    id: "shop-3",
    ownerId: "user-3",
    name: "UrbanPulse Tech",
    slug: "urbanpulse-tech",
    description: "High-performance audio, MagSafe daily carry gear, and minimalist desk setups for Sri Lankan digital creators.",
    logo: "/src/assets/images/urbanpulse_earbuds_1792345879391.jpg",
    coverImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80",
    whatsappNumber: "94715554321",
    displayPhone: "+94 71 555 4321",
    contactDetails: {
      email: "support@urbanpulse.lk",
      address: "102 High Level Road",
      city: "Nugegoda",
      instagram: "@urbanpulse.lk",
      deliveryCoverage: "Same Day Colombo / 48hr Islandwide"
    },
    themeId: "modern",
    status: "active",
    createdAt: "2026-09-01T15:00:00Z",
    subscriptionPlanId: "starter"
  },
  {
    id: "shop-4",
    ownerId: "user-2",
    name: "Glow & Grace",
    slug: "glow-and-grace",
    description: "Premium beauty products & professional salon services for your natural glow.",
    logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
    coverImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80",
    whatsappNumber: "94771234567",
    displayPhone: "+94 77 123 4567",
    contactDetails: {
      email: "hello@glowandgrace.lk",
      address: "Main Street, City Center",
      city: "Kurunegala",
      instagram: "@glowandgrace.lk",
      deliveryCoverage: "Islandwide Express Delivery (1-2 Days)"
    },
    heroBanner: {
      welcomeBadge: "Welcome to Glow & Grace",
      headlineMain: "Look Good",
      headlineHighlight: "Feel Beautiful",
      description: "Premium beauty products & professional salon services for your natural glow.",
      primaryCtaText: "Shop Now",
      secondaryCtaText: "Book an Appointment",
      backgroundImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80",
      spotlightImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      trustBadge1: {
        title: "100% Original Products",
        subtitle: "Certified & Quality Tested",
        icon: "leaf"
      },
      trustBadge2: {
        title: "Fast Delivery",
        subtitle: "Island Wide Courier",
        icon: "truck"
      },
      trustBadge3: {
        title: "Secure Payments",
        subtitle: "Cash on Delivery / Bank",
        icon: "shield"
      }
    },
    themeId: "beauty",
    status: "active",
    createdAt: "2026-09-10T10:00:00Z",
    subscriptionPlanId: "pro"
  }
];
var INITIAL_PRODUCTS = [
  // Shop 1: Ceylon Linen Co.
  {
    id: "prod-101",
    shopId: "shop-1",
    categoryId: "cat-apparel",
    name: "Pure Linen Relaxed Resort Shirt",
    slug: "pure-linen-relaxed-resort-shirt",
    description: "Spun from 100% natural European flax linen with a camp collar, mother-of-pearl buttons, and a relaxed tropical drape tailored for the Sri Lankan climate.",
    price: 6800,
    sku: "CLC-SHR-01-SND",
    stockQuantity: 18,
    images: [
      "/src/assets/images/ceylon_linen_shirt_1792345877981.jpg",
      "/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg",
      "/src/assets/images/ceylon_linen_craft_detail_1792347214827.jpg"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-08-15T10:00:00Z",
    updatedAt: "2026-08-15T10:00:00Z"
  },
  {
    id: "prod-102",
    shopId: "shop-1",
    categoryId: "cat-apparel",
    name: "Terracotta Linen Wrap Midi Dress",
    slug: "terracotta-linen-wrap-midi-dress",
    description: "A timeless silhouette featuring an adjustable wrap waist, deep side pockets, and breathable medium-weight washed linen in rich Sri Lankan terracotta.",
    price: 9400,
    sku: "CLC-DRS-02-TER",
    stockQuantity: 12,
    images: [
      "/src/assets/images/ceylon_linen_lookbook_lifestyle_1792347214913.jpg",
      "/src/assets/images/ceylon_linen_dress_1792345878487.jpg",
      "/src/assets/images/ceylon_linen_craft_detail_1792347214827.jpg"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-08-16T11:00:00Z",
    updatedAt: "2026-08-16T11:00:00Z"
  },
  {
    id: "prod-103",
    shopId: "shop-1",
    categoryId: "cat-apparel",
    name: "Classic White Linen Drawstring Trousers",
    slug: "classic-white-linen-drawstring-trousers",
    description: "Relaxed straight-leg linen trousers with an elasticated waistband and natural cotton drawcord. Pre-washed for soft non-shrink wear.",
    price: 7600,
    sku: "CLC-TRS-03-WHT",
    stockQuantity: 3,
    // Low stock indicator!
    images: [
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
      "/src/assets/images/ceylon_linen_craft_detail_1792347214827.jpg"
    ],
    status: "active",
    createdAt: "2026-08-17T12:00:00Z",
    updatedAt: "2026-08-17T12:00:00Z"
  },
  {
    id: "prod-104",
    shopId: "shop-1",
    categoryId: "cat-apparel",
    name: "Handwoven Natural Cotton Carry Tote",
    slug: "handwoven-natural-cotton-carry-tote",
    description: "Loom-woven in southern Sri Lanka with sturdy unbleached cotton canvas and vegetable-tanned leather handles. Ideal for weekend markets.",
    price: 3800,
    sku: "CLC-BAG-04-NAT",
    stockQuantity: 24,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "/src/assets/images/ceylon_linen_lookbook_lifestyle_1792347214913.jpg"
    ],
    status: "active",
    createdAt: "2026-08-18T13:00:00Z",
    updatedAt: "2026-08-18T13:00:00Z"
  },
  {
    id: "prod-105",
    shopId: "shop-1",
    categoryId: "cat-apparel",
    name: "Washed Indigo Linen Overshirt",
    slug: "washed-indigo-linen-overshirt",
    description: "Heavyweight 220 GSM linen overshirt in naturally dyed deep indigo. Dual chest utility pockets and horn buttons.",
    price: 8900,
    sku: "CLC-OVR-05-IND",
    stockQuantity: 7,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "/src/assets/images/ceylon_linen_craft_detail_1792347214827.jpg"
    ],
    status: "active",
    createdAt: "2026-08-19T14:00:00Z",
    updatedAt: "2026-08-19T14:00:00Z"
  },
  {
    id: "prod-106",
    shopId: "shop-1",
    categoryId: "cat-apparel",
    name: "Galle Fort Tailored Linen Shorts",
    slug: "galle-fort-tailored-linen-shorts",
    description: "Tailored knee-length shorts in sand-beige washed flax linen. Tailored waistband with belt loops, slant pockets, and breathable interior lining.",
    price: 5400,
    sku: "CLC-SHT-06-SND",
    stockQuantity: 14,
    images: [
      "/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg",
      "/src/assets/images/ceylon_linen_craft_detail_1792347214827.jpg"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-08-20T15:00:00Z",
    updatedAt: "2026-08-20T15:00:00Z"
  },
  // Shop 2: Aarya Botanicals
  {
    id: "prod-201",
    shopId: "shop-2",
    categoryId: "cat-skincare",
    name: "Gotu Kola & Blue Lotus Elixir Serum",
    slug: "gotu-kola-blue-lotus-elixir-serum",
    description: "Targeted skin-repair concentrate combining centella asiatica (Gotu Kola) with Sri Lankan Blue Lotus extract and low-molecular hyaluronic acid to restore the lipid barrier.",
    price: 5400,
    sku: "ARY-SRM-01-30M",
    stockQuantity: 22,
    images: [
      "/src/assets/images/aarya_botanicals_serum_1792345879113.jpg",
      "https://images.unsplash.com/photo-1608248597359-58b525287f39?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-08-20T10:00:00Z"
  },
  {
    id: "prod-202",
    shopId: "shop-2",
    categoryId: "cat-skincare",
    name: "Herbal Hydrating Day Cream (50ml)",
    slug: "herbal-hydrating-day-cream",
    description: "Whipped cloud cream formulated with cold-pressed moringa seed oil, organic aloe vera, and green tea polyphenols in a recyclable frosted glass jar.",
    price: 4600,
    sku: "ARY-CRM-02-50M",
    stockQuantity: 15,
    images: [
      "/src/assets/images/aarya_botanicals_cream_1792345879081.jpg",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-08-21T11:00:00Z",
    updatedAt: "2026-08-21T11:00:00Z"
  },
  {
    id: "prod-203",
    shopId: "shop-2",
    categoryId: "cat-skincare",
    name: "Sandalwood & Vetiver Calming Mist",
    slug: "sandalwood-vetiver-calming-mist",
    description: "Steam-distilled pure floral water infused with wild red sandalwood and cooling vetiver roots. Refreshing for humid afternoons.",
    price: 3200,
    sku: "ARY-MST-03-100",
    stockQuantity: 2,
    // Low stock indicator!
    images: [
      "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    createdAt: "2026-08-22T12:00:00Z",
    updatedAt: "2026-08-22T12:00:00Z"
  },
  {
    id: "prod-204",
    shopId: "shop-2",
    categoryId: "cat-skincare",
    name: "Wild Turmeric Illuminating Facial Oil",
    slug: "wild-turmeric-illuminating-facial-oil",
    description: "Golden cold-pressed botanical oil enriched with Ceylon wild turmeric (Kasturi Kaha) and jojoba. Brightens dull complexion without clogging pores.",
    price: 5800,
    sku: "ARY-OIL-04-30M",
    stockQuantity: 19,
    images: [
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    createdAt: "2026-08-23T13:00:00Z",
    updatedAt: "2026-08-23T13:00:00Z"
  },
  // Shop 3: UrbanPulse Tech
  {
    id: "prod-301",
    shopId: "shop-3",
    categoryId: "cat-tech",
    name: "Pro ANC Wireless Earbuds (Matte Black)",
    slug: "pro-anc-wireless-earbuds-matte-black",
    description: "Studio-tuned 11mm graphene drivers, active hybrid noise cancellation up to 42dB, transparency mode, and 32 hours total playtime with Qi wireless case.",
    price: 14800,
    sku: "UPT-AUD-01-BLK",
    stockQuantity: 11,
    images: [
      "/src/assets/images/urbanpulse_earbuds_1792345879391.jpg",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z"
  },
  {
    id: "prod-302",
    shopId: "shop-3",
    categoryId: "cat-tech",
    name: "Magnetic 10,000mAh Slim Power Bank",
    slug: "magnetic-10000mah-slim-power-bank",
    description: "Anodized aluminum chassis with strong MagSafe alignment, 15W fast wireless charging, 20W USB-C Power Delivery, and braided silicone cable.",
    price: 9200,
    sku: "UPT-PWR-02-GRY",
    stockQuantity: 14,
    images: [
      "/src/assets/images/urbanpulse_powerbank_1792345880170.jpg",
      "https://images.unsplash.com/photo-1609592424368-2374b391307b?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-03T11:00:00Z",
    updatedAt: "2026-09-03T11:00:00Z"
  },
  {
    id: "prod-303",
    shopId: "shop-3",
    categoryId: "cat-tech",
    name: "Braided 100W 2-Meter Fast USB-C Cable",
    slug: "braided-100w-2m-fast-usbc-cable",
    description: "Reinforced ballistic nylon weave with alloy ends and E-Marker smart chip for laptops, iPads, and smartphones.",
    price: 2400,
    sku: "UPT-CBL-03-2MT",
    stockQuantity: 40,
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    createdAt: "2026-09-04T12:00:00Z",
    updatedAt: "2026-09-04T12:00:00Z"
  },
  {
    id: "prod-304",
    shopId: "shop-3",
    categoryId: "cat-tech",
    name: "Ergonomic Matte Aluminum Laptop Stand",
    slug: "ergonomic-matte-aluminum-laptop-stand",
    description: "Precision CNC-machined ventilated stand with anti-slip silicone cushions. Elevated viewing angle to reduce neck strain.",
    price: 6500,
    sku: "UPT-ACC-04-ALU",
    stockQuantity: 8,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
    ],
    status: "active",
    createdAt: "2026-09-05T13:00:00Z",
    updatedAt: "2026-09-05T13:00:00Z"
  },
  // Shop 4: Glow & Grace
  {
    id: "prod-401",
    shopId: "shop-4",
    categoryId: "cat-skincare",
    name: "Simple Moisturizing Cream",
    slug: "simple-moisturizing-cream",
    description: "Kind to skin replenishing rich moisturizer with pro-vitamin B5 and bisabolol. 12-hour hydration without greasy residue.",
    price: 2400,
    originalPrice: 3e3,
    sku: "GNG-SKN-01-SMP",
    stockQuantity: 25,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-10T11:00:00Z",
    updatedAt: "2026-09-10T11:00:00Z"
  },
  {
    id: "prod-402",
    shopId: "shop-4",
    categoryId: "cat-skincare",
    name: "Dove Body Lotion",
    slug: "dove-body-lotion",
    description: "Deeply nourishing body moisturizer with ceramide restoring serum for 48-hour radiant, soft and supple skin.",
    price: 1690,
    originalPrice: 1990,
    sku: "GNG-BDY-02-DOV",
    stockQuantity: 32,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-10T11:30:00Z",
    updatedAt: "2026-09-10T11:30:00Z"
  },
  {
    id: "prod-403",
    shopId: "shop-4",
    categoryId: "cat-skincare",
    name: "Maybelline Matte Lipstick",
    slug: "maybelline-matte-lipstick",
    description: "Color Sensational creamy matte lipstick with intensely pigmented shade and honey nectar smooth finish.",
    price: 1350,
    originalPrice: 1500,
    sku: "GNG-MKP-03-MYB",
    stockQuantity: 45,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-10T12:00:00Z",
    updatedAt: "2026-09-10T12:00:00Z"
  },
  {
    id: "prod-404",
    shopId: "shop-4",
    categoryId: "cat-skincare",
    name: "L'Or\xE9al Shampoo",
    slug: "loreal-shampoo",
    description: "Total Repair 5 restorative formula infused with protein and ceramide to combat dryness, roughness, and dullness.",
    price: 1350,
    originalPrice: 1600,
    sku: "GNG-HAR-04-LOR",
    stockQuantity: 28,
    images: [
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-10T12:30:00Z",
    updatedAt: "2026-09-10T12:30:00Z"
  },
  {
    id: "prod-405",
    shopId: "shop-4",
    categoryId: "cat-skincare",
    name: "Nail Polish Set (5 Pcs)",
    slug: "nail-polish-set-5-pcs",
    description: "Curated 5-piece gel-finish high-gloss nail enamel collection featuring quick-dry and chip-resistant salon finish.",
    price: 2800,
    originalPrice: 3200,
    sku: "GNG-NAL-05-BF",
    stockQuantity: 19,
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80"
    ],
    status: "active",
    featured: true,
    createdAt: "2026-09-10T13:00:00Z",
    updatedAt: "2026-09-10T13:00:00Z"
  }
];

// server/seed.ts
var seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log("\u{1F331} [MongoDB Atlas] Seeding initial users...");
      const usersWithHashedPasswords = INITIAL_USERS.map((u) => ({
        ...u,
        password: import_bcryptjs.default.hashSync(u.role === "admin" ? "admin1234" : "seller1234", 10)
      }));
      await UserModel.insertMany(usersWithHashedPasswords);
    } else {
      const adminPass = import_bcryptjs.default.hashSync("admin1234", 10);
      const sellerPass = import_bcryptjs.default.hashSync("seller1234", 10);
      await UserModel.updateOne(
        { role: "admin", $or: [{ password: { $exists: false } }, { password: "" }] },
        { $set: { password: adminPass } }
      );
      await UserModel.updateMany(
        { role: "seller", $or: [{ password: { $exists: false } }, { password: "" }] },
        { $set: { password: sellerPass } }
      );
    }
    const shopCount = await ShopModel.countDocuments();
    if (shopCount === 0) {
      console.log("\u{1F331} [MongoDB Atlas] Seeding initial shops...");
      await ShopModel.insertMany(INITIAL_SHOPS);
    }
    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0) {
      console.log("\u{1F331} [MongoDB Atlas] Seeding initial categories...");
      await CategoryModel.insertMany(INITIAL_CATEGORIES);
    }
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log("\u{1F331} [MongoDB Atlas] Seeding initial products...");
      const prodsWithStock = INITIAL_PRODUCTS.map((p) => ({
        ...p,
        stock: p.stockQuantity
      }));
      await ProductModel.insertMany(prodsWithStock);
    } else {
      for (const initialProd of INITIAL_PRODUCTS) {
        await ProductModel.updateOne(
          { id: initialProd.id, $or: [{ stockQuantity: { $exists: false } }, { stockQuantity: 0 }] },
          {
            $set: {
              stockQuantity: initialProd.stockQuantity,
              stock: initialProd.stockQuantity,
              featured: initialProd.featured ?? false,
              isFeatured: initialProd.featured ?? false
            }
          }
        );
      }
    }
  } catch (err) {
    console.warn("\u26A0\uFE0F [MongoDB Atlas] Seed check completed with notice:", err.message);
  }
};

// server/routes/auth.ts
var import_express = require("express");
var import_google_auth_library = require("google-auth-library");
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// server/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? (() => {
  console.error("\u274C [SECURITY FATAL] JWT_SECRET environment variable is missing in production mode!");
  return "kadeo_production_jwt_secret_key_2026_secure";
})() : "kadeo_development_jwt_secret_key_2026");
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required. No token provided." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(403).json({ error: "Invalid or forged authentication token." });
  }
};
var requireSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Seller or Admin privileges required." });
  }
  next();
};
var requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }
  next();
};
var signUserToken = (user) => {
  return import_jsonwebtoken.default.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// server/routes/auth.ts
var authRouter = (0, import_express.Router)();
var googleClient = new import_google_auth_library.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
authRouter.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ id: req.user.userId }).select("-password").lean();
    if (!user) {
      return res.status(404).json({ error: "User account not found or deactivated" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
authRouter.get("/users", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const users = await UserModel.find().select("-password").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
authRouter.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
      return res.status(403).json({ error: "Unauthorized to view this user profile" });
    }
    const user = await UserModel.findOne({ id: req.params.id }).select("-password").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email address" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ error: "This account has been suspended. Please contact support." });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!user.password) {
      return res.status(401).json({
        error: "No password is configured for this account. Please sign in with Google or reset your password."
      });
    }
    let isMatch = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await import_bcryptjs2.default.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      if (isMatch) {
        const salt = await import_bcryptjs2.default.genSalt(10);
        user.password = await import_bcryptjs2.default.hash(password, salt);
        await user.save();
      }
    }
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password. Please check your credentials." });
    }
    const sanitized = user.toObject();
    delete sanitized.password;
    const token = signUserToken(sanitized);
    res.json({
      success: true,
      token,
      user: sanitized
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
authRouter.post("/google", async (req, res) => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;
    if (!tokenToVerify) {
      return res.status(400).json({
        error: "Google ID token is required. Client-provided raw emails are not trusted for authentication."
      });
    }
    let verifiedEmail;
    let verifiedName;
    let verifiedAvatar;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: clientId || void 0
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(401).json({ error: "Empty Google token payload" });
      }
      if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
        return res.status(401).json({ error: "Invalid Google token issuer" });
      }
      if (!payload.email_verified) {
        return res.status(403).json({ error: "Unverified Google email accounts are not permitted" });
      }
      if (payload.exp && payload.exp * 1e3 < Date.now()) {
        return res.status(401).json({ error: "Google authentication token has expired" });
      }
      verifiedEmail = payload.email.toLowerCase().trim();
      verifiedName = payload.name || payload.given_name || "Google User";
      verifiedAvatar = payload.picture;
    } catch (googleErr) {
      return res.status(401).json({
        error: `Google token verification failed: ${googleErr.message}. Ensure valid Google OAuth credentials.`
      });
    }
    let user = await UserModel.findOne({ email: verifiedEmail });
    if (!user) {
      user = await UserModel.create({
        id: `user-${import_crypto.default.randomUUID()}`,
        name: verifiedName.trim(),
        email: verifiedEmail,
        phone: "",
        role: "customer",
        status: "active",
        avatar: verifiedAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(verifiedName)}&background=10B981&color=fff`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      if (verifiedAvatar && !user.avatar) {
        user.avatar = verifiedAvatar;
        await user.save();
      }
    }
    const sanitized = user.toObject();
    delete sanitized.password;
    const token = signUserToken(sanitized);
    res.json({
      success: true,
      token,
      user: sanitized
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role = "customer", shopId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required for registration" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists" });
    }
    let hashedPassword = void 0;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const salt = await import_bcryptjs2.default.genSalt(10);
      hashedPassword = await import_bcryptjs2.default.hash(password, salt);
    }
    const user = await UserModel.create({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || "",
      password: hashedPassword,
      role: ["seller", "admin", "customer"].includes(role) ? role : "customer",
      status: "active",
      shopId: shopId || void 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const sanitized = user.toObject();
    delete sanitized.password;
    const token = signUserToken(sanitized);
    res.status(201).json({
      success: true,
      token,
      user: sanitized
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/routes/shops.ts
var import_express2 = require("express");
var shopsRouter = (0, import_express2.Router)();
shopsRouter.get("/", async (_req, res) => {
  try {
    const shops = await ShopModel.find().lean();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
shopsRouter.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const shop = await ShopModel.findOne({
      $or: [{ slug: identifier }, { id: identifier }]
    }).lean();
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
shopsRouter.post("/", async (req, res) => {
  try {
    const shopData = req.body;
    if (!shopData.id) {
      shopData.id = `shop-${Date.now()}`;
    }
    const newShop = await ShopModel.create(shopData);
    res.status(201).json(newShop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
shopsRouter.put("/:identifier", authenticateToken, requireSeller, async (req, res) => {
  try {
    const { identifier } = req.params;
    const shop = await ShopModel.findOne({
      $or: [{ id: identifier }, { slug: identifier }]
    });
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    if (req.user.role !== "admin" && req.user.shopId !== shop.id) {
      return res.status(403).json({ error: "Forbidden: You can only edit your own shop settings." });
    }
    const updated = await ShopModel.findOneAndUpdate(
      { id: shop.id },
      { $set: req.body },
      { new: true }
    ).lean();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/routes/products.ts
var import_express3 = require("express");
var productsRouter = (0, import_express3.Router)();
productsRouter.get("/", async (req, res) => {
  try {
    const { shopId, categoryId, status } = req.query;
    const filter = {};
    if (shopId) filter.shopId = shopId;
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;
    const products = await ProductModel.find(filter).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
productsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findOne({
      $or: [{ id }, { slug: id }]
    }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
productsRouter.post("/", authenticateToken, requireSeller, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `prod-${Date.now()}`;
    }
    if (req.user.role !== "admin" && req.user.shopId !== data.shopId) {
      return res.status(403).json({ error: "Forbidden: You can only create products for your own shop." });
    }
    if (data.stockQuantity !== void 0 && data.stock === void 0) {
      data.stock = data.stockQuantity;
    }
    const created = await ProductModel.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
productsRouter.put("/:id", authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ProductModel.findOne({ id });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (req.user.role !== "admin" && req.user.shopId !== existing.shopId) {
      return res.status(403).json({ error: "Forbidden: You can only edit products belonging to your shop." });
    }
    const updates = { ...req.body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    if (updates.stockQuantity !== void 0) {
      updates.stock = updates.stockQuantity;
    }
    const updated = await ProductModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
productsRouter.delete("/:id", authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ProductModel.findOne({ id });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (req.user.role !== "admin" && req.user.shopId !== existing.shopId) {
      return res.status(403).json({ error: "Forbidden: You can only delete products belonging to your shop." });
    }
    await ProductModel.findOneAndDelete({ id });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/routes/orders.ts
var import_express4 = require("express");

// server/models/Order.ts
var import_mongoose6 = __toESM(require("mongoose"), 1);
var OrderItemSchema = new import_mongoose6.Schema(
  {
    id: { type: String, required: true },
    productId: { type: String, required: true },
    productNameSnapshot: { type: String, required: true },
    unitPriceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    imageSnapshot: { type: String, default: "" }
  },
  { _id: false }
);
var OrderSchema = new import_mongoose6.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderCode: { type: String, required: true, unique: true, index: true },
    shopId: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true },
    customerCity: { type: String, required: true },
    customerNote: { type: String, default: "" },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "completed", "cancelled"],
      default: "pending"
    },
    createdAt: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString() },
    updatedAt: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString() }
  },
  {
    timestamps: true
  }
);
var OrderModel = import_mongoose6.default.models.Order || import_mongoose6.default.model("Order", OrderSchema);

// server/routes/orders.ts
var ordersRouter = (0, import_express4.Router)();
function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KAD-${code}`;
}
ordersRouter.get("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const filter = {};
    if (user.role === "admin") {
      if (req.query.shopId) filter.shopId = req.query.shopId;
      if (req.query.phone) filter.customerPhone = req.query.phone;
    } else if (user.role === "seller") {
      if (!user.shopId) {
        return res.status(403).json({ error: "Seller account is not linked to any shop." });
      }
      filter.shopId = user.shopId;
    } else {
      const customerPhone = req.query.phone;
      if (!customerPhone) {
        return res.json([]);
      }
      filter.customerPhone = customerPhone;
    }
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
ordersRouter.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const order = await OrderModel.findOne({
      $or: [{ orderCode: code.toUpperCase() }, { id: code }]
    }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found with this code" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
ordersRouter.post("/", async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    }
    if (!data.orderCode) {
      data.orderCode = generateOrderCode();
    }
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.productId && item.quantity > 0) {
          const product = await ProductModel.findOne({ id: item.productId });
          if (product) {
            const availableStock = product.stockQuantity ?? product.stock ?? 0;
            if (availableStock < item.quantity) {
              return res.status(400).json({
                error: `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`
              });
            }
          }
        }
      }
      for (const item of data.items) {
        if (item.productId && item.quantity > 0) {
          await ProductModel.findOneAndUpdate(
            { id: item.productId },
            {
              $inc: {
                stockQuantity: -item.quantity,
                stock: -item.quantity
              }
            }
          );
        }
      }
    }
    const created = await OrderModel.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
ordersRouter.put("/:id/status", authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existingOrder = await OrderModel.findOne({
      $or: [{ id }, { orderCode: id.toUpperCase() }]
    });
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (req.user.role !== "admin" && req.user.shopId !== existingOrder.shopId) {
      return res.status(403).json({ error: "Forbidden: You cannot modify orders for another shop." });
    }
    existingOrder.status = status;
    existingOrder.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await existingOrder.save();
    res.json(existingOrder.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/routes/categories.ts
var import_express5 = require("express");
var categoriesRouter = (0, import_express5.Router)();
categoriesRouter.get("/", async (_req, res) => {
  try {
    const categories = await CategoryModel.find().lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
categoriesRouter.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `cat-${Date.now()}`;
    }
    const created = await CategoryModel.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
categoriesRouter.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CategoryModel.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
categoriesRouter.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CategoryModel.findOneAndDelete({ id }).lean();
    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/index.ts
import_dotenv2.default.config();
var app = (0, import_express6.default)();
var PORT = process.env.PORT || 5e3;
var allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000"
].filter(Boolean);
app.use(
  (0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);
app.use(import_express6.default.json({ limit: "10mb" }));
app.use(import_express6.default.urlencoded({ limit: "10mb", extended: true }));
app.get("/api/health", (_req, res) => {
  const status = getDbStatus();
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: {
      type: "MongoDB Atlas",
      connected: status.connected,
      readyState: status.readyState,
      name: status.name,
      host: status.host
    }
  });
});
app.use("/api/auth", authRouter);
app.use("/api/shops", shopsRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", categoriesRouter);
var distPath = import_path.default.resolve(process.cwd(), "dist");
app.use(import_express6.default.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  const indexPath = import_path.default.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});
var startServer = async () => {
  const connected = await connectDB();
  if (connected) {
    await seedDatabaseIfEmpty();
  }
  app.listen(PORT, () => {
    console.log(`\u{1F680} [Kadeo Express API] Listening on port ${PORT}`);
    console.log(`\u{1F4E1} [Health Endpoint] http://localhost:${PORT}/api/health`);
  });
};
startServer();
