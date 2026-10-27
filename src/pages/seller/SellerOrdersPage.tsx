import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Download,
  MoreHorizontal,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Banknote,
  CreditCard,
  Building2,
  MessageCircle,
  Eye,
  Check,
  X,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';
import heroBagImg from '../../assets/images/kadeo_hero_bag.jpg';

interface OrderRow {
  id: string;
  code: string;
  image: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  customerAddress?: string;
  customerCity?: string;
  customerNote?: string;
  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'Processing' | 'Pending' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Cash on Delivery' | 'WhatsApp Pay' | 'Card Payment' | 'Bank Transfer';
  date: string;
  time: string;
  rawOrder: Order;
}

export const SellerOrdersPage: React.FC = () => {
  const { currentShop, currentUser } = useAuth();

  // Strict Seller Isolation: Resolve Active Boutique
  const activeShop = useMemo(() => {
    if (currentShop) return currentShop;
    if (currentUser?.shopId) {
      return StorageService.getShopById(currentUser.shopId) || null;
    }
    if (currentUser?.role === 'admin') {
      return StorageService.getShops()[0] || null;
    }
    return null;
  }, [currentShop, currentUser]);

  // Tab Filter
  const [activeTab, setActiveTab] = useState<'All Orders' | 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRow | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  // Real Orders State Loaded Directly from Boutique Data
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadOrders = () => {
    if (!activeShop) {
      setOrders([]);
      setIsLoaded(true);
      return;
    }

    const realOrders = StorageService.getOrdersByShop(activeShop.id);

    const mapped: OrderRow[] = realOrders.map(o => {
      let status: OrderRow['status'] = 'Pending';
      if (o.status === 'completed') status = 'Delivered';
      else if (o.status === 'processing' || o.status === 'confirmed') status = 'Processing';
      else if (o.status === 'cancelled') status = 'Cancelled';
      else status = 'Pending';

      let paymentMethod: OrderRow['paymentMethod'] = 'Cash on Delivery';
      if (o.paymentMethod === 'bank') paymentMethod = 'Bank Transfer';
      else if (o.paymentMethod === 'card') paymentMethod = 'Card Payment';
      else if (o.paymentMethod === 'cod') paymentMethod = 'Cash on Delivery';
      else paymentMethod = 'WhatsApp Pay';

      const d = o.createdAt ? new Date(o.createdAt) : new Date();
      const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'Recent';
      const timeStr = !isNaN(d.getTime())
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      const firstItemImg =
        o.items?.[0]?.imageSnapshot ||
        heroBagImg;

      const itemsCount =
        o.items && o.items.length > 0
          ? o.items.reduce((s, i) => s + (i.quantity || 1), 0)
          : 1;

      return {
        id: o.id,
        code: `#${o.orderCode || o.id.slice(-6).toUpperCase()}`,
        image: firstItemImg,
        customerName: o.customerName || 'Direct Customer',
        customerPhone: o.customerPhone || '',
        customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          o.customerName || 'Customer'
        )}&background=00B074&color=fff`,
        customerAddress:
          [o.deliveryAddress, o.customerCity].filter(Boolean).join(', ') ||
          'Standard Islandwide Delivery',
        customerCity: o.customerCity,
        customerNote: o.customerNote,
        itemsCount,
        subtotal: o.subtotal || o.total || 0,
        deliveryFee: o.deliveryFee || 0,
        total: o.total || 0,
        status,
        paymentMethod,
        date: dateStr,
        time: timeStr,
        rawOrder: o,
      };
    });

    mapped.sort(
      (a, b) =>
        new Date(b.rawOrder.createdAt).getTime() -
        new Date(a.rawOrder.createdAt).getTime()
    );

    setOrders(mapped);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadOrders();

    const handleUpdate = () => loadOrders();
    window.addEventListener('kadeo_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('kadeo_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeShop?.id]);

  // Tab Filtering & Search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (activeTab === 'Pending' && order.status !== 'Pending') return false;
      if (activeTab === 'Processing' && order.status !== 'Processing') return false;
      if (activeTab === 'Delivered' && order.status !== 'Delivered') return false;
      if (activeTab === 'Cancelled' && order.status !== 'Cancelled') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = order.code.toLowerCase().includes(q);
        const matchCustomer = order.customerName.toLowerCase().includes(q);
        const matchPhone = order.customerPhone.includes(q);
        if (!matchCode && !matchCustomer && !matchPhone) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUpdateStatus = (id: string, newStatus: OrderRow['status']) => {
    let targetStatus: OrderStatus = 'pending';
    if (newStatus === 'Processing') targetStatus = 'processing';
    else if (newStatus === 'Delivered') targetStatus = 'completed';
    else if (newStatus === 'Cancelled') targetStatus = 'cancelled';

    try {
      StorageService.updateOrderStatus(id, targetStatus);
      loadOrders();
      setActiveActionId(null);
      if (selectedOrderDetails?.id === id) {
        setSelectedOrderDetails(prev => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Real CSV Export
  const handleExportOrders = () => {
    if (orders.length === 0) {
      alert('No customer orders to export yet.');
      return;
    }
    const headers = [
      'Order Code',
      'Date',
      'Customer Name',
      'Phone',
      'Delivery Address',
      'Status',
      'Payment Method',
      'Items Count',
      'Total Amount (LKR)',
    ];
    const rows = orders.map(o => [
      `"${o.code}"`,
      `"${o.date} ${o.time}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${(o.customerAddress || '').replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${o.paymentMethod}"`,
      o.itemsCount,
      o.total,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeShop?.slug || 'boutique'}-orders.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real KPI Calculations (Zero fake numbers)
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  if (!activeShop) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto my-12 shadow-2xs">
        <Store className="h-12 w-12 mx-auto text-slate-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Boutique Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please register a seller account to start receiving and fulfilling customer orders.
        </p>
        <Link
          to="/seller/register"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#00B074]/20"
        >
          Register Boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* ──────────────────────────────────────────────────────────
          1. HEADER TITLE & ACTIONS
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-block mb-1.5 shadow-2xs">
            ORDERS MANAGEMENT · {activeShop.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real customer orders received from your storefront. Update dispatch progress, coordinate courier delivery, and message buyers directly on WhatsApp.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={`/shop/${activeShop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span>Storefront</span>
          </Link>

          <button
            type="button"
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-md shadow-[#00B074]/25 transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. REAL KPI STATS CARDS (Computed strictly from live shop orders)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalOrdersCount}</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            {totalOrdersCount === 0 ? 'No orders yet' : `${totalOrdersCount} orders recorded`}
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{pendingCount}</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-amber-600 font-semibold">
            {pendingCount > 0 ? 'Requires confirmation' : 'Zero pending orders'}
          </div>
        </div>

        {/* Card 3: Processing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Processing</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{processingCount}</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-sky-600 font-semibold">
            {processingCount > 0 ? 'In fulfillment pipeline' : 'No active dispatches'}
          </div>
        </div>

        {/* Card 4: Delivered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Delivered</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{deliveredCount}</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-teal-600 font-semibold">
            {deliveredCount > 0 ? 'Successfully completed' : 'No completed deliveries'}
          </div>
        </div>

        {/* Card 5: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold text-sm">
              Rs
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            Excludes cancelled orders
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. TAB FILTER PILLS & TABLE SEARCH BAR
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'All Orders', label: `All Orders (${totalOrdersCount})` },
            { id: 'Pending', label: `Pending (${pendingCount})` },
            { id: 'Processing', label: `Processing (${processingCount})` },
            { id: 'Delivered', label: `Delivered (${deliveredCount})` },
            { id: 'Cancelled', label: `Cancelled (${cancelledCount})` },
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#00B074] text-white shadow-sm shadow-[#00B074]/30'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by code, customer, phone..."
              className="w-full bg-white rounded-xl py-1.5 pl-8 pr-3 text-xs border border-slate-200 focus:outline-none focus:border-[#00B074] text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. ORDERS TABLE & EMPTY STATE
      ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {totalOrdersCount === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto my-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Package className="h-8 w-8 stroke-[1.75]" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              No Customer Orders Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              When buyers purchase products from your boutique storefront, their orders will appear here in real time with customer WhatsApp contacts and delivery address details.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                to={`/shop/${activeShop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-md shadow-[#00B074]/20 transition-all cursor-pointer"
              >
                <span>View Storefront</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-400 font-semibold select-none">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        paginatedOrders.length > 0 &&
                        selectedOrders.length === paginatedOrders.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded text-[#00B074] border-slate-300 focus:ring-[#00B074] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Order</th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Customer</th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Items</th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Total</th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Status</th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Payment</th>
                  <th className="py-3.5 px-3 font-semibold text-slate-500">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No orders match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map(order => {
                    const isChecked = selectedOrders.includes(order.id);

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-[#F8FAFC] transition-colors group ${
                          isChecked ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectOne(order.id)}
                            className="h-4 w-4 rounded text-[#00B074] border-slate-300 focus:ring-[#00B074] cursor-pointer"
                          />
                        </td>

                        {/* Order Code & Product Thumbnail */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={order.image}
                              alt={order.code}
                              className="h-9 w-9 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                            <span className="font-bold text-slate-900 group-hover:text-[#00B074] transition-colors">
                              {order.code}
                            </span>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={order.customerAvatar}
                              alt={order.customerName}
                              className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate leading-tight">
                                {order.customerName}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {order.customerPhone || 'No phone'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 tabular-nums">
                          Rs. {order.total.toLocaleString()}
                        </td>

                        {/* Status Pill */}
                        <td className="py-3.5 px-3">
                          {order.status === 'Processing' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF5FF] text-[#0070F3] border border-blue-200 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0070F3]" />
                              Processing
                            </span>
                          )}
                          {order.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8EB] text-[#F5A623] border border-amber-200 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
                              Pending
                            </span>
                          )}
                          {order.status === 'Delivered' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDFDF5] text-[#00B074] border border-emerald-200 shadow-2xs">
                              <Check className="h-3 w-3 text-[#00B074]" />
                              Delivered
                            </span>
                          )}
                          {order.status === 'Cancelled' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-rose-200 shadow-2xs">
                              <X className="h-3 w-3 text-[#EF4444]" />
                              Cancelled
                            </span>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            {order.paymentMethod === 'Cash on Delivery' && (
                              <>
                                <Banknote className="h-4 w-4 text-slate-500" />
                                <span>Cash on Delivery</span>
                              </>
                            )}
                            {order.paymentMethod === 'WhatsApp Pay' && (
                              <>
                                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                                <span>WhatsApp Pay</span>
                              </>
                            )}
                            {order.paymentMethod === 'Card Payment' && (
                              <>
                                <CreditCard className="h-4 w-4 text-slate-500" />
                                <span>Card Payment</span>
                              </>
                            )}
                            {order.paymentMethod === 'Bank Transfer' && (
                              <>
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <span>Bank Transfer</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-slate-800 leading-tight">{order.date}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{order.time}</p>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveActionId(activeActionId === order.id ? null : order.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {/* Dropdown Options */}
                          {activeActionId === order.id && (
                            <div className="absolute right-4 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 text-left space-y-1 animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderDetails(order);
                                  setActiveActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                <span>View Order Details</span>
                              </button>

                              {order.customerPhone && (
                                <a
                                  href={`https://wa.me/${order.customerPhone.replace(
                                    /[^0-9]/g,
                                    ''
                                  )}?text=${encodeURIComponent(
                                    `Hello ${order.customerName}, this is ${activeShop.name}. Regarding your order ${order.code} on Kadeo:`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Chat on WhatsApp</span>
                                </a>
                              )}

                              <div className="border-t border-slate-100 my-1" />

                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                                Update Status
                              </div>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'Processing')}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-sky-600 hover:bg-sky-50 cursor-pointer font-medium"
                              >
                                <Truck className="h-3 w-3" />
                                <span>Mark Processing</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-emerald-600 hover:bg-emerald-50 cursor-pointer font-medium"
                              >
                                <Check className="h-3 w-3" />
                                <span>Mark Delivered</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 cursor-pointer font-medium"
                              >
                                <X className="h-3 w-3" />
                                <span>Mark Cancelled</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            5. REAL DYNAMIC PAGINATION FOOTER
        ────────────────────────────────────────────────────────── */}
        {filteredOrders.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredOrders.length)} to{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-[#00B074] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          6. MODAL: ORDER DETAILS & REAL ITEM BREAKDOWN
      ────────────────────────────────────────────────────────── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#00B074] uppercase tracking-wider block">
                  Order Details
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrderDetails.code}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Buyer Contact & Address */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={selectedOrderDetails.customerAvatar}
                alt={selectedOrderDetails.customerName}
                className="h-10 w-10 rounded-full object-cover border border-slate-300 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-sm">{selectedOrderDetails.customerName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedOrderDetails.customerPhone || 'No contact number provided'}
                </p>
                <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedOrderDetails.customerAddress}</span>
                </p>
                {selectedOrderDetails.customerNote && (
                  <p className="text-xs text-slate-500 mt-2 bg-white p-2.5 rounded-xl border border-slate-200 italic">
                    "{selectedOrderDetails.customerNote}"
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Items In Order ({selectedOrderDetails.rawOrder.items?.length || 0})
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedOrderDetails.rawOrder.items?.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageSnapshot || selectedOrderDetails.image}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {item.productNameSnapshot}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.quantity} × Rs. {item.unitPriceSnapshot?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 tabular-nums">
                      Rs. {item.lineTotal?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs py-1 text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">
                  Rs. {selectedOrderDetails.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-800">
                  Rs. {selectedOrderDetails.deliveryFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 text-slate-500">
                <span>Payment Method</span>
                <span className="font-semibold text-slate-800">{selectedOrderDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-t border-slate-100">
                <span className="font-extrabold text-slate-900">Total Order Amount</span>
                <span className="font-black text-[#00B074] text-base">
                  Rs. {selectedOrderDetails.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-2">
              {selectedOrderDetails.customerPhone && (
                <a
                  href={`https://wa.me/${selectedOrderDetails.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Buyer</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
