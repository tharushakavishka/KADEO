import React, { useState, useMemo } from 'react';
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
  DollarSign,
  Banknote,
  CreditCard,
  Building2,
  MessageCircle,
  Eye,
  Check,
  X,
  Phone,
  MapPin,
  ExternalLink,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import prodTshirtImg from '../../assets/images/kadeo_prod_tshirt.jpg';
import prodBackpackImg from '../../assets/images/kadeo_prod_backpack.jpg';
import prodEarbudsImg from '../../assets/images/kadeo_prod_earbuds.jpg';
import prodSkincareImg from '../../assets/images/kadeo_prod_skincare.jpg';
import prodPlantImg from '../../assets/images/kadeo_prod_plant.jpg';
import heroBagImg from '../../assets/images/kadeo_hero_bag.jpg';

interface OrderRow {
  id: string;
  code: string;
  image: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  customerAddress?: string;
  itemsCount: number;
  total: number;
  status: 'Processing' | 'Pending' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Cash on Delivery' | 'WhatsApp Pay' | 'Card Payment' | 'Bank Transfer';
  date: string;
  time: string;
}

export const SellerOrdersPage: React.FC = () => {
  // Tab Filter
  const [activeTab, setActiveTab] = useState<'All Orders' | 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRow | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Exact Seed Orders Matching User's Image
  const [orders, setOrders] = useState<OrderRow[]>([
    {
      id: 'ord-1001',
      code: '#KA-1001',
      image: prodTshirtImg,
      customerName: 'Nimali Perera',
      customerPhone: '+94 77 123 4567',
      customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      customerAddress: 'No 45, Galle Road, Colombo 03',
      itemsCount: 3,
      total: 12450,
      status: 'Processing',
      paymentMethod: 'Cash on Delivery',
      date: '2025-05-11',
      time: '10:24 AM',
    },
    {
      id: 'ord-1002',
      code: '#KA-1002',
      image: heroBagImg,
      customerName: 'Tharushi Silva',
      customerPhone: '+94 76 987 6543',
      customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      customerAddress: '12/A, Kandy Road, Kiribathgoda',
      itemsCount: 1,
      total: 8900,
      status: 'Pending',
      paymentMethod: 'WhatsApp Pay',
      date: '2025-05-11',
      time: '09:15 AM',
    },
    {
      id: 'ord-1003',
      code: '#KA-1003',
      image: prodPlantImg,
      customerName: 'Sasindu Fernando',
      customerPhone: '+94 71 456 7890',
      customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      customerAddress: '88 Temple Road, Negombo',
      itemsCount: 2,
      total: 5680,
      status: 'Delivered',
      paymentMethod: 'Card Payment',
      date: '2025-05-10',
      time: '04:32 PM',
    },
    {
      id: 'ord-1004',
      code: '#KA-1004',
      image: prodBackpackImg,
      customerName: 'Rashmi Jayasinghe',
      customerPhone: '+94 77 234 5678',
      customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      customerAddress: '24 Havelock City, Colombo 05',
      itemsCount: 4,
      total: 18200,
      status: 'Processing',
      paymentMethod: 'Cash on Delivery',
      date: '2025-05-10',
      time: '01:12 PM',
    },
    {
      id: 'ord-1005',
      code: '#KA-1005',
      image: prodEarbudsImg,
      customerName: 'Kavindu Wijesinghe',
      customerPhone: '+94 76 543 2109',
      customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      customerAddress: '31 Lake Drive, Rajagiriya',
      itemsCount: 1,
      total: 14750,
      status: 'Delivered',
      paymentMethod: 'Card Payment',
      date: '2025-05-09',
      time: '11:45 AM',
    },
    {
      id: 'ord-1006',
      code: '#KA-1006',
      image: prodSkincareImg,
      customerName: 'Chathuranga Nimal',
      customerPhone: '+94 70 987 6543',
      customerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      customerAddress: '15 Main Street, Kurunegala',
      itemsCount: 2,
      total: 7320,
      status: 'Cancelled',
      paymentMethod: 'Bank Transfer',
      date: '2025-05-09',
      time: '09:22 AM',
    },
  ]);

  // Tab Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab check
      if (activeTab === 'Pending' && order.status !== 'Pending') return false;
      if (activeTab === 'Processing' && order.status !== 'Processing') return false;
      if (activeTab === 'Delivered' && order.status !== 'Delivered') return false;
      if (activeTab === 'Cancelled' && order.status !== 'Cancelled') return false;

      // Search query check
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

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUpdateStatus = (id: string, newStatus: OrderRow['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: newStatus } : o))
    );
    setActiveActionId(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* ──────────────────────────────────────────────────────────
          1. HEADER TITLE & ACTIONS
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-block mb-1.5 shadow-2xs">
            ORDERS MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage incoming orders, update dispatch progress, coordinate delivery, and message buyers directly on WhatsApp.
          </p>
        </div>

        {/* Date Filter & Export Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Last 30 days</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => alert('Exporting all 124 orders to CSV/Excel...')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-md shadow-[#00B074]/25 transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Export Orders</span>
            <ChevronDown className="h-3.5 w-3.5 text-emerald-200" />
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. KPI STATS CARDS (5 Cards in Row Matching Image)
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">124</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ +12% <span className="text-slate-400 font-normal ml-0.5">vs. previous 30 days</span>
            </span>
            {/* Sparkline green */}
            <svg className="w-14 h-5 stroke-emerald-500 fill-none stroke-2">
              <path d="M 0,15 Q 10,12 20,14 T 40,5 T 56,2" />
            </svg>
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">18</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ +5% <span className="text-slate-400 font-normal ml-0.5">vs. previous 30 days</span>
            </span>
            {/* Sparkline amber */}
            <svg className="w-14 h-5 stroke-amber-500 fill-none stroke-2">
              <path d="M 0,16 Q 15,14 25,16 T 45,8 T 56,4" />
            </svg>
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">42</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ +8% <span className="text-slate-400 font-normal ml-0.5">vs. previous 30 days</span>
            </span>
            {/* Sparkline sky */}
            <svg className="w-14 h-5 stroke-sky-500 fill-none stroke-2">
              <path d="M 0,16 Q 12,16 24,12 T 44,8 T 56,2" />
            </svg>
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">58</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ +16% <span className="text-slate-400 font-normal ml-0.5">vs. previous 30 days</span>
            </span>
            {/* Sparkline teal */}
            <svg className="w-14 h-5 stroke-teal-500 fill-none stroke-2">
              <path d="M 0,16 Q 14,14 26,14 T 46,6 T 56,3" />
            </svg>
          </div>
        </div>

        {/* Card 5: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold text-sm">
              Rs
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rs. 248,750</h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ +22% <span className="text-slate-400 font-normal ml-0.5">vs. previous 30 days</span>
            </span>
            {/* Sparkline purple */}
            <svg className="w-14 h-5 stroke-purple-500 fill-none stroke-2">
              <path d="M 0,16 Q 12,16 24,14 T 44,5 T 56,2" />
            </svg>
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
            { id: 'All Orders', label: 'All Orders (124)' },
            { id: 'Pending', label: 'Pending (18)' },
            { id: 'Processing', label: 'Processing (42)' },
            { id: 'Delivered', label: 'Delivered (58)' },
            { id: 'Cancelled', label: 'Cancelled (6)' },
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* Right Search & Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full bg-white rounded-xl py-1.5 pl-8 pr-3 text-xs border border-slate-200 focus:outline-none focus:border-[#00B074] text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <button
            type="button"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Advanced Filters"
          >
            <Filter className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer shrink-0"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Last 30 days</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. ORDERS TABLE (Exact Match to User Image)
      ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAFBFD] text-slate-400 font-semibold select-none">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded text-[#00B074] border-slate-300 focus:ring-[#00B074] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Order ⬍</th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Customer ▾</th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Items</th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Total</th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Status ▾</th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Payment ▾</th>
                <th className="py-3.5 px-3 font-semibold text-slate-500">Date ▾</th>
                <th className="py-3.5 px-4 font-semibold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
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
                              {order.customerPhone}
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
                          onClick={() => setActiveActionId(activeActionId === order.id ? null : order.id)}
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

                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${order.customerName}, regarding your order ${order.code} on Kadeo:`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Chat on WhatsApp</span>
                            </a>

                            <div className="border-t border-slate-100 my-1" />

                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                              Change Status
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

        {/* ──────────────────────────────────────────────────────────
            5. PAGINATION FOOTER (Exact Match to Image)
        ────────────────────────────────────────────────────────── */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing 1 to 6 of 124 orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="h-8 w-8 rounded-lg font-bold flex items-center justify-center bg-[#00B074] text-white shadow-xs cursor-pointer"
            >
              1
            </button>

            {[2, 3, 4, 5].map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className="h-8 w-8 rounded-lg font-semibold flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {page}
              </button>
            ))}

            <span className="px-1 text-slate-400">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(21)}
              className="h-8 w-8 rounded-lg font-semibold flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              21
            </button>

            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          6. MODAL: ORDER DETAILS
      ────────────────────────────────────────────────────────── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#00B074] uppercase tracking-wider block">Order Details</span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrderDetails.code}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={selectedOrderDetails.customerAvatar}
                alt={selectedOrderDetails.customerName}
                className="h-12 w-12 rounded-full object-cover border border-slate-300"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{selectedOrderDetails.customerName}</p>
                <p className="text-xs text-slate-500 font-mono">{selectedOrderDetails.customerPhone}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {selectedOrderDetails.customerAddress}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Items Ordered</span>
                <span className="font-bold text-slate-800">{selectedOrderDetails.itemsCount} items</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-800">{selectedOrderDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Order Placed</span>
                <span className="font-bold text-slate-800">{selectedOrderDetails.date} at {selectedOrderDetails.time}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-black text-[#00B074]">Rs. {selectedOrderDetails.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${selectedOrderDetails.customerPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Customer</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
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
