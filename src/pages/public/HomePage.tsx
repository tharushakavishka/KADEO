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
  Check,
  HelpCircle,
  ChevronDown,
  Instagram,
  Facebook,
} from 'lucide-react';
import { ReelmarkHero } from '../../components/home/ReelmarkHero';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
          1. REELMARK INTERACTIVE CURVED VIDEO HERO SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <ReelmarkHero
        badgeText="Trusted by 120,000+ indie makers"
        headlineLine1="Captivate Crowds"
        headlineLine2="with Snackable Reels"
        subline={[
          'Grow your brand with short, snappy product clips by',
          'our handpicked video makers. Our crew is ready to',
          'lift your next launch higher.',
        ]}
        ctaText="Make a Reel"
        ctaLink="/seller/register"
        note1Text={'Be seen\nwith clips'}
        note2Text="Zero cost"
      />

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
