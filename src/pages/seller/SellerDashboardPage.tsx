import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  FileText,
  Users,
  Star,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Package,
  Settings,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent,
  Plus,
  Layers,
  Store,
  ExternalLink,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { Order, Product, Customer } from '../../types';

export const SellerDashboardPage: React.FC = () => {
  const { currentShop, currentUser } = useAuth();
  const [chartRange, setChartRange] = useState<'7' | '30'>('7');

  // Strict Seller Isolation: Only own boutique is accessible
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

  if (!activeShop) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-neutral-200">
        <Store className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
        <h2 className="text-lg font-bold text-neutral-800">No Boutique Found</h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Please register a seller account to start managing your boutique.
        </p>
        <Link
          to="/seller/register"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B074] text-white text-xs font-bold"
        >
          Register Boutique
        </Link>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // REAL DATA DIRECTLY FROM STORAGESERVICE (Strict Isolated Seller Data)
  // ────────────────────────────────────────────────────────────────────────────
  const shopName = activeShop.name;
  const products = StorageService.getProductsByShop(activeShop.id);
  const orders = StorageService.getOrdersByShop(activeShop.id);
  const customers = StorageService.getCustomers(activeShop.id);

  // 1. Real KPI Metrics Calculations
  const nonCancelledOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'cancelled');
  }, [orders]);

  const totalSales = useMemo(() => {
    return nonCancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [nonCancelledOrders]);

  const totalOrdersCount = orders.length;
  const completedOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'completed').length;
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  }, [orders]);

  const totalCustomersCount = customers.length;
  const inStockProductsCount = useMemo(() => {
    return products.filter(p => p.stockQuantity > 0).length;
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => p.stockQuantity === 0).length;
  }, [products]);

  // Average Order Value
  const avgOrderValue = useMemo(() => {
    if (nonCancelledOrders.length === 0) return 0;
    return Math.round(totalSales / nonCancelledOrders.length);
  }, [totalSales, nonCancelledOrders.length]);

  // 2. Real Daily Sales Data for Chart (Computed strictly from Real Order Timestamps)
  const chartDays = useMemo(() => {
    const daysCount = chartRange === '30' ? 30 : 7;
    const days: { label: string; dateStr: string; sales: number; orderCount: number }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      // Filter real orders that occurred on this day
      const ordersOnThisDay = nonCancelledOrders.filter(o => {
        if (!o.createdAt) return false;
        const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDateStr === dateStr;
      });

      const dayTotal = ordersOnThisDay.reduce((sum, o) => sum + (o.total || 0), 0);

      days.push({
        label,
        dateStr,
        sales: dayTotal,
        orderCount: ordersOnThisDay.length,
      });
    }

    return days;
  }, [nonCancelledOrders, chartRange]);

  // SVG Chart Calculation based on real daily sales
  const chartPoints = useMemo(() => {
    const maxVal = Math.max(...chartDays.map(d => d.sales), 5000); // minimum scale 5,000 for visibility
    const width = 600;
    const height = 180;
    const paddingX = 20;
    const paddingTop = 20;
    const paddingBottom = 20;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingTop - paddingBottom;

    const points = chartDays.map((d, index) => {
      const x = paddingX + (index / (chartDays.length - 1)) * plotWidth;
      const y = height - paddingBottom - (d.sales / maxVal) * plotHeight;
      return { x, y, sales: d.sales, label: d.label, orderCount: d.orderCount };
    });

    // Generate Path
    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      pathD += ` C ${cx},${prev.y} ${cx},${curr.y} ${curr.x},${curr.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return { points, pathD, areaD, maxVal };
  }, [chartDays]);

  // 3. Real Top Selling Products from Order Items (Zero fake sales)
  const topSellingProducts = useMemo(() => {
    const productSalesMap: Record<string, { count: number; revenue: number }> = {};

    for (const order of nonCancelledOrders) {
      for (const item of order.items) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { count: 0, revenue: 0 };
        }
        productSalesMap[item.productId].count += item.quantity || 1;
        productSalesMap[item.productId].revenue += item.lineTotal || (item.unitPriceSnapshot * (item.quantity || 1));
      }
    }

    // Map against actual products
    const list = products.map(p => {
      const stats = productSalesMap[p.id] || { count: 0, revenue: 0 };
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        salesCount: stats.count,
        revenue: stats.revenue,
        image: p.images[0] || '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg',
        stock: p.stockQuantity,
      };
    });

    // Sort by revenue, then by stock
    return list.sort((a, b) => b.revenue - a.revenue || b.salesCount - a.salesCount).slice(0, 5);
  }, [products, nonCancelledOrders]);

  // 4. Real Recent Orders (Sorted strictly by Date Descending)
  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sorted.slice(0, 5).map(o => {
      let statusLabel = 'Processing';
      let statusColor = 'bg-blue-100 text-blue-800';

      if (o.status === 'completed') {
        statusLabel = 'Completed';
        statusColor = 'bg-emerald-100 text-emerald-800';
      } else if (o.status === 'confirmed') {
        statusLabel = 'Confirmed';
        statusColor = 'bg-blue-100 text-blue-800';
      } else if (o.status === 'processing') {
        statusLabel = 'Processing';
        statusColor = 'bg-indigo-100 text-indigo-800';
      } else if (o.status === 'pending') {
        statusLabel = 'Pending';
        statusColor = 'bg-amber-100 text-amber-800';
      } else if (o.status === 'cancelled') {
        statusLabel = 'Cancelled';
        statusColor = 'bg-red-100 text-red-800';
      }

      // Format relative time accurately
      const timeDiffMs = Math.max(0, Date.now() - new Date(o.createdAt).getTime());
      const hoursAgo = Math.floor(timeDiffMs / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);
      let timeText = 'Just now';
      if (hoursAgo < 1) {
        timeText = 'Just now';
      } else if (hoursAgo < 24) {
        timeText = `${hoursAgo}h ago`;
      } else {
        timeText = `${daysAgo}d ago`;
      }

      const firstItemImage =
        o.items[0]?.imageSnapshot ||
        products.find(p => p.id === o.items[0]?.productId)?.images[0] ||
        '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg';

      return {
        id: o.orderCode ? `#${o.orderCode}` : `#${o.id.slice(-6).toUpperCase()}`,
        customer: o.customerName,
        phone: o.customerPhone,
        city: o.customerCity,
        amount: o.total,
        status: statusLabel,
        statusColor,
        time: timeText,
        itemCount: o.items.reduce((s, it) => s + (it.quantity || 1), 0),
        image: firstItemImage,
      };
    });
  }, [orders, products]);

  // 5. Real Customer Feedback & Order Notes (Derived strictly from verified customer orders)
  const realCustomerNotes = useMemo(() => {
    // Gather all actual notes left during checkout or stored in customer records
    const verifiedNotes: {
      name: string;
      city: string;
      note: string;
      orderCode: string;
      date: string;
      initials: string;
    }[] = [];

    // Check orders with customerNote
    for (const order of orders) {
      if (order.customerNote && order.customerNote.trim().length > 0) {
        const initials = order.customerName
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'CU';

        const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        verifiedNotes.push({
          name: order.customerName,
          city: order.customerCity,
          note: order.customerNote.trim(),
          orderCode: order.orderCode || order.id.slice(-6).toUpperCase(),
          date: dateStr,
          initials,
        });
      }
    }

    // Check customer saved notes
    for (const customer of customers) {
      if (customer.notes && customer.notes.trim().length > 0) {
        const alreadyAdded = verifiedNotes.some(v => v.name === customer.name);
        if (!alreadyAdded) {
          const initials = customer.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'CU';

          verifiedNotes.push({
            name: customer.name,
            city: 'Sri Lanka',
            note: customer.notes.trim(),
            orderCode: 'Verified Buyer',
            date: new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            initials,
          });
        }
      }
    }

    return verifiedNotes.slice(0, 3);
  }, [orders, customers]);

  // 6. Real Store Health Percentage (Derived purely from In-Stock ratio & Order fulfillment)
  const storeHealthPercentage = useMemo(() => {
    if (products.length === 0) return 100;
    const stockRatio = inStockProductsCount / products.length;
    const fulfillmentRatio =
      orders.length > 0
        ? nonCancelledOrders.length / orders.length
        : 1;

    const score = Math.round(stockRatio * 50 + fulfillmentRatio * 50);
    return Math.min(100, Math.max(0, score));
  }, [products.length, inStockProductsCount, orders.length, nonCancelledOrders.length]);

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HEADER & STORE IDENTITY (100% Real Store Profile)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-block mb-1.5 shadow-2xs">
            DASHBOARD OVERVIEW
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Merchant Performance & Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time revenue analytics, order dispatch velocity, and live catalog health for {shopName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/shop/${activeShop.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Live Storefront</span>
          </Link>

          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-md shadow-[#00B074]/25 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. TOP 4 METRIC KPI CARDS (Computed strictly from Real Storage Records)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Real Total Sales */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#00B074]">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              LKR
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-neutral-500 block">Total Revenue</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">
              {StorageService.formatLKR(totalSales)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 mt-1.5">
              <span>{completedOrdersCount} completed</span>
              <span>·</span>
              <span>{pendingOrdersCount} pending</span>
            </span>
          </div>
        </div>

        {/* Card 2: Real Total Orders */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Orders
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-neutral-500 block">Total Orders</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">
              {totalOrdersCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 mt-1.5">
              <span>{nonCancelledOrders.length} valid orders</span>
              {orders.filter(o => o.status === 'cancelled').length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-red-500">{orders.filter(o => o.status === 'cancelled').length} cancelled</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Card 3: Real Unique Customers */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
              Buyers
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-neutral-500 block">Unique Buyers</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">
              {totalCustomersCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 mt-1.5">
              <span>{customers.filter(c => c.totalOrders > 1).length} repeat customers</span>
            </span>
          </div>
        </div>

        {/* Card 4: Real Active Products in Catalog */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Catalog
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-neutral-500 block">Active Products</span>
            <span className="text-2xl font-black text-neutral-900 mt-1 block">
              {products.length}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 mt-1.5">
              <span className="text-[#00B074] font-semibold">{inStockProductsCount} in stock</span>
              {outOfStockCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-red-500 font-semibold">{outOfStockCount} out of stock</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. REAL SALES OVERVIEW CHART & RECENT ORDERS
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Sales Curve (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">Revenue Timeline</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00B074] border border-emerald-100">
                  Live Computed
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Calculated strictly from actual order timestamps · Total: {StorageService.formatLKR(totalSales)}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartRange('7')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  chartRange === '7'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  chartRange === '30'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* SVG Smooth Area Chart rendered from Real Daily Totals */}
          <div className="w-full pt-4">
            <div className="relative h-64 w-full">
              {/* Y-Axis Real Scale Labels */}
              <div className="absolute left-0 top-0 bottom-6 w-14 flex flex-col justify-between text-[10px] text-neutral-400 font-mono">
                <span>Rs. {Math.round(chartPoints.maxVal).toLocaleString()}</span>
                <span>Rs. {Math.round(chartPoints.maxVal * 0.75).toLocaleString()}</span>
                <span>Rs. {Math.round(chartPoints.maxVal * 0.5).toLocaleString()}</span>
                <span>Rs. {Math.round(chartPoints.maxVal * 0.25).toLocaleString()}</span>
                <span>Rs. 0</span>
              </div>

              {/* Chart Grid Lines */}
              <div className="ml-16 h-full flex flex-col justify-between pb-6">
                <div className="border-b border-neutral-100 w-full" />
                <div className="border-b border-neutral-100 w-full" />
                <div className="border-b border-neutral-100 w-full" />
                <div className="border-b border-neutral-100 w-full" />
                <div className="border-b border-neutral-200 w-full" />
              </div>

              {/* Real SVG Curve Line & Gradient Area */}
              <svg
                className="absolute left-16 right-0 top-0 h-[calc(100%-24px)] w-[calc(100%-64px)] overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 600 180"
              >
                <defs>
                  <linearGradient id="emeraldRealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00B074" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#00B074" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Fill Area */}
                <path d={chartPoints.areaD} fill="url(#emeraldRealGradient)" />

                {/* Stroke Line */}
                <path
                  d={chartPoints.pathD}
                  fill="none"
                  stroke="#00B074"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Real Data Points */}
                {chartPoints.points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.sales > 0 ? 4.5 : 2.5}
                      fill={p.sales > 0 ? '#00B074' : '#CBD5E1'}
                      className="stroke-2 stroke-white cursor-pointer transition-transform hover:scale-150"
                    >
                      <title>{`${p.label}: Rs. ${p.sales.toLocaleString()} (${p.orderCount} orders)`}</title>
                    </circle>
                  </g>
                ))}
              </svg>

              {/* Dynamic Dates on X-Axis */}
              <div className="ml-16 mt-2 flex justify-between text-[11px] text-neutral-400 font-medium">
                {chartDays.length <= 10 ? (
                  chartDays.map((d, idx) => (
                    <span key={idx} className="truncate">{d.label}</span>
                  ))
                ) : (
                  <>
                    <span>{chartDays[0].label}</span>
                    <span>{chartDays[Math.floor(chartDays.length / 2)].label}</span>
                    <span>{chartDays[chartDays.length - 1].label}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real Recent Orders (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Recent Orders</h2>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                {orders.length} total orders in database
              </span>
            </div>
            <Link
              to="/seller/orders"
              className="text-xs font-bold text-[#00B074] hover:underline"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 my-auto">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30 text-neutral-400" />
              <p className="text-xs font-semibold text-neutral-600">No orders recorded yet</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px] mx-auto">
                Orders placed through your online storefront will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentOrders.map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={order.image}
                      alt={order.id}
                      className="h-10 w-10 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-neutral-900 block truncate">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-neutral-500 block truncate">
                        {order.customer} {order.city ? `· ${order.city}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-neutral-900 block">
                      {StorageService.formatLKR(order.amount)}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {order.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. QUICK ACTIONS & STORE PLAN
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (8 cols) */}
        <div className="lg:col-span-8">
          <h2 className="text-base font-bold text-neutral-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Add Product */}
            <Link
              to="/seller/products"
              className="rounded-2xl border border-neutral-200/80 bg-white p-4 hover:border-[#00B074] hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#00B074] mb-3 group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Manage Products</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {products.length} Active Listings
                </span>
              </div>
            </Link>

            {/* Manage Orders */}
            <Link
              to="/seller/orders"
              className="rounded-2xl border border-neutral-200/80 bg-white p-4 hover:border-[#00B074] hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Orders Log</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {orders.length} Total Orders
                </span>
              </div>
            </Link>

            {/* View Customers */}
            <Link
              to="/seller/customers"
              className="rounded-2xl border border-neutral-200/80 bg-white p-4 hover:border-[#00B074] hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 mb-3 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Customers</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {customers.length} Verified Buyers
                </span>
              </div>
            </Link>

            {/* Store Settings */}
            <Link
              to="/seller/settings"
              className="rounded-2xl border border-neutral-200/80 bg-white p-4 hover:border-[#00B074] hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Store Settings</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {activeShop.subscriptionPlanId.toUpperCase()} Plan
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Store Profile Card (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-r from-[#EAF7EE] to-[#E3F5E9] border border-emerald-100 p-5 flex items-center justify-between gap-4 relative overflow-hidden shadow-2xs">
          <div className="space-y-1.5 max-w-[200px]">
            <h3 className="text-sm font-bold text-neutral-900 leading-tight">
              {activeShop.name}
            </h3>
            <p className="text-[11px] text-neutral-600 leading-relaxed font-normal">
              WhatsApp: <span className="font-semibold text-neutral-800">{activeShop.displayPhone}</span>
            </p>
            <div className="pt-2">
              <Link
                to="/seller/subscription"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00B074] hover:bg-[#059669] text-white px-3.5 py-1.5 text-xs font-bold transition-colors shadow-2xs"
              >
                <span>Current Plan: {activeShop.subscriptionPlanId.toUpperCase()}</span>
              </Link>
            </div>
          </div>

          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white p-1 shrink-0 shadow-2xs border border-emerald-200/50">
            <img
              src={activeShop.logo || '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg'}
              alt={shopName}
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. BOTTOM 3-COLUMN PERFORMANCE ROW (All Real Data)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Column 1: Real Top Selling Products from Catalog (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-neutral-900">Top Products by Revenue</h2>
              <Link to="/seller/products" className="text-xs font-bold text-[#00B074] hover:underline">
                View All ({products.length})
              </Link>
            </div>

            {topSellingProducts.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-neutral-600">No products in boutique</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                <div className="grid grid-cols-12 pb-2 text-[10px] font-bold uppercase text-neutral-400">
                  <span className="col-span-6">Product</span>
                  <span className="col-span-3 text-right">Orders</span>
                  <span className="col-span-3 text-right">Revenue</span>
                </div>

                {topSellingProducts.map(p => (
                  <div key={p.id} className="py-2.5 grid grid-cols-12 items-center text-xs">
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-8 w-8 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                      />
                      <span className="font-semibold text-neutral-900 truncate" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                    <span className="col-span-3 text-right text-[11px] text-neutral-500">
                      {p.salesCount > 0 ? `${p.salesCount} sold` : '0 sold'}
                    </span>
                    <span className="col-span-3 text-right font-bold text-neutral-900 text-xs">
                      {StorageService.formatLKR(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Real Customer Notes & Feedback from Orders (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Customer Feedback & Notes</h2>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Real instructions from buyer checkouts
                </span>
              </div>
              <Link to="/seller/customers" className="text-xs font-bold text-[#00B074] hover:underline">
                View ({customers.length})
              </Link>
            </div>

            {realCustomerNotes.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-600">No customer notes yet</p>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px] mx-auto">
                  When customers leave special delivery instructions or checkout notes, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {realCustomerNotes.map((noteItem, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#00B074]/10 text-[#00B074] flex items-center justify-center font-bold text-[10px]">
                          {noteItem.initials}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block leading-none">
                            {noteItem.name}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {noteItem.city} · {noteItem.orderCode}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-neutral-400">{noteItem.date}</span>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed font-normal italic pt-1">
                      "{noteItem.note}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Real Store Health & Performance Indicators (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 mb-4">Inventory & Fulfillment</h2>

            {/* Circular Progress Ring with Real Score */}
            <div className="flex items-center gap-5 p-3 rounded-2xl bg-[#F9FAFB] border border-neutral-100 mb-4">
              <div className="relative h-18 w-18 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-neutral-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Dynamic Green Progress */}
                  <path
                    className="text-[#00B074]"
                    strokeDasharray={`${storeHealthPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-neutral-900">
                  {storeHealthPercentage}%
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-900 block">Inventory Health</span>
                <span className="text-xs font-semibold text-[#00B074] block mt-0.5">
                  {storeHealthPercentage >= 80 ? 'Healthy Stock' : 'Needs Restock'}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  {inStockProductsCount} of {products.length} in stock
                </span>
              </div>
            </div>

            {/* Key Real Performance Indicators */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium flex items-center gap-2">
                  <Percent className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Fulfillment Rate</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-900">
                    {orders.length > 0
                      ? `${Math.round((completedOrdersCount / orders.length) * 100)}%`
                      : '100%'}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    ({completedOrdersCount}/{orders.length})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Avg. Order Value</span>
                </span>
                <span className="font-bold text-neutral-900">
                  {StorageService.formatLKR(avgOrderValue)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Low Stock Warning</span>
                </span>
                <span className={`font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
                  {lowStockCount} items
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Out of Stock</span>
                </span>
                <span className={`font-bold ${outOfStockCount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {outOfStockCount} items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
