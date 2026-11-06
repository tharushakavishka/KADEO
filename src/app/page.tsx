"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Menu,
  X,
  MessageCircle,
  Package,
  Receipt,
  Cpu,
  Zap,
  CreditCard,
  Star,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  Store,
  Printer,
  Truck,
  Layers,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Smartphone,
  Sparkles,
  Bot,
  BadgePercent,
  Wallet,
} from "lucide-react";
import s from "./home.module.css";

const themeShowcases = [
  {
    id: "fashion",
    name: "Amarasri Hearath Boutique",
    sinhalaName: "දේශීය අත්කම් & විලාසිතා එකතුව",
    category: "Fashion & Batik",
    tagline: "High-converting Linen & Batik store with instant WhatsApp checkout.",
    heroImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    product: "Pure Linen Shirt",
    price: "LKR 3,850",
  },
  {
    id: "spices",
    name: "Ceylon Spices Store",
    sinhalaName: "Premium Island Spices",
    category: "Organic Spices & Tea",
    tagline: "Pure Ceylon Alba Cinnamon and artisan black tea from Matale.",
    heroImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    product: "Ceylon Cinnamon 100g",
    price: "LKR 1,250",
  },
  {
    id: "crafts",
    name: "Handicrafts Gallery",
    sinhalaName: "Sri Lankan Handicrafts",
    category: "Handmade Pottery & Crafts",
    tagline: "Traditional handcrafted terracotta and eco-friendly home decors.",
    heroImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    product: "Terracotta Vase",
    price: "LKR 1,450",
  },
];

const features = [
  {
    icon: MessageCircle,
    image: "/images/img02.png",
    title: "Instant WhatsApp Orders",
    tag: "MOST POPULAR",
    badgeColor: "bg-emerald-100 text-emerald-800",
    text: "Customer භාණ්ඩ තෝරා Checkout කළ සැණින්, සම්පූර්ණ Order විස්තරය WhatsApp එකට පැමිණේ.",
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    icon: Receipt,
    image: "/images/img03.png",
    title: "80mm Digital Thermal Receipts",
    tag: "KADEO EXCLUSIVE",
    badgeColor: "bg-blue-100 text-blue-800",
    text: "ඔබේ වෙළෙඳසලට ගැලපෙන ලෙස Custom Thermal Receipt image එකක් පාරිභෝගිකයාට share කරන්න.",
    iconColor: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    icon: Wallet,
    image: "/images/img04.png",
    title: "Bank Slip Upload & COD",
    tag: "ZERO COMMISSION",
    badgeColor: "bg-amber-100 text-amber-800",
    text: "Bank Slip verification සහ Cash on Delivery (COD) පහසුකම.",
    iconColor: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    icon: Truck,
    image: "/images/img05.png",
    title: "Automated Courier Tracking",
    tag: "6+ COURIERS",
    badgeColor: "bg-emerald-100 text-emerald-800",
    text: "Domex, Koombiyo, PromptX, SL Post වැනි courier partners සමග live tracking.",
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    icon: Cpu,
    image: "/images/img06.png",
    title: "AI Discovery Protocol",
    tag: "NEXT-GEN AI",
    badgeColor: "bg-purple-100 text-purple-800",
    text: "ඔබේ නිෂ්පාදන AI Platforms මඟින් සොයාගැනීමට optimize කර ඇත.",
    iconColor: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    icon: Smartphone,
    image: "/images/img07.png",
    title: "Mobile-First 360px Layout",
    tag: "SUPER FAST",
    badgeColor: "bg-teal-100 text-teal-800",
    text: "Mobile users සඳහා වේගවත්, conversion-optimized layout.",
    iconColor: "text-teal-600 bg-teal-50 border-teal-200",
  },
];

const processSteps = [
  {
    number: "01",
    icon: Store,
    title: "ගිණුමක් සාදන්න",
    desc: "Kadeo වෙත account එකක් ආරම්භ කරන්න.",
  },
  {
    number: "02",
    icon: Layers,
    title: "Theme එක තෝරන්න",
    desc: "ඔබට ගැලපෙන store theme එකක් තෝරන්න.",
  },
  {
    number: "03",
    icon: Package,
    title: "නිෂ්පාදන එකතු කරන්න",
    desc: "ඔබේ නිෂ්පාදන, මිල, stock එකතු කරන්න.",
  },
  {
    number: "04",
    icon: Zap,
    title: "Store එක Live කරන්න",
    desc: "විනාඩි කිහිපයකින් ඔබේ store එක publish කරන්න.",
  },
];

const testimonials = [
  {
    name: "Amarasri Hearath",
    category: "Fashion Boutique",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    quote:
      "Kadeo සමඟ අපේ online store එක ඉතා කෙටි කාලයකින් set up කළා. WhatsApp orders සහ courier tracking ඉතා පහසුයි.",
  },
  {
    name: "Ceylon Spices",
    category: "Food & Spices",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    quote:
      "80mm receipts එකක්, bank slip verification එකක් එක්ක අපේ order process එක ඉතා professional වෙනවා.",
  },
  {
    name: "Lanka Handicrafts",
    category: "Handicrafts & Gifts",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    quote:
      "සෝෂල් සහ ඇප්ස් වලින් පසු දියුණු වූ සියල්ලක්ම එකම තැනක තිබෙනවා. Support team එකත් ඉතාම හොඳයි!",
  },
];

const faqs = [
  {
    q: "Kadeo එකෙන් store එකක් හදන්නේ කොහොමද?",
    a: "ඔබගේ දුරකථනයෙන්ම හෝ පරිගණකයෙන් Register වී, කඩයේ නම සහ WhatsApp අංකය ලබා දී, විනාඩි 2ක් ඇතුළත භාණ්ඩ එකතු කර Store එක සජීවීව ආරම්භ කළ හැක.",
  },
  {
    q: "මට coding දැනුම අවශ්‍යද?",
    a: "නැත, කිසිදු Coding හෝ තාක්ෂණික දැනුමක් අවශ්‍ය නැත! සියල්ල ඉතා සරල පියවර මඟින් සකසා ගැනීමට හැකි පරිදි Kadeo නිර්මාණය කර ඇත.",
  },
  {
    q: "Bank Slip Verification එක කොහොමද වැඩ කරන්නේ?",
    a: "පාරිභෝගිකයා Checkout කිරීමේදී Direct Bank Transfer තෝරා Slip එක upload කරයි. Seller Dashboard එකෙන් එම Slip එක පරීක්ෂා කර තහවුරු කළ හැක.",
  },
  {
    q: "Domex / Koombiyo Courier Tracking එක සයිට් එකට සම්බන්ධ කරන්නේ කොහොමද?",
    a: "Order එක Dispatch කිරීමේදී ඔබගේ Waybill අංකය ඇතුළත් කළ සැණින්, Customer ට ලැබෙන Tracking Link එක හරහා සෘජුවම කුරියර් Tracking තත්ත්වය සජීවීව බලාගත හැක.",
  },
];

export default function MarketingHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);

  // Smooth scroll reveal animations via IntersectionObserver
  useEffect(() => {
    const elements = document.querySelectorAll(`.${s.reveal}, .${s.revealScale}`);
    if (!elements.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains(s.reveal)) {
              entry.target.classList.add(s.revealVisible);
            }
            if (entry.target.classList.contains(s.revealScale)) {
              entry.target.classList.add(s.revealScaleVisible);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        if (el.classList.contains(s.reveal)) el.classList.add(s.revealVisible);
        if (el.classList.contains(s.revealScale)) el.classList.add(s.revealScaleVisible);
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={s.page}>
      {/* Background Subtle Grid & Gentle Radial Tint */}
      <div className={`absolute inset-0 ${s.subtleGrid} opacity-40 pointer-events-none`} />
      <div className={`absolute inset-x-0 top-0 h-96 ${s.heroGradient} pointer-events-none`} />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-xs group-hover:scale-105 transition">
              <span className="w-5 h-5 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-bold">N</span>
            </span>
            <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
              kadeo<span className="text-emerald-600">.</span>
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold ml-1">
              v1.0 LK
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700">
            <a
              href="#features"
              className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              විශේෂාංග (Features)
            </a>
            <a
              href="#ai-discovery"
              className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              AI Discovery
            </a>
            <a
              href="#themes"
              className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Store Themes
            </a>
            <a
              href="#reviews"
              className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Seller අදහස්
            </a>
            <a
              href="#faqs"
              className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              FAQs
            </a>
            <Link
              href="/shop/amarasri-hearath"
              target="_blank"
              className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1 text-slate-800"
            >
              <span>Live Demo Store</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 transition"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-95"
            >
              <span className={s.sinhalaSans}>Store එකක් හදන්න</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-3 shadow-xl">
            <div className={`flex flex-col gap-2 font-medium text-slate-700 ${s.sinhalaSans}`}>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                විශේෂාංග (Features)
              </a>
              <a
                href="#ai-discovery"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                AI Discovery
              </a>
              <a
                href="#themes"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                Store Themes
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                Seller අදහස්
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                FAQs
              </a>
            </div>

            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100">
              <Link
                href="/shop/amarasri-hearath"
                className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold border border-slate-200"
              >
                Live Demo Store
              </Link>
              <Link
                href="/login"
                className="w-full text-center py-2.5 rounded-xl text-slate-700 text-sm font-semibold border border-slate-200"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                {/* Announcement Pill Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold shadow-xs ${s.reveal}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className={s.sinhalaSans}>ශ්‍රී ලංකාවේ ප්‍රථම AI-Ready E-Commerce Builder එක</span>
                  <span className="text-emerald-400">·</span>
                  <span className="text-emerald-700 font-extrabold">0% Sales Commission</span>
                </div>

                {/* Main Headline */}
                <h1
                  className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 ${s.sinhalaHeading} ${s.reveal} ${s.delay1}`}
                >
                  විනාඩි 2න් ඔබේම <br />
                  <span className="text-emerald-600">Online Store එකක්</span> හදන්න. <br />
                  <span className="text-slate-900">KADEO සමඟ ලංකාවටම විකුණන්න!</span>
                </h1>

                {/* Subtitle */}
                <p
                  className={`text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 ${s.sinhalaSans} ${s.reveal} ${s.delay2}`}
                >
                  ලංකාවේ සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාරිකයින් උදෙසාම,{" "}
                  <strong className="text-slate-900 font-bold">WhatsApp Direct Orders</strong>,{" "}
                  <strong className="text-slate-900 font-bold">Bank Slip Verification</strong>,{" "}
                  <strong className="text-slate-900 font-bold">80mm Digital Thermal Receipts</strong> සහ{" "}
                  <strong className="text-emerald-700 font-bold">Domex &amp; Koombiyo Live Courier Tracking</strong>{" "}
                  සහිතව ඔබේ ව්‍යාපාරයේ සැබෑ ප්‍රගති අත්වැල.
                </p>

                {/* CTA Action Buttons */}
                <div
                  className={`pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 ${s.reveal} ${s.delay3}`}
                >
                  <Link
                    href="/register"
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:scale-[1.02] active:scale-95 transition-all ${s.sinhalaSans}`}
                  >
                    <span>දැන්ම නොමිලේ Store එකක් හදන්න</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>

                  <Link
                    href="/shop/amarasri-hearath"
                    target="_blank"
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition hover:scale-[1.02] ${s.sinhalaSans}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Store Demo බලන්න</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div
                  className={`pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-600 font-medium ${s.sinhalaSans} ${s.reveal} ${s.delay4}`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Credit Card අවශ්‍ය නොවේ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>විනාඩි 2ක Setup</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Domex / Koombiyo Ready</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% සිංහල සහයෝගය</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High Fidelity Laptop & Smartphone Device Mockup */}
              <div className={`lg:col-span-6 relative ${s.revealScale} ${s.delay2}`}>
                {/* Floating Card: 80mm Thermal Receipt (Top Right) */}
                <div
                  className={`absolute -top-4 -right-2 sm:-right-4 z-20 rounded-2xl bg-white border border-slate-200/90 p-3 shadow-lg flex items-center gap-2.5 ${s.floatClean}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                    <Receipt className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">80mm Thermal Receipt</p>
                    <p className="text-[10px] text-blue-700 font-mono">1-Tap WhatsApp Image Share</p>
                  </div>
                </div>

                {/* Hero Showcase Image (img09) */}
                <div className="relative mx-auto max-w-lg w-full flex items-center justify-center py-2">
                  <img
                    src="/images/img09.png"
                    alt="KADEO Platform Showcase"
                    className="w-full h-auto max-h-[460px] object-contain drop-shadow-2xl transition hover:scale-[1.02] duration-500"
                  />
                </div>

                {/* Floating Card: New Order Toast (Bottom Right) */}
                <div
                  className={`absolute -bottom-6 -right-2 sm:-right-4 z-20 rounded-2xl bg-white border border-slate-200/90 p-3 shadow-lg flex items-center gap-3 ${s.floatCleanAlt}`}
                >
                  <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">New Order #KAD-8423</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">LKR 5,100 · Koombiyo Courier</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & STATS BAR */}
        <section className="border-y border-slate-200 bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {/* Stat 1 */}
              <div className={`p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 ${s.revealScale}`}>
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">1,500+</div>
                <p className={`text-xs font-bold text-slate-900 ${s.sinhalaSans}`}>සක්‍රීය ලාංකීය වෙළෙඳුන්</p>
                <p className="text-[11px] text-slate-500">Active Sri Lankan Sellers</p>
              </div>

              {/* Stat 2 */}
              <div className={`p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 ${s.revealScale} ${s.delay1}`}>
                <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">50,000+</div>
                <p className={`text-xs font-bold text-slate-900 ${s.sinhalaSans}`}>සාර්ථක ඇණවුම්</p>
                <p className="text-[11px] text-slate-500">Delivered Islandwide</p>
              </div>

              {/* Stat 3 */}
              <div className={`p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 ${s.revealScale} ${s.delay2}`}>
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">0%</div>
                <p className={`text-xs font-bold text-slate-900 ${s.sinhalaSans}`}>Sales Commission</p>
                <p className={`text-[11px] text-slate-500 ${s.sinhalaSans}`}>සම්පූර්ණ විකුණුම්වලට 0% කොමිස්</p>
              </div>

              {/* Stat 4 */}
              <div className={`p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1 ${s.revealScale} ${s.delay3}`}>
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">6+</div>
                <p className={`text-xs font-bold text-slate-900 ${s.sinhalaSans}`}>දේශීය කුරියර් Integration</p>
                <p className="text-[11px] text-slate-500">Domex, Koombiyo, PromptX, SL Post</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: STOREFRONT THEMES SHOWCASE */}
        <section id="themes" className="py-20 bg-slate-50/60 border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className={`text-center max-w-3xl mx-auto mb-14 space-y-3 ${s.reveal}`}>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                • WHY KADEO •
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight ${s.sinhalaHeading}`}>
                ඇයි KADEO ඔබේ ව්‍යාපාරයට <br />
                <span className="text-emerald-600">ලස්සන Storefront Themes එකක්!</span>
              </h2>
              <p className={`text-slate-600 text-xs sm:text-sm ${s.sinhalaSans}`}>
                ඔබේ නිෂ්පාදන වඩාත් ආකර්ෂණීය විදිහට පෙන්වන, Mobile-First, High-Converting Themes එකතුවක්.
              </p>
            </div>

            {/* Content: Left Features List + Right Theme Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Bullet Points & Button */}
              <div className={`lg:col-span-4 space-y-5 ${s.reveal}`}>
                <div className={`space-y-3.5 text-xs sm:text-sm font-semibold text-slate-700 ${s.sinhalaSans}`}>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>පහසුවෙන්ම ලස්සන Theme එකක් තෝරන්න</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ඔබේ වෙළෙඳපොළට ගැළපෙන Style</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mobile-First &amp; Fast Loading</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Code නොදැන තත්පරයෙන් ක්‍රියාත්මකයි</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/shop/amarasri-hearath"
                    target="_blank"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition ${s.sinhalaSans}`}
                  >
                    <span>සියලුම Themes බලන්න</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Theme Showcase Grid */}
              <div className={`lg:col-span-8 ${s.revealScale} ${s.delay1}`}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Big Main Card (Amarasri Hearath) */}
                  <div className="sm:col-span-7 rounded-3xl bg-white border border-slate-200 p-5 shadow-lg flex flex-col justify-between space-y-4 group">
                    <div className="h-44 sm:h-52 rounded-2xl overflow-hidden relative bg-slate-100">
                      <img
                        src={themeShowcases[0].heroImage}
                        alt="Amarasri Hearath Boutique"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                        <h4 className="text-base font-bold">{themeShowcases[0].name}</h4>
                        <p className={`text-xs text-slate-300 ${s.sinhalaSans}`}>{themeShowcases[0].sinhalaName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {themeShowcases[0].product} · {themeShowcases[0].price}
                      </span>
                      <Link
                        href="/shop/amarasri-hearath"
                        target="_blank"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs hover:bg-emerald-700 transition ${s.sinhalaSans}`}
                      >
                        <span>මෙම Theme එක බලන්න</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* 2 Smaller Cards Column */}
                  <div className="sm:col-span-5 flex flex-col gap-4">
                    {/* Card 2: Ceylon Spices */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xs hover:shadow-md transition group">
                      <div className="h-24 rounded-xl overflow-hidden mb-2 bg-slate-100">
                        <img
                          src={themeShowcases[1].heroImage}
                          alt="Ceylon Spices"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">{themeShowcases[1].name}</h5>
                      <p className="text-[10px] text-slate-500">{themeShowcases[1].sinhalaName}</p>
                    </div>

                    {/* Card 3: Handicrafts Gallery */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xs hover:shadow-md transition group">
                      <div className="h-24 rounded-xl overflow-hidden mb-2 bg-slate-100">
                        <img
                          src={themeShowcases[2].heroImage}
                          alt="Handicrafts Gallery"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">{themeShowcases[2].name}</h5>
                      <p className="text-[10px] text-slate-500">{themeShowcases[2].sinhalaName}</p>
                    </div>
                  </div>
                </div>

                {/* Carousel navigation dots & arrows */}
                <div className="flex items-center justify-center gap-2 pt-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: SELLER MANAGEMENT & DASHBOARD MOCKUP */}
        <section className="py-20 bg-white border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Descriptions & Feature Cards */}
              <div className={`lg:col-span-6 space-y-5 ${s.reveal}`}>
                <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                  • ඔබේ ව්‍යාපාරය වඩාත් පහසුවෙන් •
                </span>

                <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight ${s.sinhalaHeading}`}>
                  KADEO සමග ඔබේ විකුණුම්, ඇණවුම් සහ ලැබීම් සරලව කළමනාකරණය කරන්න.
                </h2>

                <p className={`text-slate-600 text-xs sm:text-sm leading-relaxed ${s.sinhalaSans}`}>
                  ඔබේ ව්‍යාපාරයේ සියලුම තොරතුරු එකම උපකරණපුවරුවකින් විශ්ලේෂණය කරන්න, ඉතාම ආයාසකර තොරතුරු සියල්ල සරලවෙන්.
                </p>

                {/* 3 Action Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <h5 className="text-xs font-bold text-slate-900">Real-time Sales</h5>
                    <p className={`text-[10px] text-slate-500 ${s.sinhalaSans}`}>විකුණුම් වාර්තා</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h5 className="text-xs font-bold text-slate-900">Order Management</h5>
                    <p className={`text-[10px] text-slate-500 ${s.sinhalaSans}`}>ඇණවුම් කළමනාකරණය</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <h5 className="text-xs font-bold text-slate-900">Payments &amp; COD</h5>
                    <p className={`text-[10px] text-slate-500 ${s.sinhalaSans}`}>ගෙවීම් සහ COD</p>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Laptop Computer Image (img08.png) */}
              <div className={`lg:col-span-6 flex justify-center ${s.revealScale}`}>
                <div className="relative mx-auto max-w-xl w-full">
                  <img
                    src="/images/img08.png"
                    alt="KADEO Seller Dashboard Management Laptop Mockup"
                    className="w-full h-auto object-contain block drop-shadow-xl hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: 80MM DIGITAL THERMAL RECEIPTS & WHATSAPP ORDER SHARING */}
        <section className="py-20 bg-slate-50/70 border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Copy & CTA */}
              <div className={`lg:col-span-6 space-y-5 ${s.reveal}`}>
                <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                  • වෙළඳ සන්නිවේදනය &amp; Order Sharing •
                </span>

                <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight ${s.sinhalaHeading}`}>
                  80mm Digital Thermal Receipts &amp; <br />
                  <span className="text-emerald-600">WhatsApp Order Sharing</span>
                </h2>

                <p className={`text-slate-600 text-xs sm:text-sm leading-relaxed ${s.sinhalaSans}`}>
                  තත්පරයෙන් 80mm digital thermal receipt generator එකකින් professional receipts ලැබෙන්න සලස්වන්න. Order විස්තරයක් WhatsApp එකෙන් පාරිභෝගිකයාට පහසුවෙන් share කරන්න.
                </p>

                <div className="pt-2">
                  <Link
                    href="/shop/amarasri-hearath"
                    target="_blank"
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition ${s.sinhalaSans}`}
                  >
                    <span>නියැදුම පරීක්ෂා කරන්න</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </div>

              {/* Right Column: High Quality Thermal Receipt & WhatsApp Order Showcase Image */}
              <div className={`lg:col-span-6 flex items-center justify-center ${s.revealScale} ${s.delay1}`}>
                <div className={`w-full max-w-lg ${s.orderSharingImageCard}`}>
                  <img
                    src="/images/img01.png"
                    alt="80mm Thermal Receipt Generator and WhatsApp Order Sharing Showcase"
                    className="w-full h-auto object-cover block"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: CORE FEATURES (6-CARD GRID) */}
        <section id="features" className="py-20 bg-white border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className={`text-center max-w-3xl mx-auto mb-16 space-y-3 ${s.reveal}`}>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                • WHY KADEO IS BETTER •
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight ${s.sinhalaHeading}`}>
                ඇයි KADEO ඔබට වඩා හොඳද?
              </h2>
              <p className={`text-slate-600 text-xs sm:text-sm ${s.sinhalaSans}`}>
                ශ්‍රී ලංකාවේ ව්‍යාපාරිකයින්ට අවශ්‍යම සියලුම features එකම තැනක.
              </p>
            </div>

            {/* 6-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, index) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={index}
                    className={`rounded-3xl bg-white border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group ${s.revealScale}`}
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/80 p-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          {feat.image ? (
                            <img
                              src={feat.image}
                              alt={feat.title}
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className={`w-full h-full rounded-xl flex items-center justify-center border ${feat.iconColor}`}>
                              <IconComp className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${feat.badgeColor}`}>
                          {feat.tag}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">
                        {feat.title}
                      </h3>
                      <p className={`text-xs text-slate-600 leading-relaxed ${s.sinhalaSans}`}>{feat.text}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                      <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS (4 STEPS CONNECTED WITH ARROWS) */}
        <section id="process" className="py-20 bg-slate-50/60 border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className={`text-center max-w-3xl mx-auto mb-16 space-y-3 ${s.reveal}`}>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                • HOW IT WORKS •
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight ${s.sinhalaHeading}`}>
                KADEO සමඟ Store එක හදන්නේ කොහොමද?
              </h2>
              <p className={`text-slate-600 text-xs sm:text-sm ${s.sinhalaSans}`}>
                විනාඩි කිහිපයකින් ඔබේම online store එකක් මෙහෙයුම්.
              </p>
            </div>

            {/* 4 Process Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {processSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative group hover:border-emerald-300 transition ${s.revealScale}`}
                  >
                    <div>
                      {/* Top icon and number */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                          <StepIcon className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black font-mono text-emerald-700">{step.number}</span>
                      </div>

                      <h3 className={`text-sm font-bold text-slate-900 mb-1.5 ${s.sinhalaHeading}`}>{step.title}</h3>
                      <p className={`text-xs text-slate-600 leading-relaxed ${s.sinhalaSans}`}>{step.desc}</p>
                    </div>

                    {/* Connecting arrow for larger screens */}
                    {idx < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs text-xs font-bold">
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION: AI DISCOVERY SUITE */}
        <section id="ai-discovery" className="py-20 bg-white border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-14 border border-slate-800 shadow-xl ${s.revealScale}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Info */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>• KADEO AI DISCOVERY SUITE •</span>
                  </div>

                  <h2 className={`text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight ${s.sinhalaHeading}`}>
                    KADEO AI Discovery Suite <br />
                    <span className="text-emerald-400">ChatGPT සහ Gemini මුල්පෙළේ ඔබේ නිෂ්පාදන සොයාගන්න!</span>
                  </h2>

                  <p className={`text-slate-300 text-xs sm:text-sm leading-relaxed ${s.sinhalaSans}`}>
                    AI-Optimized product data, structured content සහ discovery protocols මඟින් ඔබේ නිෂ්පාදන ChatGPT, Gemini ඇතුළු AI platforms වල දිස්වේ. තවදුරටත් සාමාන්‍ය සෙවුම් වලට පමණක් සීමා නොවන්න.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href="/register"
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition ${s.sinhalaSans}`}
                    >
                      <span>දැන්ම Store එකට සම්බන්ධ කරගන්න</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </Link>

                    <Link
                      href="/shop/amarasri-hearath/llms.txt"
                      target="_blank"
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition ${s.sinhalaSans}`}
                    >
                      <span>Live Demo බලන්න</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Mock Schema with Purple AI badge */}
                <div className="lg:col-span-5 relative">
                  {/* Purple Floating AI Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-lg z-10">
                    AI
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-xs shadow-inner space-y-2">
                    <p className="text-slate-400 font-bold text-[11px] pb-1 border-b border-slate-800">
                      AI Discovery (Product Schema)
                    </p>
                    <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`{
  "name": "Pure Linen Shirt",
  "brand": "Amarasri Hearath",
  "price": "LKR 3,850",
  "availability": "In Stock",
  "discoverable_by": ["ChatGPT", "Gemini", "AI"]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: SELLER TESTIMONIALS */}
        <section id="reviews" className="py-20 bg-slate-50/70 border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className={`text-center max-w-3xl mx-auto mb-16 space-y-3 ${s.reveal}`}>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                • සතුටුදායක SELLERS •
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight ${s.sinhalaHeading}`}>
                ප්‍රීතිමත් KADEO Sellers ගැන
              </h2>
              <p className={`text-slate-600 text-xs sm:text-sm ${s.sinhalaSans}`}>
                ශ්‍රී ලංකාවේ විවිධ ප්‍රදේශවල ව්‍යාපාරිකයින් Kadeo භාවිත කරන්නේ කෙසේදැයි විමසන්න.
              </p>
            </div>

            {/* Testimonials 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 ${s.revealScale}`}
                >
                  <div className="space-y-3">
                    {/* 5 Stars */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>

                    <p className={`text-xs text-slate-700 leading-relaxed italic ${s.sinhalaSans}`}>
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                      <p className="text-[10px] text-slate-500">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: COMPARISON MATRIX */}
        <section className="py-20 bg-white border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-14 space-y-3 ${s.reveal}`}>
              <span className={`inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 ${s.sinhalaSans}`}>
                • COMPARISON •
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight ${s.sinhalaHeading}`}>
                සමාජ මාධ්‍ය විකුණුම් සහ KADEO store එක අතර වෙනස?
              </h2>
            </div>

            {/* Comparison Table */}
            <div className={`overflow-x-auto rounded-2xl border border-slate-200 shadow-xs ${s.revealScale}`}>
              <table className={`w-full text-left text-xs border-collapse ${s.sinhalaSans}`}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-4">විශේෂාංග / Feature</th>
                    <th className="p-4 text-slate-600">Social Media Selling (FB / IG)</th>
                    <th className="p-4 text-emerald-800 bg-emerald-50 font-extrabold">KADEO Online Store</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Store එකක් තිබීම</td>
                    <td className="p-4 text-rose-600 font-medium">❌ නොපවතී, අඩු consistency</td>
                    <td className="p-4 font-bold text-emerald-700 bg-emerald-50/50">✓ Professional, branded store</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Order කළමනාකරණය</td>
                    <td className="p-4 text-rose-600 font-medium">❌ Manual (chat messages)</td>
                    <td className="p-4 font-bold text-emerald-700 bg-emerald-50/50">✓ Centralized order system</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">ගෙවීම් පියවීම</td>
                    <td className="p-4 text-rose-600 font-medium">❌ Bank details share manually</td>
                    <td className="p-4 font-bold text-emerald-700 bg-emerald-50/50">✓ Bank slip verification + COD</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Courier Tracking</td>
                    <td className="p-4 text-rose-600 font-medium">❌ Manually update</td>
                    <td className="p-4 font-bold text-emerald-700 bg-emerald-50/50">✓ Automated tracking (Domex/Koombiyo)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">AI Discovery (ChatGPT / Gemini)</td>
                    <td className="p-4 text-rose-600 font-medium">❌ නැත (Not available)</td>
                    <td className="p-4 font-bold text-emerald-700 bg-emerald-50/50">✓ AI-Ready &amp; discoverable</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Sales Commission</td>
                    <td className="p-4 text-rose-600 font-medium">❌ කොමිෂන් ඇත (Often high)</td>
                    <td className="p-4 font-bold text-emerald-700 bg-emerald-50/50">✓ 0% Sales Commission</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION: FREQUENTLY ASKED QUESTIONS */}
        <section id="faqs" className="py-20 bg-slate-50/60 border-b border-slate-200 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Heading */}
              <div className={`lg:col-span-5 space-y-3 ${s.reveal}`}>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-800">
                  FREQUENTLY ASKED QUESTIONS
                </span>
                <h2 className={`text-3xl font-extrabold text-slate-900 ${s.sinhalaHeading}`}>
                  නිතර ඇසෙන ප්‍රශ්න (FAQ)
                </h2>
                <p className={`text-slate-600 text-xs ${s.sinhalaSans}`}>
                  ශ්‍රී ලාංකික විකුණුම්කරුවන් නිතරම අසන ප්‍රශ්න.
                </p>
              </div>

              {/* Right Column: Accordion */}
              <div className="lg:col-span-7 space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all ${
                        isOpen ? "bg-white border-emerald-300 shadow-xs" : "bg-white border-slate-200 hover:border-slate-300"
                      } ${s.reveal}`}
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className={`text-xs sm:text-sm font-bold text-slate-900 ${s.sinhalaHeading}`}>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className={`px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 ${s.sinhalaSans}`}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PRE-FOOTER ROCKET CTA BANNER */}
        <section className="py-16 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 ${s.revealScale}`}>
              {/* Left Bag Icon */}
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center shrink-0">
                <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  N
                </span>
              </div>

              {/* Middle Content */}
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className={`text-xl sm:text-2xl font-black ${s.sinhalaHeading}`}>
                  දැන්ම සමග Store එක සාදාගෙන අලෙවිය ආරම්භ කරන්න!
                </h3>
                <p className={`text-xs sm:text-sm text-emerald-400 font-bold ${s.sinhalaSans}`}>
                  Kadeo සමඟ විනාඩි කිහිපයකින් Online Store එකක් සාදන්න.
                </p>
                <p className={`text-[11px] text-slate-400 ${s.sinhalaSans}`}>
                  0% Sales Commission, ඉක්මන් WhatsApp ඇණවුම්, AI discovery - සියල්ල එකම තැනක.
                </p>

                <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    href="/register"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition ${s.sinhalaSans}`}
                  >
                    <span>දැන්ම Store එකක් නොමිලේ හදන්න</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </Link>

                  <Link
                    href="/shop/amarasri-hearath"
                    target="_blank"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition ${s.sinhalaSans}`}
                  >
                    <span>Live Demo බලන්න</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Rocket Graphic */}
              <div className="text-5xl sm:text-6xl shrink-0 select-none animate-bounce">
                🚀
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
            {/* Col 1: Brand */}
            <div className="lg:col-span-2 space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  N
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight font-sans">
                  kadeo<span className="text-emerald-600">.</span>
                </span>
              </Link>
              <p className={`text-xs text-slate-500 max-w-sm leading-relaxed ${s.sinhalaSans}`}>
                ශ්‍රී ලංකාවේ ව්‍යාපාරිකයින්ට විශේෂයෙන්ම සකස් කළ Modern E-Commerce Platform.
              </p>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Product</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li><a href="#features" className="hover:text-emerald-700 transition">Features</a></li>
                <li><a href="#themes" className="hover:text-emerald-700 transition">Store Themes</a></li>
                <li><a href="#ai-discovery" className="hover:text-emerald-700 transition">AI Discovery</a></li>
                <li><Link href="/shop/amarasri-hearath/llms.txt" className="hover:text-emerald-700 transition">llms.txt</Link></li>
              </ul>
            </div>

            {/* Col 3: For Sellers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">For Sellers</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li><Link href="/register" className="hover:text-emerald-700 transition">Pricing</Link></li>
                <li><Link href="/register" className="hover:text-emerald-700 transition">Create a Store</Link></li>
                <li><a href="#process" className="hover:text-emerald-700 transition">Seller Guide</a></li>
              </ul>
            </div>

            {/* Col 4: Support */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Support</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li><a href="#faqs" className="hover:text-emerald-700 transition">Help Center</a></li>
                <li><a href="tel:+94720566566" className="hover:text-emerald-700 transition">Contact Us</a></li>
                <li><a href="#faqs" className="hover:text-emerald-700 transition">Report an Issue</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>Made for Sri Lankan Businesses 💚 | English / සිංහල</div>
            <div>© {new Date().getFullYear()} Kadeo Technologies. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
