import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  ChevronRight,
  CheckCircle2,
  LogOut,
  Store,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { KadeoLogo } from '../../components/common/KadeoLogo';

export const AccountPage: React.FC = () => {
  const { currentUser, currentShop, role, loginWithEmail, loginWithGoogle, registerCustomer, logout, loginAsUser } = useAuth();
  const navigate = useNavigate();

  // Auth Form State (when not logged in)
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // Active view tab when logged in
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Real Orders fetched from storage
  const allOrders = useMemo(() => StorageService.getOrders(), []);

  // Filter real orders for this logged-in user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    const userPhoneClean = currentUser.phone ? currentUser.phone.replace(/\D/g, '') : '';
    const userEmailClean = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
    const userNameClean = currentUser.name ? currentUser.name.toLowerCase().trim() : '';

    return allOrders.filter(o => {
      const orderPhoneClean = o.customerPhone ? o.customerPhone.replace(/\D/g, '') : '';
      const orderNameClean = o.customerName ? o.customerName.toLowerCase().trim() : '';

      const phoneMatch = userPhoneClean && orderPhoneClean && (userPhoneClean.includes(orderPhoneClean) || orderPhoneClean.includes(userPhoneClean));
      const nameMatch = userNameClean && orderNameClean && userNameClean === orderNameClean;

      // If user is a seller, also show orders belonging to their shop
      const shopMatch = currentUser.shopId && o.shopId === currentUser.shopId;

      return phoneMatch || nameMatch || shopMatch;
    });
  }, [allOrders, currentUser]);

  // Extract unique saved addresses from real orders
  const savedAddresses = useMemo(() => {
    if (!userOrders.length) return [];
    const addrSet = new Set<string>();
    userOrders.forEach(o => {
      if (o.deliveryAddress) {
        addrSet.add(`${o.deliveryAddress}, ${o.customerCity || ''}`);
      }
    });
    return Array.from(addrSet);
  }, [userOrders]);

  // Handlers
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }
    const result = await loginWithEmail(email);
    if (!result.success) {
      setAuthError(result.message || 'No account found with this email. Please sign up or choose a quick test account.');
    }
  };

  const handleCustomerSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    registerCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '',
    });
  };

  const handleGoogleSignInConfirm = () => {
    if (!googleEmail.trim()) return;
    loginWithGoogle({
      name: googleName.trim() || 'Google User',
      email: googleEmail.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(googleName.trim())}&background=10B981&color=fff&bold=true`,
    });
    setGoogleModalOpen(false);
  };

  // Quick Demo Accounts to test real data instantly
  const demoAccounts = [
    { id: 'user-1', name: 'Kasun Jayawardena', email: 'kasun@ceylonlinen.lk', label: 'Ceylon Linen Co. (Seller)' },
    { id: 'user-2', name: 'Dilini Senanayake', email: 'dilini@aaryabotanicals.com', label: 'Aarya Botanicals (Seller)' },
    { id: 'user-3', name: 'Sanjeewa Perera', email: 'sanjeewa@urbanpulse.lk', label: 'UrbanPulse Tech (Seller)' },
    { id: 'ord-customer', name: 'Dharshana Wickramasinghe', email: 'dharshana@gmail.com', phone: '+94 77 345 6789', label: 'Customer with Placed Orders' },
  ];

  /* ──────────────────────────────────────────────────────────────────────────
     1. NOT LOGGED IN: Show Login & Sign-up with Google
  ────────────────────────────────────────────────────────────────────────── */
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-transparent py-10 sm:py-16 px-4 text-neutral-900 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <KadeoLogo size="lg" showSubtitle={true} />
            </div>
            <h1 className="text-2xl font-black text-neutral-950 tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xs mx-auto">
              Track your real orders, manage your wishlist, and access your boutique portal.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-5">
            {/* 1. Official Google Sign-In Button */}
            <button
              type="button"
              onClick={() => setGoogleModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer group"
            >
              {/* Authentic Multicolor Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 absolute">
                or with email
              </span>
            </div>

            {/* Tabs: Sign In vs Create Account */}
            <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-bold text-neutral-600">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authTab === 'signin' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authTab === 'signup' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            {authTab === 'signin' ? (
              <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Email Address</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. kasun@ceylonlinen.lk"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3.5 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Password</label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-10 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleCustomerSignUp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Full Name</label>
                  <div className="relative">
                    <UserIcon className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Kasun Fernando"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3.5 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Email Address</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. kasun@example.com"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3.5 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-neutral-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3.5 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Quick Demo Test Accounts Box */}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Instant 1-Click Login (Test Accounts)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {demoAccounts.map(demo => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => {
                      if (demo.id === 'ord-customer') {
                        registerCustomer({ name: demo.name, email: demo.email, phone: demo.phone });
                      } else {
                        loginAsUser(demo.id);
                      }
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/80 hover:bg-neutral-100 hover:border-neutral-200 transition-all text-left text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-neutral-800 block group-hover:text-[#059669]">
                        {demo.name}
                      </span>
                      <span className="text-[10px] text-neutral-500">{demo.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Google 1-Click Modal */}
        {googleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Sign in with Google</h3>
                  <p className="text-[11px] text-neutral-500">Choose your Google account for Kadeo</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Google Name</label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Google Email</label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 px-3 text-xs text-neutral-900 focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignInConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     2. LOGGED IN: Show ONLY Real Data from currentUser & storage
  ────────────────────────────────────────────────────────────────────────── */
  const userInitials = currentUser.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-12 text-neutral-900">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-100 px-5 pt-8 pb-6 shadow-2xs">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Avatar (Real Google photo or initials) */}
              <div className="relative">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#10B981] to-emerald-400 text-white font-black text-xl flex items-center justify-center border-2 border-white shadow-md">
                    {userInitials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#10B981] border-2 border-white" />
              </div>

              {/* Real Details */}
              <div className="space-y-0.5">
                <h1 className="text-lg font-bold text-neutral-900">
                  {currentUser.name}
                </h1>
                <p className="text-xs text-neutral-500">
                  {currentUser.email}
                </p>

                {/* Real Verified Status Badge */}
                <div className="inline-flex items-center gap-1 mt-1 rounded-full bg-[#EAF7EE] px-2.5 py-0.5 text-[11px] font-bold text-[#10B981]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    {role === 'seller'
                      ? 'Verified Seller'
                      : role === 'admin'
                      ? 'Platform Administrator'
                      : 'Verified Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout button in header */}
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-2 text-neutral-400 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* If seller: Dedicated Merchant Card */}
        {role === 'seller' && currentShop && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{currentShop.name}</h3>
                  <p className="text-[11px] text-neutral-400">kadeo.lk/shop/{currentShop.slug}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">
                Active Store
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                to="/seller/dashboard"
                className="flex-1 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold text-center transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to={`/shop/${currentShop.slug}`}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
              >
                <span>Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Real Orders Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#10B981]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                My Real Orders ({userOrders.length})
              </h2>
            </div>
            <Link
              to="/track-order"
              className="text-xs font-bold text-[#10B981] hover:underline"
            >
              Track Order →
            </Link>
          </div>

          {userOrders.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs font-medium text-neutral-500">
                No orders placed with this account yet.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {userOrders.slice(0, 3).map(order => (
                <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 block">{order.orderCode}</span>
                    <span className="text-[11px] text-neutral-400">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-neutral-900 block">
                      {StorageService.formatLKR(order.total)}
                    </span>
                    <span className="text-[10px] font-bold text-[#10B981] capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Saved Delivery Addresses */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
            <MapPin className="h-4 w-4 text-[#10B981]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Saved Delivery Addresses
            </h2>
          </div>
          {savedAddresses.length === 0 ? (
            <p className="text-xs text-neutral-500 py-2">
              No delivery addresses saved yet. Addresses are saved automatically when placing an order.
            </p>
          ) : (
            <div className="space-y-1.5 text-xs text-neutral-700">
              {savedAddresses.map((addr, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">{addr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Phone & Account Details */}
        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-2xs text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500">Full Name</span>
            <span className="font-bold text-neutral-900">{currentUser.name}</span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500">Email Address</span>
            <span className="font-mono text-neutral-800">{currentUser.email}</span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500">Mobile Phone</span>
            <span className="font-bold text-neutral-900">{currentUser.phone || 'Not set'}</span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500">Member Since</span>
            <span className="text-neutral-700">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};
