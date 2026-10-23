import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Filter,
  MessageCircle,
  Eye,
  Check,
  Clock,
  X,
  MapPin,
  Phone,
  AlertCircle,
  ChevronRight,
  ShoppingBag,
  Trash2,
  Copy,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Package,
  Truck,
  FileText,
  ExternalLink,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';

export const SellerOrdersPage: React.FC = () => {
  const { currentShop } = useAuth();
  const { isDark } = useTheme();

  const [orders, setOrders] = useState<Order[]>(() =>
    currentShop ? StorageService.getOrdersByShop(currentShop.id) : []
  );

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'total-desc' | 'total-asc'>('newest');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refreshOrders = () => {
    if (currentShop) {
      setOrders(StorageService.getOrdersByShop(currentShop.id));
    }
  };

  useEffect(() => {
    const handleOrdersUpdate = () => {
      refreshOrders();
    };
    window.addEventListener('storage', handleOrdersUpdate);
    window.addEventListener('kadeo_orders_updated', handleOrdersUpdate);
    return () => {
      window.removeEventListener('storage', handleOrdersUpdate);
      window.removeEventListener('kadeo_orders_updated', handleOrdersUpdate);
    };
  }, [currentShop]);

  // Keyboard listener for Escape key to close open modals
  useEffect(() => {
    if (!selectedOrder && !deletingOrder && !viewingSlipUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewingSlipUrl) setViewingSlipUrl(null);
        else if (selectedOrder) setSelectedOrder(null);
        else if (deletingOrder) setDeletingOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder, deletingOrder, viewingSlipUrl]);

  if (!currentShop) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  // KPI Metrics Calculation
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const inProgressCount = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Filtered and Sorted Orders
  const filteredOrders = orders
    .filter(o => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = o.orderCode?.toLowerCase().includes(q);
        const matchCustomer = o.customerName?.toLowerCase().includes(q);
        const matchPhone = o.customerPhone?.includes(q);
        const matchCity = o.customerCity?.toLowerCase().includes(q);
        const matchProduct = o.items?.some(i => i.productNameSnapshot?.toLowerCase().includes(q));
        if (!matchCode && !matchCustomer && !matchPhone && !matchCity && !matchProduct) return false;
      }
      if (statusFilter !== 'all' && o.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'total-desc') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === 'total-asc') {
        return (a.total || 0) - (b.total || 0);
      }
      return 0;
    });

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    refreshOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setDeletingOrder(order);
  };

  const confirmDeleteOrder = () => {
    if (!deletingOrder) return;
    StorageService.deleteOrder(deletingOrder.id);
    if (selectedOrder && selectedOrder.id === deletingOrder.id) {
      setSelectedOrder(null);
    }
    setDeletingOrder(null);
    refreshOrders();
  };

  const openWhatsAppToCustomer = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('94')
      ? cleanPhone
      : `94${cleanPhone.replace(/^0+/, '')}`;

    const text = encodeURIComponent(
      `Hello ${order.customerName}! 👋 This is ${currentShop.name} regarding your order #${order.orderCode}.\nWe have received your order details via the Kadeo platform and are processing your package. Please let us know if you have any questions!`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b transition-colors ${
          isDark ? 'border-white/10' : 'border-[#E4E4E7]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Package className="w-3 h-3 text-emerald-500" />
              Live Order Management
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isDark ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {orders.length} total customer orders
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Customer Orders & Fulfillment
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Fulfill incoming website orders, update dispatch progress, coordinate delivery, and message buyers directly on WhatsApp.
          </p>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Orders */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Total Orders
            </span>
            <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5 text-neutral-300' : 'bg-neutral-100 text-neutral-700'}`}>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black tabular-nums">{totalOrdersCount}</p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Catalog inquiries
          </p>
        </div>

        {/* Pending Review */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Pending
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500 tabular-nums">{pendingOrdersCount}</p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Awaiting confirmation
          </p>
        </div>

        {/* Processing / Confirmed */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Processing
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-500 tabular-nums">{inProgressCount}</p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Packing & shipping
          </p>
        </div>

        {/* Completed */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Delivered
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-500 tabular-nums">{completedOrdersCount}</p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Successfully completed
          </p>
        </div>

        {/* Total Revenue */}
        <div
          className={`col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Revenue
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black tabular-nums tracking-tight">
            {StorageService.formatLKR(totalRevenue)}
          </p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Confirmed order volume
          </p>
        </div>
      </div>

      {/* Filter / Search & Sort Bar */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Order Code (e.g. KAD-DDV2N), Customer, Phone, or City..."
              className={`w-full rounded-2xl border py-2.5 pl-10 pr-9 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] placeholder-neutral-400 focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
              }`}
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</option>
              <option value="confirmed">Confirmed ({orders.filter(o => o.status === 'confirmed').length})</option>
              <option value="processing">Processing ({orders.filter(o => o.status === 'processing').length})</option>
              <option value="completed">Completed ({orders.filter(o => o.status === 'completed').length})</option>
              <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
              }`}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="total-desc">Amount: High to Low</option>
              <option value="total-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200/50 dark:border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>
              Showing <span className="font-bold text-foreground">{filteredOrders.length}</span> of {orders.length} orders
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                Filtered
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        {filteredOrders.length === 0 ? (
          <div
            className={`py-24 text-center space-y-4 ${
              isDark ? 'text-neutral-400' : 'text-[#71717A]'
            }`}
          >
            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${isDark ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-neutral-500'}`}>
              <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">No customer orders found</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                {hasActiveFilters
                  ? 'No orders match your search or filter criteria. Try resetting filters.'
                  : 'Orders placed on your online boutique will appear here automatically in real time.'}
              </p>
            </div>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className={`rounded-2xl px-5 py-2 text-xs font-semibold border cursor-pointer ${
                    isDark ? 'border-white/10 text-neutral-300 hover:bg-white/5' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b font-semibold tracking-wider text-[11px] uppercase ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-neutral-400'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#71717A]'
                }`}
              >
                <tr>
                  <th className="py-4 px-6">Order Code</th>
                  <th className="py-4 px-6">Customer & Contact</th>
                  <th className="py-4 px-6">Purchased Items</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Fulfillment Status</th>
                  <th className="py-4 px-6">Order Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-white/5' : 'divide-[#F4F4F5]'
                }`}
              >
                {filteredOrders.map(order => {
                  return (
                    <tr
                      key={order.id}
                      className={`group transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-[#FAFAF9]'
                      }`}
                    >
                      {/* Order Code */}
                      <td className="py-4 px-6 font-mono font-bold">
                        <div className="flex flex-col items-start gap-1">
                          <button
                            onClick={() => handleCopyCode(order.orderCode)}
                            title="Click to copy order reference"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              copiedCode === order.orderCode
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isDark
                                ? 'bg-white/10 text-white hover:bg-white/15'
                                : 'bg-neutral-100 text-[#0F0F11] hover:bg-neutral-200'
                            }`}
                          >
                            <span>{order.orderCode}</span>
                            {copiedCode === order.orderCode ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                            )}
                          </button>

                          {order.paymentSlipUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                              }`}
                              title="Customer attached bank payment receipt"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Slip Attached</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-foreground">{order.customerName}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[11px] font-mono ${
                                isDark ? 'text-neutral-400' : 'text-[#71717A]'
                              }`}
                            >
                              {order.customerPhone}
                            </span>
                            {order.customerCity && (
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-neutral-300'
                                    : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                                }`}
                              >
                                {order.customerCity}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {order.items && order.items[0]?.imageSnapshot && (
                            <img
                              src={order.items[0].imageSnapshot}
                              alt="product"
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-white/10"
                            />
                          )}
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold truncate">
                              {order.items.map(i => i.productNameSnapshot).join(', ')}
                            </p>
                            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 font-extrabold text-sm tabular-nums">
                        {StorageService.formatLKR(order.total)}
                      </td>

                      {/* Live Status Selector */}
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`rounded-full py-1 px-3 text-[11px] font-extrabold border capitalize focus:outline-none cursor-pointer transition-colors ${
                            order.status === 'completed'
                              ? isDark
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'confirmed'
                              ? isDark
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.status === 'processing'
                              ? isDark
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : order.status === 'cancelled'
                              ? isDark
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                              : isDark
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending" className={isDark ? 'bg-[#15151D] text-white' : ''}>Pending</option>
                          <option value="confirmed" className={isDark ? 'bg-[#15151D] text-white' : ''}>Confirmed</option>
                          <option value="processing" className={isDark ? 'bg-[#15151D] text-white' : ''}>Processing</option>
                          <option value="completed" className={isDark ? 'bg-[#15151D] text-white' : ''}>Completed</option>
                          <option value="cancelled" className={isDark ? 'bg-[#15151D] text-white' : ''}>Cancelled</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td
                        className={`py-4 px-6 whitespace-nowrap text-xs ${
                          isDark ? 'text-neutral-400' : 'text-[#71717A]'
                        }`}
                      >
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Action Icons: WhatsApp, View Details, Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Chat Button */}
                          <button
                            onClick={() => openWhatsAppToCustomer(order)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark
                                ? 'text-emerald-400 hover:bg-emerald-500/15'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>

                          {/* View Order Details Button */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark
                                ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                                : 'text-[#71717A] hover:text-[#0F0F11] hover:bg-neutral-100'
                            }`}
                            title="View Full Order Invoice & Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Delete Order Action Icon */}
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark
                                ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10'
                                : 'text-[#71717A] hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Delete Order Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - Rendered at document.body level to cover the full viewport */}
      {deletingOrder &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md anim-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-order-heading"
            onClick={() => setDeletingOrder(null)}
          >
            <div
              className={`w-full max-w-md rounded-3xl border p-6 sm:p-7 space-y-5 anim-slide-bottom shadow-2xl ${
                isDark
                  ? 'bg-[#15151D] border-white/15 text-white'
                  : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="delete-order-heading" className="text-base font-bold">
                    Delete Customer Order
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                    Order #{deletingOrder.orderCode}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-white/5 space-y-1.5 text-xs">
                <p className="font-semibold">
                  Customer: <span className="font-bold">{deletingOrder.customerName}</span> ({deletingOrder.customerPhone})
                </p>
                <p className="text-neutral-500">
                  Amount: <span className="font-bold text-foreground">{StorageService.formatLKR(deletingOrder.total)}</span>
                </p>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                Are you sure you want to permanently delete this order record? This will remove the order from your shop's database and analytics log.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
                  className={`rounded-2xl px-5 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                      : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteOrder}
                  className="rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-luxury-xs cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Order Details Modal - Rendered at document.body level to cover the full viewport */}
      {selectedOrder &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto anim-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-heading"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto anim-slide-bottom shadow-2xl ${
                isDark
                  ? 'bg-[#15151D] border-white/15 text-white'
                  : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className={`flex items-center justify-between border-b pb-4 ${
                  isDark ? 'border-white/10' : 'border-[#F4F4F5]'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                      isDark ? 'text-neutral-400' : 'text-[#71717A]'
                    }`}
                  >
                    Order Invoice Reference
                  </span>
                  <h3 id="order-details-heading" className="text-xl font-mono font-extrabold flex items-center gap-2">
                    <span>{selectedOrder.orderCode}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className={`p-2 rounded-2xl transition-colors cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-[#71717A] hover:text-[#0F0F11] hover:bg-neutral-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status change bar */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-[#FAFAF9] border-[#E4E4E7]'
                }`}
              >
                <span className="text-xs font-bold block">Fulfillment Status:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['pending', 'confirmed', 'processing', 'completed', 'cancelled'] as OrderStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-full capitalize transition-all cursor-pointer ${
                        selectedOrder.status === st
                          ? isDark
                            ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                            : 'bg-[#0F0F11] text-white shadow-xs'
                          : isDark
                          ? 'border border-white/10 text-neutral-300 hover:bg-white/10'
                          : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-neutral-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buyer & Delivery Info */}
              <div
                className={`space-y-3 pb-4 border-b text-xs ${
                  isDark ? 'border-white/10' : 'border-[#F4F4F5]'
                }`}
              >
                <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-neutral-500">
                  Buyer & Delivery Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/5">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                      Customer Name
                    </span>
                    <p className="font-bold text-sm mt-0.5">{selectedOrder.customerName}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/5">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                      Phone Number
                    </span>
                    <p className="font-bold font-mono text-sm mt-0.5">{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 p-3 rounded-2xl bg-neutral-50 dark:bg-white/5">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                      Delivery Address
                    </span>
                    <p className="font-medium text-xs mt-0.5">
                      {selectedOrder.deliveryAddress}, {selectedOrder.customerCity}
                    </p>
                  </div>
                  {selectedOrder.customerNote && (
                    <div
                      className={`col-span-1 sm:col-span-2 p-3.5 rounded-2xl border ${
                        isDark
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <span className="font-bold block text-[11px]">Customer Special Request:</span>
                      <p className="mt-0.5">{selectedOrder.customerNote}</p>
                    </div>
                  )}

                  {/* Customer Uploaded Payment Slip */}
                  {selectedOrder.paymentSlipUrl && (
                    <div
                      className={`col-span-1 sm:col-span-2 p-4 rounded-2xl border space-y-2.5 ${
                        isDark
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-emerald-50/70 border-emerald-200 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Customer Payment Slip / Bank Receipt
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingSlipUrl(selectedOrder.paymentSlipUrl || null)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Full Size</span>
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div
                        className="rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-black/5 dark:bg-black/30 max-h-56 flex items-center justify-center p-1 cursor-pointer group"
                        onClick={() => setViewingSlipUrl(selectedOrder.paymentSlipUrl || null)}
                      >
                        <img
                          src={selectedOrder.paymentSlipUrl}
                          alt="Payment slip receipt"
                          className="max-h-52 w-auto object-contain rounded-lg group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-neutral-500">
                  Ordered Items ({selectedOrder.items.length})
                </h4>
                <div
                  className={`divide-y text-xs ${
                    isDark ? 'divide-white/5' : 'divide-[#F4F4F5]'
                  }`}
                >
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="py-3 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageSnapshot && (
                          <img
                            src={item.imageSnapshot}
                            alt={item.productNameSnapshot}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-white/10"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{item.productNameSnapshot}</p>
                          <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                            Qty: {item.quantity} × {StorageService.formatLKR(item.unitPriceSnapshot)}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-sm tabular-nums shrink-0">
                        {StorageService.formatLKR(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Totals Breakdown */}
                <div
                  className={`border-t pt-3.5 space-y-2 text-xs ${
                    isDark ? 'border-white/10' : 'border-[#E4E4E7]'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-neutral-400' : 'text-[#71717A]'}>Items Subtotal</span>
                    <span className="font-semibold tabular-nums">
                      {StorageService.formatLKR(selectedOrder.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-neutral-400' : 'text-[#71717A]'}>Courier Delivery Fee</span>
                    <span className="font-semibold tabular-nums">
                      {StorageService.formatLKR(selectedOrder.deliveryFee)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-base font-extrabold pt-2 border-t ${
                      isDark ? 'border-white/10 text-emerald-400' : 'border-[#E4E4E7] text-[#0F0F11]'
                    }`}
                  >
                    <span>Total Order Value</span>
                    <span className="tabular-nums">{StorageService.formatLKR(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div
                className={`flex justify-between items-center pt-4 border-t gap-3 ${
                  isDark ? 'border-white/10' : 'border-[#F4F4F5]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteOrder(selectedOrder);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                      : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Order</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openWhatsAppToCustomer(selectedOrder)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Buyer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className={`rounded-2xl px-5 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                        : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Full-Screen Payment Slip Lightbox Modal */}
      {viewingSlipUrl &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md anim-fade-in"
            role="dialog"
            aria-modal="true"
            onClick={() => setViewingSlipUrl(null)}
          >
            <div
              className={`max-w-2xl w-full rounded-3xl p-6 space-y-4 shadow-2xl anim-slide-bottom ${
                isDark ? 'bg-[#15151D] border border-white/15 text-white' : 'bg-white border border-[#E4E4E7] text-[#0F0F11]'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold">
                    Customer Payment Receipt
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingSlipUrl(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-auto rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-900 flex items-center justify-center p-2">
                <img
                  src={viewingSlipUrl}
                  alt="Customer payment slip full view"
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
                />
              </div>

              <div className="flex justify-between items-center pt-1 text-xs">
                <a
                  href={viewingSlipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-500 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingSlipUrl(null)}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
export default SellerOrdersPage;
