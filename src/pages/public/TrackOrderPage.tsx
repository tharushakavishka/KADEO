import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  MessageCircle,
  Store,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus, Shop } from '../../types';
import { setActiveStorefrontSlug, getSavedStorefrontSlug } from '../../hooks/useActiveStorefront';

export const TrackOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const initialCode = searchParams.get('code') || '';
  const [searchInput, setSearchInput] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode.trim().toUpperCase());

  const orders = useMemo(() => StorageService.getOrders(), []);

  // Find the order matching the activeCode
  const order: Order | undefined = useMemo(() => {
    if (!activeCode) return undefined;
    return orders.find(
      o =>
        o.orderCode.toUpperCase() === activeCode ||
        o.id.toUpperCase() === activeCode
    );
  }, [orders, activeCode]);

  // Resolve shop from order or search params or saved slug
  const shop: Shop | undefined = useMemo(() => {
    if (order?.shopId) {
      const found = StorageService.getShopById(order.shopId);
      if (found) return found;
    }
    const shopSlug = searchParams.get('shop');
    if (shopSlug) {
      const found = StorageService.getShopBySlug(shopSlug);
      if (found) return found;
    }
    const savedSlug = getSavedStorefrontSlug();
    if (savedSlug) {
      return StorageService.getShopBySlug(savedSlug);
    }
    return undefined;
  }, [order, searchParams]);

  // Reactively sync active storefront
  useEffect(() => {
    if (shop?.slug) {
      setActiveStorefrontSlug(shop.slug);
    }
  }, [shop?.slug]);

  // If user is logged in, find their own recent orders
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(
      o =>
        (currentUser.name && o.customerName.toLowerCase() === currentUser.name.toLowerCase()) ||
        (currentUser.phone && o.customerPhone === currentUser.phone)
    );
  }, [orders, currentUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    setActiveCode(clean);
    if (clean) {
      setSearchParams({ code: clean });
    } else {
      setSearchParams({});
    }
  };

  const getSteps = (status: OrderStatus, createdAt: string, updatedAt?: string) => {
    const createdDate = new Date(createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const updateDate = updatedAt
      ? new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : createdDate;

    const isPending = status === 'pending';
    const isConfirmed = status === 'confirmed' || status === 'processing' || status === 'completed';
    const isProcessing = status === 'processing' || status === 'completed';
    const isDelivered = status === 'completed';

    return [
      { title: 'Placed', date: createdDate, completed: true, current: isPending },
      { title: 'Confirmed', date: isConfirmed ? updateDate : '-', completed: isConfirmed, current: status === 'confirmed' },
      { title: 'Processing', date: isProcessing ? updateDate : '-', completed: isProcessing, current: status === 'processing' },
      { title: 'Delivered', date: isDelivered ? updateDate : 'Expected soon', completed: isDelivered, current: status === 'completed' },
    ];
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-24 md:pb-12 text-neutral-900">
      {/* Contextual Header Banner */}
      {shop ? (
        <div className="bg-neutral-900 text-white border-b border-neutral-800 px-4 py-3 shadow-xs">
          <div className="max-w-xl mx-auto flex items-center justify-between text-xs">
            <Link
              to={`/shop/${shop.slug}`}
              className="inline-flex items-center gap-1.5 font-bold text-neutral-300 hover:text-[#10B981] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#10B981]" />
              <span>Return to {shop.name}</span>
            </Link>
            <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live Order Tracking
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-neutral-100 px-4 py-3.5 flex items-center justify-between shadow-2xs">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold text-neutral-900">Track Order</h1>
          <div className="w-7" />
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-neutral-100 p-3 shadow-xs flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Enter Order Code (e.g. KAD-7X29P)"
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-[#10B981] focus:bg-white uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#10B981] hover:bg-[#009863] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
          >
            Track
          </button>
        </form>

        {order ? (
          <>
            {/* Order Summary Header Card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Order Reference
                  </span>
                  <h2 className="text-lg font-black text-neutral-900 font-mono tracking-tight">
                    {order.orderCode}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      order.status === 'completed'
                        ? 'bg-[#EAF7EE] text-[#10B981]'
                        : order.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 mt-2">
                    Total Rs. {order.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Stepper Progress Bar */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="relative flex items-center justify-between">
                  {/* Connected Line */}
                  <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-neutral-200 -z-0">
                    <div
                      className="h-full bg-[#10B981] transition-all duration-500"
                      style={{
                        width:
                          order.status === 'completed'
                            ? '100%'
                            : order.status === 'processing'
                            ? '66%'
                            : order.status === 'confirmed'
                            ? '33%'
                            : '0%',
                      }}
                    />
                  </div>

                  {getSteps(order.status, order.createdAt, order.updatedAt).map((step, idx) => (
                    <div key={step.title} className="flex flex-col items-center relative z-10">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          step.completed
                            ? 'bg-[#10B981] text-white ring-4 ring-[#EAF7EE]'
                            : 'bg-white text-neutral-400 border-2 border-neutral-300'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-800 mt-2 text-center">
                        {step.title}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-medium">
                        {step.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Details Card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Delivery Details
              </h3>

              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-900">{order.customerName}</p>
                    <p className="text-neutral-500 mt-0.5">{order.deliveryAddress}</p>
                    <p className="text-neutral-400 text-[11px]">{order.customerCity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <Phone className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span className="text-neutral-600 font-medium">{order.customerPhone}</span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/60 p-3 flex items-center gap-2.5 text-xs text-neutral-600">
                <Clock className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>
                  {order.status === 'completed'
                    ? 'Package has been successfully delivered.'
                    : 'Dispatched via islandwide express courier service.'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Order Items ({order.items.length})
              </h3>

              <div className="divide-y divide-neutral-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center gap-3">
                    {item.imageSnapshot ? (
                      <img
                        src={item.imageSnapshot}
                        alt={item.productNameSnapshot}
                        className="h-12 w-12 rounded-xl object-cover border border-neutral-100"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {item.productNameSnapshot}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Rs. {item.unitPriceSnapshot.toLocaleString()} <span className="text-neutral-400">× {item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-xs font-bold text-neutral-900">
                      Rs. {item.lineTotal.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {shop && (
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">Fulfilled directly by <strong>{shop.name}</strong></span>
                  <a
                    href={`https://wa.me/${StorageService.formatWhatsAppNumber(shop.whatsappNumber || '94771234567')}?text=${encodeURIComponent(
                      `Hello ${shop.name}! 👋 I am inquiring regarding my order ${order.orderCode}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </>
        ) : activeCode ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center shadow-xs space-y-3">
            <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Order Not Found</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              No matching order found for code <strong className="font-mono text-neutral-800">{activeCode}</strong>. Please double-check your code or check your recent orders.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center shadow-xs space-y-3">
            <div className="h-14 w-14 rounded-full bg-[#EAF7EE] text-[#10B981] flex items-center justify-center mx-auto">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Real-Time Order Tracking</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Enter the unique Order Reference code received upon checkout (e.g. KAD-7X29P) in the search field above.
            </p>

            {userOrders.length > 0 && (
              <div className="pt-4 mt-4 border-t border-neutral-100 text-left">
                <h4 className="text-xs font-bold text-neutral-700 mb-2">Your Recent Orders:</h4>
                <div className="space-y-2">
                  {userOrders.slice(0, 3).map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setActiveCode(o.orderCode);
                        setSearchInput(o.orderCode);
                        setSearchParams({ code: o.orderCode });
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 hover:border-[#10B981] bg-neutral-50/50 hover:bg-[#EAF7EE]/30 transition-all text-xs"
                    >
                      <span className="font-mono font-bold text-neutral-800">{o.orderCode}</span>
                      <span className="text-neutral-500">Rs. {o.total.toLocaleString()}</span>
                      <span className="text-[#10B981] font-bold">Track →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
