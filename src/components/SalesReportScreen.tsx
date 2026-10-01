import React, { useState } from 'react';
import { OrderModel, MenuItem, DayCloseReport, RoomModel } from '../types/pos';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  Percent,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  Package,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ThermalReceiptModal } from './ThermalReceiptModal';

interface SalesReportScreenProps {
  orders: OrderModel[];
  menuItems: MenuItem[];
  rooms?: RoomModel[];
  onRestockItem: (itemId: string, addedQty: number) => void;
}

export const SalesReportScreen: React.FC<SalesReportScreenProps> = ({
  orders,
  menuItems,
  rooms = [],
  onRestockItem,
}) => {
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderModel | null>(null);
  const [activePaymentFilter, setActivePaymentFilter] = useState<string>('all');
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [closedTimestamp, setClosedTimestamp] = useState<string | null>(null);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Filter settled / paid orders
  const paidOrders = orders.filter((o) => o.status === 'paid');

  // Key Financial Aggregates
  const grossSales = paidOrders.reduce((sum, o) => {
    const orderSubtotal = o.itemsList.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return sum + orderSubtotal;
  }, 0);

  // Room stay income from occupied rooms
  const roomStayIncome = rooms
    .filter((r) => r.status === 'occupied')
    .reduce((s, r) => s + (r.pricePerNight * (r.nights || 1) * (1 - (r.discountPercent || 0) / 100)), 0);

  // Room service orders inside booked rooms
  const roomServiceSales = rooms.reduce((s, r) => {
    const itemsTotal = (r.orderedItems || []).reduce((acc, i) => acc + i.price * i.quantity, 0);
    return s + itemsTotal;
  }, 0);

  const totalGrossCombined = grossSales + roomStayIncome + roomServiceSales;

  const totalDiscounts = paidOrders.reduce((sum, o) => {
    return sum + (o.discountAmount || 0);
  }, 0);

  const totalVat = paidOrders.reduce((sum, o) => {
    return sum + (o.taxAmount || 0);
  }, 0);

  const netRevenue = paidOrders.reduce((sum, o) => {
    return sum + (o.totalAmount || 0);
  }, 0);

  const netRevenueCombined = netRevenue + roomStayIncome + roomServiceSales;

  // Payment Breakdown
  const paymentBreakdown = paidOrders.reduce(
    (acc, order) => {
      const method = order.paymentMethod || 'Cash';
      const amt = order.totalAmount || 0;
      if (method.includes('Fonepay')) acc.fonepay += amt;
      else if (method.includes('eSewa')) acc.esewa += amt;
      else if (method.includes('Khalti')) acc.khalti += amt;
      else if (method.includes('Card')) acc.card += amt;
      else acc.cash += amt;
      return acc;
    },
    { cash: 0, fonepay: 0, esewa: 0, khalti: 0, card: 0 }
  );

  // Digital payments sum
  const digitalPaymentsSum =
    paymentBreakdown.fonepay +
    paymentBreakdown.esewa +
    paymentBreakdown.khalti +
    paymentBreakdown.card;

  // Filtered orders list
  const filteredOrders = paidOrders.filter((o) => {
    if (activePaymentFilter === 'all') return true;
    if (activePaymentFilter === 'cash') return (o.paymentMethod || '').includes('Cash');
    if (activePaymentFilter === 'fonepay') return (o.paymentMethod || '').includes('Fonepay');
    if (activePaymentFilter === 'esewa') return (o.paymentMethod || '').includes('eSewa');
    if (activePaymentFilter === 'khalti') return (o.paymentMethod || '').includes('Khalti');
    if (activePaymentFilter === 'card') return (o.paymentMethod || '').includes('Card');
    return true;
  });

  // Low stock items
  const lowStockItems = menuItems.filter(
    (item) => item.stockQuantity <= (item.lowStockThreshold ?? 5)
  );

  const handlePerformDayClose = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsDayClosed(true);
    setClosedTimestamp(timeString);
    setShowZReportModal(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Screen Header & Day Close Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Shift & Daily Ledger • Kathmandu Time (NPT)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Day Close & Sales Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily financial reconciliation, digital wallet settlement breakdown, and inventory audit.
          </p>
        </div>

        {/* Day Close Status / Action */}
        <div className="flex items-center gap-3">
          {isDayClosed ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <Lock className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-extrabold uppercase">Shift Settled (Closed)</div>
                <div className="text-[11px] text-emerald-400/80 font-mono">
                  Closed at {closedTimestamp} by Shift Manager
                </div>
              </div>
              <button
                onClick={() => setShowZReportModal(true)}
                className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                View Z-Report
              </button>
            </div>
          ) : (
            <button
              onClick={handlePerformDayClose}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Lock className="w-4 h-4" />
              <span>Perform Day Close (Z-Report)</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales (POS + Rooms)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            Rs. {totalGrossCombined.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>POS: {grossSales.toFixed(0)} | Stay: {roomStayIncome.toFixed(0)} | Svc: {roomServiceSales.toFixed(0)}</span>
          </div>
        </div>

        {/* 13% Nepali VAT */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">13% Nepal VAT</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            Rs. {totalVat.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            PAN: 601928374 (IRD Compliant)
          </div>
        </div>

        {/* Discounts */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Discounts Given</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">
            - Rs. {totalDiscounts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Promotional / Manager overrides
          </div>
        </div>

        {/* Net Revenue */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              Net Total (POS + Rooms)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            Rs. {netRevenueCombined.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-500/80 mt-1 font-medium">
            Includes settled POS & Room Bookings
          </div>
        </div>
      </div>

      {/* Payment Channel Breakdown (Nepali Wallets & Cash) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Settlement Channels Breakdown (Nepal Digital Wallets & Cash)
            </h2>
            <p className="text-xs text-slate-400">
              Digital Wallets make up{' '}
              <span className="font-bold text-emerald-400">
                {netRevenue > 0 ? Math.round((digitalPaymentsSum / netRevenue) * 100) : 0}%
              </span>{' '}
              of today's collections.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span>Cash: Rs. {paymentBreakdown.cash.toFixed(2)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">
              Digital: Rs. {digitalPaymentsSum.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 5 Payment Channel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {/* 1. Cash NPR */}
          <div
            onClick={() => setActivePaymentFilter(activePaymentFilter === 'cash' ? 'all' : 'cash')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activePaymentFilter === 'cash'
                ? 'bg-slate-800 border-amber-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Banknote className="w-4 h-4 text-emerald-400" />
                Cash NPR
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {netRevenue > 0 ? Math.round((paymentBreakdown.cash / netRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              Rs. {paymentBreakdown.cash.toFixed(2)}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{
                  width: `${netRevenue > 0 ? (paymentBreakdown.cash / netRevenue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 2. Fonepay / NepalPay */}
          <div
            onClick={() => setActivePaymentFilter(activePaymentFilter === 'fonepay' ? 'all' : 'fonepay')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activePaymentFilter === 'fonepay'
                ? 'bg-slate-800 border-red-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                <QrCode className="w-4 h-4 text-red-500" />
                Fonepay QR
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-mono">
                {netRevenue > 0 ? Math.round((paymentBreakdown.fonepay / netRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              Rs. {paymentBreakdown.fonepay.toFixed(2)}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-red-500 h-full rounded-full"
                style={{
                  width: `${netRevenue > 0 ? (paymentBreakdown.fonepay / netRevenue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 3. eSewa QR */}
          <div
            onClick={() => setActivePaymentFilter(activePaymentFilter === 'esewa' ? 'all' : 'esewa')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activePaymentFilter === 'esewa'
                ? 'bg-slate-800 border-green-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <QrCode className="w-4 h-4 text-green-500" />
                eSewa QR
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-950 text-green-300 font-mono">
                {netRevenue > 0 ? Math.round((paymentBreakdown.esewa / netRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              Rs. {paymentBreakdown.esewa.toFixed(2)}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-green-500 h-full rounded-full"
                style={{
                  width: `${netRevenue > 0 ? (paymentBreakdown.esewa / netRevenue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 4. Khalti QR */}
          <div
            onClick={() => setActivePaymentFilter(activePaymentFilter === 'khalti' ? 'all' : 'khalti')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activePaymentFilter === 'khalti'
                ? 'bg-slate-800 border-purple-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <QrCode className="w-4 h-4 text-purple-500" />
                Khalti QR
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                {netRevenue > 0 ? Math.round((paymentBreakdown.khalti / netRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              Rs. {paymentBreakdown.khalti.toFixed(2)}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{
                  width: `${netRevenue > 0 ? (paymentBreakdown.khalti / netRevenue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 5. Card / POS */}
          <div
            onClick={() => setActivePaymentFilter(activePaymentFilter === 'card' ? 'all' : 'card')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              activePaymentFilter === 'card'
                ? 'bg-slate-800 border-blue-500 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Card / POS
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
                {netRevenue > 0 ? Math.round((paymentBreakdown.card / netRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              Rs. {paymentBreakdown.card.toFixed(2)}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${netRevenue > 0 ? (paymentBreakdown.card / netRevenue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Settled Orders Ledger & Stock Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Settled Orders Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  Settled Orders Ledger
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                    {filteredOrders.length} orders
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {activePaymentFilter === 'all'
                    ? 'Showing all payment channels'
                    : `Filtered by: ${activePaymentFilter.toUpperCase()}`}
                </p>
              </div>

              {activePaymentFilter !== 'all' && (
                <button
                  onClick={() => setActivePaymentFilter('all')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="mt-4 divide-y divide-slate-800 max-h-[460px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No orders found for the selected filter.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          Table #{order.tableNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {order.orderId}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          PAID
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="text-amber-400 font-medium">
                          {order.paymentMethod || 'Cash'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {order.transactionRef || order.settledAt || order.timestamp}
                        </span>
                        <span>•</span>
                        <span>{order.itemsList.length} items</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-white">
                          Rs. {order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          VAT: Rs. {order.taxAmount.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        title="Print 58/80mm Thermal Receipt"
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Real-Time Inventory & Low Stock */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Kitchen Inventory & Stock Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Deducts automatically as tickets are processed
                </p>
              </div>

              {lowStockItems.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockItems.length} Low
                </span>
              )}
            </div>

            {/* Low stock alerts notice */}
            {lowStockItems.length > 0 && (
              <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Attention Chef & Bar Manager:
                </div>
                <div>
                  {lowStockItems.map((i) => i.name).join(', ')} are nearing exhaustion! Use quick restock below.
                </div>
              </div>
            )}

            {/* Inventory Items List */}
            <div className="divide-y divide-slate-800 max-h-[380px] overflow-y-auto pr-1 mt-3">
              {menuItems.map((item) => {
                const isLow = item.stockQuantity <= (item.lowStockThreshold ?? 5);
                const isOut = item.stockQuantity <= 0;

                return (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/30 px-2 rounded-lg"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>Rs. {item.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                          isOut
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.stockQuantity} left
                      </span>

                      <button
                        onClick={() => onRestockItem(item.id, 10)}
                        title="Quick Restock +10 portions"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+10</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Z-Report Modal / Dialog */}
      {showZReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 font-mono text-xs my-6 relative">
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-400">
              <div className="font-black text-sm uppercase text-slate-950">
                DAILY SHIFT SETTLEMENT (Z-REPORT)
              </div>
              <div className="font-extrabold text-xs text-slate-700 mt-1">
                HIMALAYAN RESTAURANT & BAR
              </div>
              <div className="text-[10px] text-slate-500">
                Durbar Marg, Kathmandu • PAN: 601928374
              </div>
            </div>

            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-bold">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shift Status:</span>
                <span className="font-bold text-emerald-700">CLOSED & AUDITED</span>
              </div>
              <div className="flex justify-between">
                <span>Settled At:</span>
                <span className="font-bold">{closedTimestamp || 'Current Time'}</span>
              </div>
              <div className="flex justify-between">
                <span>Terminal:</span>
                <span>POS-MAIN-01</span>
              </div>
            </div>

            {/* Financials */}
            <div className="py-3 border-b-2 border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Total Orders Cleared:</span>
                <span className="font-bold">{paidOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Gross Revenue:</span>
                <span>Rs. {grossSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Discounts Given:</span>
                <span>- Rs. {totalDiscounts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxable Sales:</span>
                <span>Rs. {(grossSales - totalDiscounts).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>13% Nepal VAT:</span>
                <span>Rs. {totalVat.toFixed(2)}</span>
              </div>
              <div className="pt-2 flex justify-between font-black text-sm text-slate-950 border-t border-slate-300">
                <span>NET REGISTER TOTAL:</span>
                <span>Rs. {netRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Channel summary */}
            <div className="py-3 border-b-2 border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="font-bold text-[10px] text-slate-500 uppercase pb-1">
                Tender Breakdown:
              </div>
              <div className="flex justify-between">
                <span>Cash in Drawer:</span>
                <span className="font-bold">Rs. {paymentBreakdown.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fonepay / NepalPay QR:</span>
                <span className="font-bold">Rs. {paymentBreakdown.fonepay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>eSewa Merchant QR:</span>
                <span className="font-bold">Rs. {paymentBreakdown.esewa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Khalti Merchant QR:</span>
                <span className="font-bold">Rs. {paymentBreakdown.khalti.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>POS Credit/Debit Cards:</span>
                <span className="font-bold">Rs. {paymentBreakdown.card.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 text-center space-y-3">
              <div className="text-[10px] text-slate-500">
                Manager Signature: _______________________
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Z-Report
                </button>
                <button
                  onClick={() => setShowZReportModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {selectedReceiptOrder && (
        <ThermalReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          initialMode="customer"
        />
      )}
    </div>
  );
};
