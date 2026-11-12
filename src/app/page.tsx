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
    id: "saloon",
    name: "Sachi Saloon & Beauty Care",
    sinhalaName: "ස්වභාවික රූපලාවණ්‍ය සහ කෙස් සත්කාර එකතුව",
    category: "Salons & Cosmetics",
    tagline: "Modern Retail Theme with instant WhatsApp checkout and direct shopping bag.",
    heroImage: "https://images.unsplash.com/photo-1608248597359-5613532b4b42?auto=format&fit=crop&w=800&q=80",
    product: "Herbal Hair Care Oil 100ml",
    price: "LKR 1,500",
    badge: "LIVE ACTIVE STORE",
    link: "/shop/sachi-saloon",
  },
  {
    id: "spices",
    name: "Ceylon Spices & Tea Store",
    sinhalaName: "පිරිසිදු කුළුබඩු සහ අපනයන තේ නිෂ්පාදන",
    category: "Organic Spices & Tea",
    tagline: "Minimal Theme with clean pouch sizing, transparent pricing, and courier rates.",
    heroImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    product: "Ceylon Cinnamon 100g",
    price: "LKR 1,250",
    badge: "POPULAR THEME",
    link: "/shop/sachi-saloon",
  },
  {
    id: "fashion",
    name: "Amarasri Hearath Boutique",
    sinhalaName: "දේශීය අත්කම් සහ පිරිසිදු ලිනන් විලාසිතා",
    category: "Fashion & Batik",
    tagline: "Shop App Theme with high-contrast imagery and 80mm digital thermal slips.",
    heroImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    product: "Pure Linen Shirt",
    price: "LKR 3,850",
    badge: "HIGH CONVERSION",
    link: "/shop/sachi-saloon",
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="relative min-h-screen bg-white">

      {/* TOP FLOATING NAVIGATION BAR */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2 sm:py-2.5" : "py-3 sm:py-4"
        } px-3 sm:px-6 lg:px-8`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-2xl sm:rounded-full transition-all duration-300 px-4 sm:px-6 ${
            scrolled ? "h-15 sm:h-16" : "h-16 sm:h-18"
          } flex items-center justify-between gap-4 border ${
            scrolled
              ? "bg-white/95 backdrop-blur-2xl border-slate-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
              : "bg-white/85 backdrop-blur-xl border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)]"
          }`}
        >
          {/* Brand & Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/5 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-300 border border-emerald-500/20 group-hover:border-emerald-500/40 shrink-0 overflow-hidden">
              <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                kadeo<span className="text-emerald-500">.</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Capsule Island) */}
          <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-full bg-slate-100/80 border border-slate-200/70 backdrop-blur-md shadow-inner shadow-slate-900/[0.02]">
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all duration-200"
            >
              විශේෂාංග (Features)
            </a>
            <a
              href="#ai-discovery"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all duration-200"
            >
              AI Discovery
            </a>
            <a
              href="#themes"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all duration-200"
            >
              Store Themes
            </a>
            <a
              href="#reviews"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all duration-200"
            >
              Seller අදහස්
            </a>
            <a
              href="#faqs"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all duration-200"
            >
              FAQs
            </a>
            <Link
              href="/shop/sachi-saloon"
              target="_blank"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 hover:text-emerald-950 border border-emerald-200/80 flex items-center gap-1.5 transition-all duration-200 shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Store</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-xs font-bold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-full hover:bg-slate-100/90 border border-transparent hover:border-slate-200/70 transition-all duration-200"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden"
            >
              <span className={s.sinhalaSans}>Store එකක් හදන්න</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 backdrop-blur-md transition-all cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Floating Card */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className={`flex flex-col gap-1 font-medium text-slate-700 ${s.sinhalaSans}`}>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3.5 rounded-xl hover:bg-slate-50 hover:text-emerald-700 font-semibold text-sm transition flex items-center justify-between"
              >
                <span>විශේෂාංග (Features)</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#ai-discovery"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3.5 rounded-xl hover:bg-slate-50 hover:text-emerald-700 font-semibold text-sm transition flex items-center justify-between"
              >
                <span>AI Discovery</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#themes"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3.5 rounded-xl hover:bg-slate-50 hover:text-emerald-700 font-semibold text-sm transition flex items-center justify-between"
              >
                <span>Store Themes</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3.5 rounded-xl hover:bg-slate-50 hover:text-emerald-700 font-semibold text-sm transition flex items-center justify-between"
              >
                <span>Seller අදහස්</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3.5 rounded-xl hover:bg-slate-50 hover:text-emerald-700 font-semibold text-sm transition flex items-center justify-between"
              >
                <span>FAQs</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
            </div>

            <div className="pt-3 flex flex-col gap-2.5 border-t border-slate-100">
              <Link
                href="/shop/sachi-saloon"
                target="_blank"
                className="w-full text-center py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-200/80 transition flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Store Demo (Sachi Saloon)</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link
                href="/login"
                className="w-full text-center py-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 text-sm font-bold border border-slate-200 transition"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">

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

        {/* SECTION: STOREFRONT THEMES SHOWCASE (WHY KADEO) */}
        <section id="themes" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 border-b border-slate-200/90 relative overflow-hidden">
          {/* Subtle background glow decorative elements */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold tracking-wider uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>WHY KADEO E-COMMERCE</span>
              </div>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight ${s.sinhalaHeading}`}>
                ඇයි KADEO ඔබේ ව්‍යාපාරයට <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                  වඩාත්ම ගැළපෙන E-Commerce වේදිකාව?
                </span>
              </h2>
              <p className={`text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${s.sinhalaSans}`}>
                Social media chat (FB / Instagram DMs) වලට වඩා 3x ගුණයක වේගවත් WhatsApp checkout එකක් සහිත, ලංකාවේ ඕනෑම online seller කෙනෙකුට ගැළපෙන නවීන Storefronts.
              </p>
            </div>

            {/* Category / Theme Switcher Pill Bar */}
            <div className="flex items-center justify-center mb-10">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner">
                {themeShowcases.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThemeIndex(idx)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                      activeThemeIndex === idx
                        ? "bg-white text-emerald-950 shadow-md border border-emerald-200/60 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{ backgroundColor: activeThemeIndex === idx ? "#059669" : "#94a3b8" }}
                    />
                    <span>{t.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
              {/* Left Column: Live Showcase Interactive Card */}
              <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div>
                  {/* Floating Micro Badge Header */}
                  <div className="flex items-center justify-between mb-4 z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {themeShowcases[activeThemeIndex].badge}
                      </span>
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        • {themeShowcases[activeThemeIndex].category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 font-mono">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mobile Ready 360px</span>
                    </div>
                  </div>

                  {/* Hero Showcase Frame with Glass Badges */}
                  <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 bg-slate-900 group-hover:shadow-2xl transition-all duration-500">
                    <img
                      src={themeShowcases[activeThemeIndex].heroImage}
                      alt={themeShowcases[activeThemeIndex].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Floating Live Product Badge */}
                    <div className="absolute top-4 left-4 backdrop-blur-md bg-white/95 border border-white/50 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-900">{themeShowcases[activeThemeIndex].product}</span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {themeShowcases[activeThemeIndex].price}
                      </span>
                    </div>

                    {/* Bottom Text Over Image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                        {themeShowcases[activeThemeIndex].name}
                      </h3>
                      <p className={`text-xs text-emerald-200/90 font-medium ${s.sinhalaSans}`}>
                        {themeShowcases[activeThemeIndex].sinhalaName}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {themeShowcases[activeThemeIndex].tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Instant WhatsApp Checkout</div>
                      <div className="text-[11px] text-slate-500">Customer adds to cart &amp; sends order in 1 tap</div>
                    </div>
                  </div>

                  <Link
                    href={themeShowcases[activeThemeIndex].link}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#031d16] hover:bg-emerald-950 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition group/btn cursor-pointer"
                  >
                    <span>Live Store බලන්න</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 4 Key Value Drivers (Why Kadeo vs FB/IG/Others) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
                {/* Driver 1: 0% Sales Commission */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex items-start gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                    <BadgePercent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">0% Sales Commission</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        100% ලාභය
                      </span>
                    </div>
                    <p className={`text-xs text-slate-600 leading-relaxed ${s.sinhalaSans}`}>
                      විකුණුම් මත කිසිදු ප්‍රතිශතයක් හෝ කොමිස් මුදලක් අය නොකෙරේ. ඔබ උපයන සම්පූර්ණ මුදල සෘජුවම ඔබටම හිමිවේ.
                    </p>
                  </div>
                </div>

                {/* Driver 2: Automated 80mm Digital Thermal Receipts */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex items-start gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                    <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">80mm Digital Thermal Receipts</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        EXCLUSIVE
                      </span>
                    </div>
                    <p className={`text-xs text-slate-600 leading-relaxed ${s.sinhalaSans}`}>
                      ඔබේම ලාංඡනය සහිත මුද්‍රිත රිසිට්පතක් (Thermal Slip) වැනි image එකක් පාරිභෝගිකයාට සහ courier හට 1-click එකෙන් share කළ හැක.
                    </p>
                  </div>
                </div>

                {/* Driver 3: Direct Bank Slip Upload & COD */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group flex items-start gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">Bank Slip Upload &amp; COD</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        VERIFIED
                      </span>
                    </div>
                    <p className={`text-xs text-slate-600 leading-relaxed ${s.sinhalaSans}`}>
                      පාරිභෝගිකයාගෙන් Bank Slip එක upload කරවාගෙන Dashboard එකෙන්ම verified mark කිරීම සහ Cash on Delivery කළමනාකරණය.
                    </p>
                  </div>
                </div>

                {/* Driver 4: Automated Courier Tracking */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group flex items-start gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 group-hover:scale-105 transition-transform">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">Automated Courier Tracking</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        6+ COURIERS
                      </span>
                    </div>
                    <p className={`text-xs text-slate-600 leading-relaxed ${s.sinhalaSans}`}>
                      Domex, Koombiyo, PromptX සහ SL Post Waybill එක ඇතුළත් කළ සැණින් Customer ට සජීවී Tracking link එකක් ලබා දේ.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 4-Metric Sri Lankan Performance Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
              <div className="text-center sm:text-left space-y-1">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">1.2s</div>
                <div className="text-xs font-bold text-slate-200">Ultra-fast Mobile Loading</div>
                <div className={`text-[10px] text-slate-400 ${s.sinhalaSans}`}>Dialog / Mobitel 4G වලදීද සුපිරි වේගයක්</div>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">3.4x</div>
                <div className="text-xs font-bold text-slate-200">Higher Order Conversion</div>
                <div className={`text-[10px] text-slate-400 ${s.sinhalaSans}`}>FB/IG chat වලට වඩා ඉක්මන් orders</div>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">LKR 0</div>
                <div className="text-xs font-bold text-slate-200">Zero Transaction Fees</div>
                <div className={`text-[10px] text-slate-400 ${s.sinhalaSans}`}>සැඟවුණු ගාස්තු හෝ කොමිස් නැත</div>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">&lt; 2 Mins</div>
                <div className="text-xs font-bold text-slate-200">Store Setup Time</div>
                <div className={`text-[10px] text-slate-400 ${s.sinhalaSans}`}>Coding නැතිව දුරකථනයෙන්ම ආරම්භය</div>
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
                <span className="w-8 h-8 rounded-lg bg-slate-100 p-1 flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                  <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain" />
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
