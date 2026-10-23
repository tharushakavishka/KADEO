import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  CheckCircle2,
  Check,
  Lock,
  MessageCircle,
  CreditCard,
  Building2,
  User,
  Phone,
  MapPin,
  Edit2,
  Clock,
  X,
  LogIn,
} from 'lucide-react';
import { OrderItem } from '../../types';

const POPULAR_CITIES = [
  'Colombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Kurunegala',
  'Negombo',
  'Matara',
  'Kalutara',
];

const PRESET_GOOGLE_ACCOUNTS = [
  { name: 'Kasun Perera', email: 'kasun.perera@gmail.com' },
  { name: 'Dharshana Wickramasinghe', email: 'dharshana@gmail.com' },
  { name: 'Dilini Senanayake', email: 'dilini.sena@gmail.com' },
];

/** Google Multi-color G Icon */
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const CheckoutPage: React.FC = () => {
  const { items, itemsByShop, clearCart } = useCart();
  const { currentUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Multi-step checkout state: 1: Delivery -> 2: Payment -> 3: Confirm
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'card'>('cod');

  // Google Sign-In Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState('Kasun Perera');
  const [googleEmail, setGoogleEmail] = useState('kasun.perera@gmail.com');

  // Update when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) setCustomerName(currentUser.name);
      if (currentUser.phone && !customerPhone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const shopIds = Object.keys(itemsByShop);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#71717A] mb-4">
          <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h1 className="text-xl font-extrabold text-[#0F0F11]">Your bag is empty</h1>
        <p className="mt-2 text-xs text-[#71717A]">
          Add pieces to your bag before proceeding to checkout.
        </p>
        <Link
          to="/search"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0F0F11] px-5 py-2.5 text-xs font-bold text-white shadow-luxury-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Browse Marketplace</span>
        </Link>
      </div>
    );
  }

  const shopCount = shopIds.length;
  const totalSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFeePerShop = deliveryMethod === 'express' ? 650 : 350;
  const totalDeliveryFee = deliveryFeePerShop * (shopCount > 0 ? shopCount : 1);
  const grandTotal = totalSubtotal + totalDeliveryFee;
  const shopNames = shopIds.map(id => itemsByShop[id]?.shop?.name).filter(Boolean);

  const handleGoogleSignInConfirm = (nameToUse?: string, emailToUse?: string) => {
    const finalName = (nameToUse || googleName).trim() || 'Google User';
    const finalEmail = (emailToUse || googleEmail).trim().toLowerCase();
    if (!finalEmail) return;

    const user = loginWithGoogle({
      name: finalName,
      email: finalEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=10B981&color=fff&bold=true`,
    });

    if (user) {
      setCustomerName(user.name);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy.auth;
      return copy;
    });

    setIsGoogleModalOpen(false);
  };

  const validateDelivery = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Mandatory Google Sign-In requirement before placing order
    if (!currentUser) {
      errs.auth = 'Please sign in with Google to place your order and enable real-time tracking.';
      setIsGoogleModalOpen(true);
      setErrors(errs);
      return false;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'Please enter your full recipient name.';
    }

    const cleanPhone = customerPhone.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+94|0)?7\d{8}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      errs.customerPhone = 'Please enter a valid Sri Lankan mobile number (e.g. 077 123 4567).';
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      errs.deliveryAddress = 'Please enter your street address, house/flat number, or landmark.';
    }

    if (!customerCity.trim()) {
      errs.customerCity = 'Please enter or select your delivery city or district.';
    }

    // Verify stock availability across all shops and items
    for (const item of items) {
      const freshProd = StorageService.getProductById(item.product.id);
      if (!freshProd) {
        errs.stock = `Product "${item.product.name}" is no longer available.`;
        break;
      }
      if (freshProd.stockQuantity < item.quantity) {
        errs.stock = `Insufficient stock for "${item.product.name}". Only ${freshProd.stockQuantity} available (you requested ${item.quantity}).`;
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!currentUser) {
      setIsGoogleModalOpen(true);
      return;
    }
    if (validateDelivery()) {
      setErrors({});
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProceedToConfirm = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;

    if (!currentUser) {
      setIsGoogleModalOpen(true);
      return;
    }

    if (!validateDelivery()) {
      setCurrentStep(1);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const ordersPayload = shopIds.map(sId => {
        const group = itemsByShop[sId];
        const orderItems: OrderItem[] = group.items.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: item.product.id,
          productNameSnapshot: item.product.name,
          unitPriceSnapshot: item.product.price,
          quantity: item.quantity,
          lineTotal: item.product.price * item.quantity,
          imageSnapshot: item.product.images[0] || '',
        }));

        const shopDeliveryFee = deliveryFeePerShop;
        const shopSubtotal = group.subtotal;
        const shopTotal = shopSubtotal + shopDeliveryFee;

        return {
          orderCode: StorageService.generateOrderCode(),
          shopId: group.shop.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          customerCity: customerCity.trim(),
          customerNote: customerNote.trim() || undefined,
          items: orderItems,
          subtotal: shopSubtotal,
          deliveryFee: shopDeliveryFee,
          total: shopTotal,
          status: 'pending' as const,
        };
      });

      // Atomic batch order creation: either ALL boutique orders succeed or NONE are created
      const createdOrders = StorageService.createOrdersBatch(ordersPayload);

      // Clear the cart across all shops
      clearCart();

      // Navigate to success page with comma-separated order codes
      navigate(`/order-success/${createdOrders.map(o => o.orderCode).join(',')}`);
    } catch (err: any) {
      console.error('Failed to create orders', err);
      setErrors({ submit: err?.message || 'Failed to place order. Please check stock availability and try again.' });
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Interactive Stepper Header */}
      <div className="bg-white border-b border-neutral-200/80 py-3.5 px-4 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as 1 | 2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate(-1);
              }
            }}
            className="p-1.5 -ml-1 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Stepper Steps */}
          <div className="flex items-center gap-2 sm:gap-4 select-none">
            {/* Step 1: Delivery */}
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                currentStep === 1
                  ? 'text-[#10B981]'
                  : currentStep > 1
                  ? 'text-neutral-800 hover:text-[#10B981]'
                  : 'text-neutral-400'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 1
                    ? 'bg-[#10B981] text-white'
                    : currentStep === 1
                    ? 'bg-[#10B981] text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {currentStep > 1 ? <Check className="h-3 w-3 stroke-[3]" /> : '1'}
              </span>
              <span>Delivery</span>
            </button>

            <span className="text-neutral-300">·</span>

            {/* Step 2: Payment */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setIsGoogleModalOpen(true);
                  return;
                }
                if (validateDelivery()) {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                currentStep === 2
                  ? 'text-[#10B981] font-bold'
                  : currentStep > 2
                  ? 'text-neutral-800 font-bold hover:text-[#10B981] cursor-pointer'
                  : 'text-neutral-400 cursor-pointer'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep > 2
                    ? 'bg-[#10B981] text-white'
                    : currentStep === 2
                    ? 'bg-[#10B981] text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {currentStep > 2 ? <Check className="h-3 w-3 stroke-[3]" /> : '2'}
              </span>
              <span>Payment</span>
            </button>

            <span className="text-neutral-300">·</span>

            {/* Step 3: Confirm */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setIsGoogleModalOpen(true);
                  return;
                }
                if (validateDelivery()) {
                  setCurrentStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                currentStep === 3
                  ? 'text-[#10B981] font-bold'
                  : 'text-neutral-400'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 3
                    ? 'bg-[#10B981] text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                3
              </span>
              <span>Confirm</span>
            </button>
          </div>

          <div className="w-5" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stock Errors */}
            {errors.stock && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5 shadow-luxury-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errors.stock}</span>
              </div>
            )}

            {/* Submit Errors */}
            {errors.submit && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-luxury-xs">
                {errors.submit}
              </div>
            )}

            {/* Google Authentication Alert Banner if user attempted to proceed without signing in */}
            {errors.auth && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-luxury-xs">
                <div className="flex items-center gap-2.5">
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span className="font-bold">{errors.auth}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="rounded-xl bg-neutral-900 text-white font-bold px-3.5 py-1.5 text-xs hover:bg-black transition-colors shrink-0 cursor-pointer"
                >
                  Sign In Now
                </button>
              </div>
            )}

            {/* ================= STEP 1: DELIVERY ================= */}
            {currentStep === 1 && (
              <div className="space-y-6 anim-fade-in">
                {/* ──────────────────────────────────────────────────────────
                    CUSTOMER GOOGLE SIGN-IN SECTION (MANDATORY BEFORE ORDER)
                   ────────────────────────────────────────────────────────── */}
                {!currentUser ? (
                  <div className="rounded-3xl border border-neutral-300/80 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <GoogleIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-extrabold text-neutral-900">
                              Sign in with Google Required
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Fast Checkout
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                            Please sign in with your Google account before ordering. Your name, email, and live order status will be linked automatically.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsGoogleModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 hover:text-black px-5 py-3 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-98"
                      >
                        <GoogleIcon className="w-4 h-4" />
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Verified Google User Badge Card */
                  <div className="rounded-3xl border border-emerald-200 bg-[#EAF7EE]/50 p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-neutral-900 truncate">
                            Signed in as {currentUser.name}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Verified Customer</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGoogleModalOpen(true)}
                      className="text-xs font-bold text-[#10B981] hover:underline shrink-0 cursor-pointer"
                    >
                      Switch Account
                    </button>
                  </div>
                )}

                {/* Recipient Details & Phone */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 shadow-luxury-xs">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
                    <User className="w-4 h-4 text-[#10B981]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                      1. Recipient Contact Info
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Full Recipient Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => {
                          setCustomerName(e.target.value);
                          if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                        }}
                        placeholder="e.g. Kasun Perera"
                        className={`w-full rounded-2xl border bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-900 focus:outline-none focus:bg-white transition-colors ${
                          errors.customerName ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.customerName && (
                        <p className="text-[11px] text-rose-600 font-medium">{errors.customerName}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => {
                          setCustomerPhone(e.target.value);
                          if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: '' }));
                        }}
                        placeholder="e.g. 077 123 4567"
                        className={`w-full rounded-2xl border bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-900 focus:outline-none focus:bg-white transition-colors ${
                          errors.customerPhone ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.customerPhone ? (
                        <p className="text-[11px] text-rose-600 font-medium">{errors.customerPhone}</p>
                      ) : (
                        <p className="text-[10px] text-neutral-400">Used for courier delivery updates & dispatch notifications</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address Card */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 shadow-luxury-xs">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
                    <MapPin className="w-4 h-4 text-[#10B981]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                      2. Delivery Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Street Address / House No. / Apartment <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={e => {
                          setDeliveryAddress(e.target.value);
                          if (errors.deliveryAddress) setErrors(prev => ({ ...prev, deliveryAddress: '' }));
                        }}
                        placeholder="e.g. No. 45/2, Galle Road, Kollupitiya"
                        className={`w-full rounded-2xl border bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-900 focus:outline-none focus:bg-white transition-colors ${
                          errors.deliveryAddress ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.deliveryAddress && (
                        <p className="text-[11px] text-rose-600 font-medium">{errors.deliveryAddress}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        City / District <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerCity}
                        onChange={e => {
                          setCustomerCity(e.target.value);
                          if (errors.customerCity) setErrors(prev => ({ ...prev, customerCity: '' }));
                        }}
                        placeholder="e.g. Colombo, Kandy, Gampaha, Galle"
                        className={`w-full rounded-2xl border bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-900 focus:outline-none focus:bg-white transition-colors ${
                          errors.customerCity ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-[#10B981]'
                        }`}
                      />
                      {errors.customerCity && (
                        <p className="text-[11px] text-rose-600 font-medium">{errors.customerCity}</p>
                      )}

                      {/* Quick City Suggestion Pills */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 mr-1">Popular:</span>
                        {POPULAR_CITIES.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCustomerCity(c);
                              if (errors.customerCity) setErrors(prev => ({ ...prev, customerCity: '' }));
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              customerCity.toLowerCase() === c.toLowerCase()
                                ? 'bg-[#10B981] text-white shadow-xs'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-neutral-600">
                        Delivery Notes or Special Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={customerNote}
                        onChange={e => setCustomerNote(e.target.value)}
                        placeholder="e.g. Call before delivery, leave near main gate"
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-2 px-3.5 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#10B981]"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Method Selection */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-4 shadow-luxury-xs">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
                    <Truck className="w-4 h-4 text-[#10B981]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                      3. Delivery Speed
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label
                      onClick={() => setDeliveryMethod('standard')}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        deliveryMethod === 'standard'
                          ? 'border-[#10B981] bg-[#EAF7EE]/40 ring-1 ring-[#10B981] shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'standard'}
                        onChange={() => setDeliveryMethod('standard')}
                        className="mt-0.5 accent-[#10B981]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900">Standard Courier</span>
                          <span className="text-xs font-black text-neutral-900">Rs. 350</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">2 – 3 working days islandwide</p>
                      </div>
                    </label>

                    <label
                      onClick={() => setDeliveryMethod('express')}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        deliveryMethod === 'express'
                          ? 'border-[#10B981] bg-[#EAF7EE]/40 ring-1 ring-[#10B981] shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'express'}
                        onChange={() => setDeliveryMethod('express')}
                        className="mt-0.5 accent-[#10B981]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900">Express Delivery</span>
                          <span className="text-xs font-black text-neutral-900">Rs. 650</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">Next day delivery in select regions</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Step 1 CTA button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-4 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-luxury-sm active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: PAYMENT ================= */}
            {currentStep === 2 && (
              <div className="space-y-6 anim-fade-in">
                {/* Delivery Summary Badge */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">
                        Delivering to {customerName} ({customerCity})
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate max-w-xs sm:max-w-md">
                        {deliveryAddress} • {customerPhone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Payment Methods Selection */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 shadow-luxury-xs">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
                    <CreditCard className="w-4 h-4 text-[#10B981]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                      Select Payment Method
                    </h2>
                  </div>

                  <div className="space-y-3.5">
                    {/* COD Option */}
                    <label
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-[#10B981] bg-[#EAF7EE]/30 ring-1 ring-[#10B981] shadow-xs'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-[#10B981]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-neutral-900">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Popular
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Pay cash directly to the courier upon receiving your package at your doorstep.
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'bank'
                          ? 'border-[#10B981] bg-[#EAF7EE]/30 ring-1 ring-[#10B981] shadow-xs'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="mt-1 accent-[#10B981]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-neutral-900">
                              Direct Bank Transfer / Deposit
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Zero Fee
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Direct online bank transfer to verified merchant account. Send payment slip after checkout.
                        </p>
                      </div>
                    </label>

                    {/* Online Card Option */}
                    <label
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-[#10B981] bg-[#EAF7EE]/30 ring-1 ring-[#10B981] shadow-xs'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 accent-[#10B981]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-neutral-900">
                              Online Card / LankaQR
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              Instant
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Visa, Mastercard, LankaQR or digital wallets. Secure payment receipt issued instantly.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Payment Details Callout */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-neutral-900">
                      <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Direct Merchant Handoff Protocol</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {paymentMethod === 'cod' && 'No upfront payment required. Your order will be packed by the workshop and handed to the courier.'}
                      {paymentMethod === 'bank' && 'After placing the order, you will receive the official verified bank account details to transfer and attach the slip.'}
                      {paymentMethod === 'card' && 'An encrypted checkout link will be delivered with your order reference.'}
                    </p>
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 px-5 py-4 text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                  >
                    Back to Delivery
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToConfirm}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-4 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-luxury-sm active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Review & Confirm Order</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: CONFIRM & PLACE ORDER ================= */}
            {currentStep === 3 && (
              <div className="space-y-6 anim-fade-in">
                {/* Review Cards */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 shadow-luxury-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                      Order Verification & Details
                    </h2>
                    <span className="text-[11px] font-bold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Ready to Place
                    </span>
                  </div>

                  {/* Delivery summary item */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white text-[#10B981] border border-neutral-200">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Delivery Recipient
                        </span>
                        <p className="text-xs font-bold text-neutral-900 mt-0.5">
                          {customerName} ({customerPhone})
                        </p>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {deliveryAddress}, {customerCity}
                        </p>
                        {customerNote && (
                          <p className="text-[11px] text-neutral-500 italic mt-1">
                            Note: "{customerNote}"
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Payment method summary item */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white text-[#10B981] border border-neutral-200">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Payment Method
                        </span>
                        <p className="text-xs font-bold text-neutral-900 mt-0.5">
                          {paymentMethod === 'cod' && 'Cash on Delivery (COD)'}
                          {paymentMethod === 'bank' && 'Direct Bank Transfer / Deposit'}
                          {paymentMethod === 'card' && 'Online Card / LankaQR'}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Courier: {deliveryMethod === 'express' ? 'Express Courier (Next Day)' : 'Standard Courier (2-3 days)'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Direct Merchant Guarantee Notice */}
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 flex items-start gap-3.5 shadow-luxury-xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#10B981] text-white shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-[#0F0F11] leading-relaxed">
                    <span className="font-bold block text-sm mb-1">
                      Direct Website Order Transmission Guarantee:
                    </span>
                    {shopCount === 1 ? (
                      <>
                        Upon placing, your order is transmitted directly to <span className="font-bold">{shopNames[0]}</span>'s merchant dashboard on the website. Stock is reserved immediately, and your delivery information is sent to the workshop.
                      </>
                    ) : (
                      <>
                        Upon placing, your order is transmitted directly to each boutique's merchant dashboard on the website. Stock is reserved immediately and each seller is notified to dispatch.
                      </>
                    )}
                  </div>
                </div>

                {/* Final Submit Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 px-5 py-4 text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                  >
                    Back to Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder()}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-4 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-luxury-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registering Order...' : 'Place Order Directly'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-[#E4E4E7] bg-white p-6 sm:p-7 shadow-luxury-md space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-[#F4F4F5] pb-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F0F11]">
                  Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </h3>
                <span className="text-[11px] font-semibold text-[#71717A]">
                  {shopCount === 1 ? `Sold by ${shopNames[0]}` : `${shopCount} Boutiques`}
                </span>
              </div>

              {/* Items List grouped by shop */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {shopIds.map(sId => {
                  const group = itemsByShop[sId];
                  return (
                    <div key={sId} className="space-y-2 border-b border-[#F4F4F5] pb-3 last:border-b-0">
                      <div className="flex items-center justify-between text-xs font-bold text-[#0F0F11]">
                        <span className="truncate">{group.shop.name}</span>
                        <span className="text-[11px] font-normal text-[#71717A]">{group.items.length} items</span>
                      </div>
                      <div className="space-y-2">
                        {group.items.map(item => (
                          <div key={item.product.id} className="flex gap-3 text-xs">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-xl object-cover border border-[#E4E4E7] bg-[#F4F4F5] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#0F0F11] truncate">{item.product.name}</p>
                              <p className="text-[#71717A] text-[11px]">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-extrabold text-[#0F0F11] tabular-nums">
                              {StorageService.formatLKR(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-[#71717A] pt-1 border-t border-dashed border-[#F4F4F5]">
                        <span>Boutique Subtotal</span>
                        <span className="font-semibold text-[#0F0F11]">{StorageService.formatLKR(group.subtotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
              <div className="border-t border-[#E4E4E7] pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#0F0F11] tabular-nums">
                    {StorageService.formatLKR(totalSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-neutral-400" />
                    {deliveryMethod === 'express' ? 'Express Courier' : 'Standard Courier'}{' '}
                    {shopCount > 1 && `(${shopCount} boutiques)`}
                  </span>
                  <span className="font-bold text-[#0F0F11] tabular-nums">
                    {StorageService.formatLKR(totalDeliveryFee)}
                  </span>
                </div>
                <div className="border-t border-[#E4E4E7] pt-3 flex justify-between text-base font-extrabold text-[#0F0F11]">
                  <span>Total Payable</span>
                  <span className="tabular-nums tracking-tight text-[#10B981]">
                    {StorageService.formatLKR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Quick Stepper Status / Primary Action in Sidebar */}
              <div className="pt-2">
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-luxury-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleProceedToConfirm}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-luxury-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Proceed to Confirm</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder()}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-luxury-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registering Order...' : 'Place Order Now'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#71717A] text-center pt-1">
                <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Zero card required • Safe COD & Direct Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────
          OFFICIAL GOOGLE SIGN-IN MODAL DIALOG
         ────────────────────────────────────────────────────────── */}
      {isGoogleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm anim-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-heading"
          onClick={() => setIsGoogleModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-5 shadow-2xl anim-slide-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="google-modal-heading" className="text-base font-extrabold text-neutral-900">
                    Sign in with Google
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Connect your Google account to complete checkout
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-2 rounded-2xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Google Accounts list */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Choose an account or enter your email
              </label>

              <div className="space-y-2">
                {PRESET_GOOGLE_ACCOUNTS.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleGoogleSignInConfirm(acc.name, acc.email)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-neutral-200 hover:border-[#10B981] hover:bg-emerald-50/30 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-emerald-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {acc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900 group-hover:text-[#10B981] transition-colors">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {acc.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Google Account Input */}
            <div className="border-t border-neutral-100 pt-3 space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 block">
                Or enter another Google account:
              </span>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Google Full Name
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#10B981]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="flex-1 py-3 rounded-2xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGoogleSignInConfirm()}
                disabled={!googleEmail.trim()}
                className="flex-1 py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CheckoutPage;
