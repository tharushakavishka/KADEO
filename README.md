# KADEO — Multi-Tenant SaaS E-Commerce Platform

Kadeo is a mobile-first SaaS platform designed for Sri Lankan small businesses and online sellers. It allows merchants to create their own online store, showcase products with custom themes, and receive direct customer orders through WhatsApp with 0% platform commission.

---

## 🚀 Core Features

- **Public Marketing Site**: Clean, responsive homepage highlighting value proposition for Sri Lankan merchants.
- **Seller Authentication**: Supabase SSR authentication (Email/Password, Google OAuth, Protected Route Proxy).
- **Storefront Onboarding**: Unique slug generator (`kadeo.lk/shop/[slug]`) with validation preventing reserved names.
- **Mobile-First Seller Dashboard**:
  - Live metric statistics (Products, Orders, Pending, Completed, Customers).
  - Product & Inventory CRUD with image support and stock tracking.
  - Category management with storefront sorting.
  - Order management with real-time status transitions (`pending`, `confirmed`, `processing`, `shipped`, `completed`, `cancelled`).
  - Stock cancellation safety: restoring inventory only once on order cancellation.
  - Customer directory with direct WhatsApp contact buttons.
  - Storefront design switcher supporting 3 built-in themes.
  - Store settings (WhatsApp dispatch number, description, delivery information, public visibility).
  - Subscription management with flat-rate 0% commission plans.
- **Dynamic Customer Storefront**:
  - 3 predefined themes: **Minimal Store**, **Modern Boutique**, **Classic Shop**.
  - Shop-isolated shopping cart (preventing cross-shop item mixing).
  - WhatsApp-first checkout: order code generation (`KAD-YYYY-XXXXXX`), atomic database order placement, stock decrement, and official `wa.me` message formatting.
- **Super Admin Console**:
  - Platform overview (`/admin`) with merchant store management and status suspension/activation controls.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **Validation**: Zod
- **Forms**: React Server Actions & React Hook Form

---

## 📁 Project Structure

```
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── (auth)/         # /login, /register, /forgot-password
│   │   ├── admin/          # Platform administrator console
│   │   ├── dashboard/      # Seller management portal
│   │   ├── shop/[slug]/    # Dynamic public customer storefronts
│   │   ├── auth/callback/  # Supabase OAuth / email session exchange
│   │   ├── layout.tsx      # Root application layout
│   │   └── page.tsx        # Public marketing landing page
│   ├── components/
│   │   ├── dashboard/      # Dashboard navigation & layout components
│   │   └── storefront/     # Cart drawer, headers, and 3 store themes
│   ├── features/           # Modular server actions (auth, shops, products, categories, orders)
│   ├── lib/
│   │   ├── supabase/       # SSR browser, server, admin & proxy helpers
│   │   └── utils.ts        # Currency formatting (LKR), slug generation, class merging
│   └── types/              # Database schema TypeScript types
└── supabase/
    └── migrations/         # PostgreSQL schema, indexes, RLS, & atomic checkout RPC
```

---

## ⚙️ Getting Started

### 1. Environment Variables

Create `.env.local` using `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Database Migration

Run the migration script located in `supabase/migrations/20261105000000_initial_schema.sql` inside your Supabase SQL Editor. This sets up:
- Profiles, Shops, Settings, Categories, Products, Images, Customers, Orders, Order Items, Plans, Subscriptions, Admin Logs.
- Strict Row Level Security (RLS) policies enforcing multi-tenant isolation.
- `create_checkout_order` atomic PostgreSQL function preventing stock overselling.

### 3. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the marketing site or create your store.

---

## 🔒 Security & Multi-Tenancy

- **Row Level Security (RLS)** is enabled on all tables containing merchant data.
- Ownership checks (`auth.uid() = owner_id`) are enforced at the database level and verified in Server Actions.
- Client requests cannot spoof `shop_id`.
- Product prices and available inventory are re-validated on the server during checkout.
