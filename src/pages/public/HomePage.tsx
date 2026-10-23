import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Palette,
  Package,
  Truck,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Lock,
  Check,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  Instagram,
  Facebook,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [storeSlug, setStoreSlug] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCreateStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
    if (cleanSlug) {
      navigate(`/seller/register?shop=${encodeURIComponent(cleanSlug)}`);
    } else {
      navigate('/seller/register');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const features = [
    {
      icon: Store,
      title: 'Your Own Store Link',
      desc: 'Get your unique branded URL (e.g. kadeo.lk/shop/your-brand) ready to share on Instagram, TikTok, and Facebook bio.',
    },
    {
      icon: MessageCircle,
      title: 'Direct WhatsApp Orders',
      desc: 'Customers place orders with 1-click on WhatsApp with product names, SKU, and delivery address pre-filled.',
    },
    {
      icon: Palette,
      title: 'Full Storefront Design Control',
      desc: 'Customize your hero banner, cover media, welcome pill tags, headlines, and floating badges with zero code.',
    },
    {
      icon: Package,
      title: 'Smart Inventory & Orders',
      desc: 'Real-time stock decrement, low-stock warnings, and order status tracking from Packed to Out for Delivery.',
    },
    {
      icon: Truck,
      title: 'Built for Sri Lankan Commerce',
      desc: 'Full support for Cash on Delivery (COD), Islandwide Courier coverage, and direct bank transfer instructions.',
    },
    {
      icon: Smartphone,
      title: '100% Mobile Optimized',
      desc: 'Looks and feels like a luxury mobile app on every phone, with responsive bottom navigation and fast gallery swipe.',
    },
  ];

  const steps = [
    {
      n: '01',
      title: 'Name Your Store',
      desc: 'Pick your boutique name and claim your free store link in 30 seconds. No credit card required.',
    },
    {
      n: '02',
      title: 'Add Your Products',
      desc: 'Upload high-resolution photos, set your price in LKR, and organize pieces into categories.',
    },
    {
      n: '03',
      title: 'Start Getting Orders',
      desc: 'Share your store link on social media. Receive verified orders straight into WhatsApp and your dashboard.',
    },
  ];

  const showcaseStores = [
    {
      name: 'Ceylon Linen Co.',
      category: 'Fashion & Apparel',
      desc: 'Clean minimal aesthetics, custom linen lookbook, and direct WhatsApp checkout.',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      link: '/shop/ceylon-linen',
    },
    {
      name: 'Glow & Grace',
      category: 'Beauty & Cosmetics',
      desc: 'Skincare highlights, floating trust badges, and appointment coordination.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      link: '/shop/glow-and-grace',
    },
    {
      name: 'UrbanPulse Tech',
      category: 'Modern Tech & Accessories',
      desc: 'Dark modern theme, specifications checklist, and fast courier dispatch badges.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      link: '/shop/urbanpulse-tech',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free Starter',
      price: 'Rs. 0',
      period: 'forever',
      description: 'Ideal for independent makers and new side-hustles starting online.',
      features: [
        'Up to 5 products',
        'Direct WhatsApp ordering',
        'Standard Minimal theme',
        'Islandwide courier support',
        '0% commission on orders',
      ],
      buttonText: 'Start for Free',
      popular: false,
    },
    {
      name: 'Boutique Pro',
      price: 'Rs. 1,490',
      period: '/ month',
      description: 'For growing retail brands that need custom styling and more items.',
      features: [
        'Up to 50 products',
        'Full Hero Section Customizer',
        'All 3 Luxury Themes (Minimal, Beauty, Modern)',
        'Order & Customer CRM directory',
        'Priority Sri Lankan seller support',
        '0% commission on orders',
      ],
      buttonText: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise Brand',
      price: 'Rs. 2,990',
      period: '/ month',
      description: 'For established ateliers, flagship boutiques, and volume sellers.',
      features: [
        'Unlimited products',
        'Custom domain setup',
        'Video hero banners & custom badges',
        'Advanced sales analytics',
        'Dedicated onboarding manager',
        '0% commission on orders',
      ],
      buttonText: 'Get Started Pro',
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'Can I link my Kadeo store to Instagram and TikTok?',
      a: 'Yes! Simply copy your dedicated store link (e.g. kadeo.lk/shop/your-name) and paste it into your Instagram bio, TikTok profile, or WhatsApp Business catalogue.',
    },
    {
      q: 'Can I edit my storefront banner and colors later?',
      a: 'Yes, anytime. Your Seller Dashboard includes a visual Shop Design Studio where you can change background images, headlines, text toggles, and badge visibility with instant live preview.',
    },
    {
      q: 'Does Kadeo charge commission on my orders?',
      a: 'No. Kadeo charges 0% commission on every order, so you keep 100% of your earnings. You only pay if you choose to upgrade to a paid plan.',
    },
    {
      q: 'Do I need web design or coding skills to create my website?',
      a: 'None at all. Kadeo is built so any boutique owner or artisan can launch a professional, mobile-ready online store in less than 2 minutes using simple form inputs.',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 font-sans antialiased selection:bg-[#10B981] selection:text-white">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (Matching User Design Specification)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-transparent py-16 sm:py-24 border-b border-[#E5E7EB]">
        {/* Soft Radial Mint Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E7EB] px-3.5 py-1.5 text-xs font-semibold text-[#047857] shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px]">
                  <Sparkles className="h-3 w-3" />
                </span>
                <span>Sri Lanka's #1 eCommerce Platform for Sellers</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-[-0.04em] text-neutral-950 leading-[1.05]">
                  Build Your Own{' '}
                  <span className="relative inline-block text-[#10B981]">
                    Online Store
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200 -z-10"
                      viewBox="0 0 300 12"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 8c60-6 140-8 296-2"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>{' '}
                  in Minutes.
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed max-w-xl pt-2">
                  The easiest way for Sri Lankan brands, boutiques, and creators to sell online.
                  Get a dedicated store link, accept orders directly on WhatsApp, and manage your inventory with zero coding.
                </p>
              </div>

              {/* Claim Store Link Form */}
              <div className="pt-2">
                <form
                  onSubmit={handleCreateStoreSubmit}
                  className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs max-w-xl transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10"
                >
                  <label className="flex-1 flex items-center gap-1 px-3 py-2 bg-[#F8F8F5] border border-neutral-200/60 rounded-xl text-xs sm:text-sm text-neutral-500 font-medium cursor-text">
                    <span className="select-none font-semibold text-neutral-400">
                      kadeo.lk/shop/
                    </span>
                    <input
                      type="text"
                      value={storeSlug}
                      onChange={e =>
                        setStoreSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                        )
                      }
                      placeholder="your-shop-name"
                      maxLength={30}
                      className="w-full bg-transparent font-bold text-neutral-900 focus:outline-none placeholder:text-neutral-400 placeholder:font-normal"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>Create Your Free Shop</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Micro Perks */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#10B981] stroke-[2.5]" />
                    Free forever tier
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#10B981] stroke-[2.5]" />
                    Zero technical setup
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#10B981] stroke-[2.5]" />
                    Ready in 2 minutes
                  </span>
                </div>
              </div>

              {/* Secondary CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[#E5E7EB] bg-white hover:border-neutral-400 text-xs sm:text-sm font-semibold text-neutral-800 shadow-2xs transition-all"
                >
                  <span>How Kadeo Works</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
                </a>

                <Link
                  to="/shop/ceylon-linen"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[#E5E7EB] bg-white hover:border-neutral-400 text-xs sm:text-sm font-semibold text-neutral-800 shadow-2xs transition-all"
                >
                  <span>View Sample Storefront</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/seller/login"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-[#10B981] transition-colors py-2"
                >
                  <span>Seller Login</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E5E7EB]">
                <div>
                  <b className="block text-2xl font-black text-neutral-950 tracking-tight">0%</b>
                  <span className="text-xs text-neutral-500">Commission on orders</span>
                </div>
                <div>
                  <b className="block text-2xl font-black text-neutral-950 tracking-tight">2 min</b>
                  <span className="text-xs text-neutral-500">Average setup time</span>
                </div>
                <div>
                  <b className="block text-2xl font-black text-neutral-950 tracking-tight">COD + Bank</b>
                  <span className="text-xs text-neutral-500">Local payment ready</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Multi-Device Preview Showcase */}
            <div className="lg:col-span-6 relative w-full overflow-hidden sm:overflow-visible">
              <div className="relative mx-auto max-w-[500px] w-full h-[480px] sm:h-[540px] md:h-[580px]">
                {/* Floating Chip 1: New WhatsApp Order */}
                <div className="absolute top-2 left-2 sm:-left-6 lg:-left-8 z-30 bg-white border border-[#E5E7EB] rounded-2xl p-2.5 sm:p-3 shadow-sm flex items-center gap-2.5 sm:gap-3 anim-float max-w-[90%] sm:max-w-none">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                      <b className="text-[11px] sm:text-xs font-bold text-neutral-900">New WhatsApp Order!</b>
                    </div>
                    <small className="text-[10px] sm:text-[11px] text-neutral-500">
                      Rs. 6,800 • Relaxed Resort Shirt
                    </small>
                  </div>
                </div>

                {/* Browser Mockup */}
                <div className="absolute top-8 left-0 right-4 sm:right-10 md:right-12 bg-white rounded-2xl border border-[#E5E7EB] shadow-md overflow-hidden -rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F8F5] border-b border-[#E5E7EB]">
                    <div className="flex gap-1.5">
                      <i className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                      <i className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                      <i className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg py-1 px-3 text-[11px] font-mono text-neutral-500 shadow-2xs">
                      <Lock className="h-3 w-3 text-[#10B981]" />
                      <span>kadeo.lk/shop/ceylon-linen</span>
                    </div>
                  </div>

                  {/* Storefront Nav */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight text-neutral-900">
                      Ceylon Linen Co.
                    </span>
                    <div className="flex gap-3 text-[11px] font-medium text-neutral-500">
                      <span>New</span>
                      <span>Shirts</span>
                      <span>Bags</span>
                    </div>
                  </div>

                  {/* Storefront Hero */}
                  <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-[#EFE9DC] to-[#E4DDCA] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center overflow-hidden">
                    <div className="sm:col-span-7 space-y-1">
                      <span className="inline-block text-[9px] font-bold tracking-wider text-[#047857] bg-white/80 px-2 py-0.5 rounded">
                        PURE LINEN TAILORING
                      </span>
                      <h4 className="text-lg font-black text-neutral-950 leading-tight">
                        Look Good.<br />Feel Cool.
                      </h4>
                      <p className="text-[11px] text-neutral-700 leading-snug">
                        Handcrafted Sri Lankan resort wear tailored for the tropical climate.
                      </p>
                      <span className="inline-flex items-center gap-1 bg-neutral-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg mt-2">
                        Shop Collection <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="sm:col-span-5 flex justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80"
                        alt="Resort Shirt"
                        className="h-28 w-28 rounded-xl object-cover shadow-md"
                      />
                    </div>
                  </div>

                  {/* Storefront Mini Products */}
                  <div className="px-3 pb-3">
                    <div className="flex justify-between items-center text-[11px] font-bold text-neutral-800 mb-2 px-1">
                      <span>Featured Collection</span>
                      <span className="text-[#10B981]">Direct Checkout →</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-1.5 border border-neutral-100 rounded-xl bg-white shadow-2xs">
                        <img
                          src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80"
                          alt="Resort Shirt"
                          className="w-full aspect-square rounded-lg object-cover mb-1"
                        />
                        <b className="block text-[10px] font-bold truncate">Resort Shirt</b>
                        <span className="text-[10px] font-bold text-[#10B981]">Rs. 6,800</span>
                      </div>
                      <div className="p-1.5 border border-neutral-100 rounded-xl bg-white shadow-2xs">
                        <img
                          src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80"
                          alt="Carry Tote"
                          className="w-full aspect-square rounded-lg object-cover mb-1"
                        />
                        <b className="block text-[10px] font-bold truncate">Carry Tote</b>
                        <span className="text-[10px] font-bold text-[#10B981]">Rs. 3,850</span>
                      </div>
                      <div className="p-1.5 border border-neutral-100 rounded-xl bg-white shadow-2xs">
                        <img
                          src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&q=80"
                          alt="Linen Spray"
                          className="w-full aspect-square rounded-lg object-cover mb-1"
                        />
                        <b className="block text-[10px] font-bold truncate">Linen Spray</b>
                        <span className="text-[10px] font-bold text-[#10B981]">Rs. 1,950</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Mockup Showing WhatsApp Confirmation */}
                <div className="absolute right-0 bottom-2 sm:bottom-4 w-44 sm:w-52 md:w-56 bg-neutral-950 rounded-[30px] sm:rounded-[34px] p-1.5 sm:p-2 shadow-2xl z-20 rotate-2 sm:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-[#EFE9E0] rounded-[24px] sm:rounded-[26px] overflow-hidden flex flex-col h-[320px] sm:h-[350px]">
                    {/* WhatsApp Header */}
                    <div className="bg-[#075E54] text-white px-3 py-3 sm:py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#075E54] font-black text-[10px] flex items-center justify-center">
                        CL
                      </div>
                      <div>
                        <b className="text-[11px] block leading-none">Ceylon Linen Co.</b>
                        <small className="text-[9px] opacity-80">online</small>
                      </div>
                    </div>

                    {/* WhatsApp Chat Body */}
                    <div className="flex-1 p-2.5 space-y-2 text-[10px] overflow-hidden bg-[#EFE9E0]">
                      <div className="bg-[#D9FDD3] p-2 rounded-lg rounded-tr-none shadow-xs text-neutral-800 leading-tight">
                        <strong className="block font-bold text-[#075E54] text-[9.5px]">
                          Order via Kadeo
                        </strong>
                        Resort Shirt (SKU CL-014)<br />
                        Size: M × 1<br />
                        Rs. 6,800 • COD<br />
                        Deliver: Colombo 07
                        <span className="block text-right text-[8px] text-neutral-500 mt-1">12:41 ✓✓</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-xs text-neutral-800 leading-tight">
                        Thank you! Your order is confirmed 🎉 Packing now.
                        <span className="block text-right text-[8px] text-neutral-500 mt-1">12:42</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-xs text-neutral-800 leading-tight">
                        Courier dispatch tomorrow morning.
                        <span className="block text-right text-[8px] text-neutral-500 mt-1">12:42</span>
                      </div>
                    </div>

                    {/* Chat Input Pill */}
                    <div className="p-2 bg-[#EFE9E0]">
                      <div className="bg-white rounded-full py-1.5 px-3 text-[9px] text-neutral-400">
                        Type a message
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Chip 2: 100% Direct Sales */}
                <div className="absolute bottom-4 left-2 sm:-left-4 lg:-left-6 z-30 bg-white border border-[#E5E7EB] rounded-2xl p-2.5 sm:p-3 shadow-sm flex items-center gap-2.5 sm:gap-3 max-w-[90%] sm:max-w-none">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <b className="text-[11px] sm:text-xs font-bold text-neutral-900 block">100% Direct Sales</b>
                    <small className="text-[10px] sm:text-[11px] text-neutral-500">
                      0% Commission on WhatsApp
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. CHANNELS STRIP (Benefits for Social Media Sellers)
      ────────────────────────────────────────────────────────────────────────── */}
      <div id="benefits" className="border-b border-[#E5E7EB] bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-x-10 gap-y-3 flex-wrap text-sm text-neutral-500">
          <p className="font-semibold text-neutral-700">
            Sell everywhere your customers already are:
          </p>
          <span className="inline-flex items-center gap-2 font-bold text-neutral-800">
            <MessageCircle className="h-4 w-4 text-[#10B981]" /> WhatsApp
          </span>
          <span className="inline-flex items-center gap-2 font-bold text-neutral-800">
            <Instagram className="h-4 w-4 text-pink-600" /> Instagram
          </span>
          <span className="inline-flex items-center gap-2 font-bold text-neutral-800">
            <Smartphone className="h-4 w-4 text-neutral-900" /> TikTok
          </span>
          <span className="inline-flex items-center gap-2 font-bold text-neutral-800">
            <Facebook className="h-4 w-4 text-blue-600" /> Facebook
          </span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. FEATURES SECTION (Stop Losing Orders in DMs)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#E5E7EB]">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
            Everything You Need to Succeed Online
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
            Stop Losing Orders in Social Media DMs.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Kadeo transforms your scattered Instagram DMs, TikTok comments, and phone calls into an automated, elegant online shop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F8F8F5] border border-[#E5E7EB] text-[#10B981] flex items-center justify-center mb-6 group-hover:bg-[#10B981] group-hover:text-white group-hover:border-[#10B981] transition-colors duration-300">
                  <Icon className="h-6 w-6 stroke-[2]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. 3-STEP ONBOARDING
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-[#F0F1ED]/40 backdrop-blur-xs border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Simple & Fast Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              From Idea to First Sale in 3 Steps
            </h2>
            <p className="text-sm sm:text-base text-neutral-600">
              No technical expertise needed. You can set up your store directly from your mobile phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-[#E5E7EB] p-8 shadow-xs flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
              >
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-sm mb-6 ring-8 ring-emerald-500/10 shadow-2xs">
                    {st.n}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-bold text-[#10B981]">
                  <span>Step {idx + 1} of 3</span>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/seller/register"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Get Started Now — It's Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. STOREFRONT SHOWCASE
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Storefront Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight mt-1">
              Beautiful Stores Built on Kadeo
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Every seller gets a customized, responsive storefront tailored to their niche.
            </p>
          </div>

          <Link
            to="/shop/ceylon-linen"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#10B981] hover:underline"
          >
            <span>View Ceylon Linen Live Store</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {showcaseStores.map((st, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="relative h-60 overflow-hidden bg-neutral-100">
                <span className="absolute top-3.5 left-3.5 z-10 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-neutral-800 border border-[#E5E7EB] shadow-2xs">
                  {st.category}
                </span>
                <img
                  src={st.image}
                  alt={st.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {st.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pb-2">
                  {st.desc}
                </p>
                <Link
                  to={st.link}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#10B981] group-hover:translate-x-1 transition-transform"
                >
                  <span>Preview Storefront</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. PRICING PLANS
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-24 bg-[#F0F1ED]/40 backdrop-blur-xs border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Simple Plans for Every Stage of Your Business
            </h2>
            <p className="text-sm sm:text-base text-neutral-600">
              No hidden fees. 0% commission on orders. Keep 100% of your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[#111613] text-white shadow-md ring-2 ring-[#10B981] scale-100 md:scale-[1.02] relative'
                    : 'bg-white border border-[#E5E7EB] text-neutral-900 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#10B981] text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
                  <p
                    className={`text-xs mt-1.5 min-h-[40px] leading-relaxed ${
                      plan.popular ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="my-6 pb-6 border-b border-neutral-200/20 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                    <span
                      className={`text-sm font-medium ${
                        plan.popular ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3.5 text-xs sm:text-sm">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            plan.popular ? 'text-emerald-400' : 'text-[#10B981]'
                          } stroke-[2.5]`}
                        />
                        <span className={plan.popular ? 'text-neutral-200' : 'text-neutral-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/seller/register"
                    className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-98 ${
                      plan.popular
                        ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-900/30'
                        : 'bg-[#111111] hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. FAQ ACCORDION
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#E5E7EB]">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-emerald-300 bg-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:border-neutral-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center gap-3.5 p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-neutral-900 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#10B981]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed pl-16">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. BOTTOM HERO CTA (Radiant Dark Mesh Card)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-6xl mx-auto rounded-[32px] bg-[#111613] text-white p-10 sm:p-14 lg:p-16 text-center relative overflow-hidden border border-emerald-950/60 shadow-md">
          {/* Subtle Radiant Mesh Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Join Sri Lanka's Modern Merchant Community</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Open Your Online Store Today?
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto leading-relaxed">
              It takes less than 2 minutes to claim your store link, upload your collection, and start selling across Sri Lanka.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/seller/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Create Your Store for Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/shop/ceylon-linen"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/15 transition-all"
              >
                <span>View Live Demo</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
