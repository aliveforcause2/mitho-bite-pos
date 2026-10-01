import React, { useState, useEffect } from 'react';
import { OrderModel, OrderStatus } from '../types/pos';
import {
  ChefHat,
  Clock,
  Flame,
  CheckCheck,
  AlertCircle,
  Filter,
  Volume2,
  Utensils,
  Receipt,
  Sparkles,
  Printer,
} from 'lucide-react';
import { ThermalReceiptModal } from './ThermalReceiptModal';

interface Props {
  orders: OrderModel[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onOpenCheckout: (order: OrderModel) => void;
}

export const KitchenDisplayScreen: React.FC<Props> = ({
  orders,
  onUpdateOrderStatus,
  onOpenCheckout,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'served'>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [kotPrintOrder, setKotPrintOrder] = useState<OrderModel | null>(null);

  // Timer update every 10 seconds for elapsed prep time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter out paid or cancelled orders in active KDS
  const activeOrders = orders.filter((o) => o.status !== 'paid' && o.status !== 'cancelled');

  const filteredOrders = activeOrders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getElapsedTimeText = (order: OrderModel) => {
    if (!order.createdAtMs) {
      return order.timestamp || 'Just now';
    }
    const elapsedMinutes = Math.floor((currentTime - order.createdAtMs) / 60000);
    if (elapsedMinutes <= 0) return 'Just now (<1m)';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
    return `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m ago`;
  };

  const getElapsedBadgeColor = (order: OrderModel) => {
    if (!order.createdAtMs) return 'bg-slate-800 text-slate-300';
    const elapsedMinutes = Math.floor((currentTime - order.createdAtMs) / 60000);
    if (elapsedMinutes >= 20) return 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
    if (elapsedMinutes >= 10) return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header / KDS Control Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                Phase 2: Live Kitchen Display System (KDS)
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Real-time Firestore stream
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
              <span>Chef Kitchen Terminal & Expediting</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Kitchen staff track live tickets, observe elapsed cooking times, and progress tickets: <strong>Pending → Cooking → Ready to Serve</strong>.
            </p>
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'pending'
                  ? 'bg-rose-500/30 text-rose-300 ring-1 ring-rose-500'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Pending ({activeOrders.filter((o) => o.status === 'pending').length})</span>
            </button>
            <button
              onClick={() => setFilter('preparing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'preparing'
                  ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Cooking ({activeOrders.filter((o) => o.status === 'preparing').length})</span>
            </button>
            <button
              onClick={() => setFilter('served')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'served'
                  ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready / Served ({activeOrders.filter((o) => o.status === 'served').length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KDS Grid */}
      <div className="p-4 sm:p-6 flex-1">
        {filteredOrders.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
            <ChefHat className="w-14 h-14 text-slate-600 mb-3" />
            <h3 className="text-xl font-bold text-white">All Kitchen Orders Cleared!</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md">
              No orders in this queue. Take a new order from <strong>Screen A (Table Floor)</strong> or <strong>Screen B (Menu Ordering)</strong> to see tickets appear in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const isPending = order.status === 'pending';
              const isPreparing = order.status === 'preparing';
              const isServed = order.status === 'served';

              return (
                <div
                  key={order.orderId}
                  className={`rounded-2xl border-2 flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-xl ${
                    isPending
                      ? 'bg-rose-950/20 border-rose-500/60 shadow-rose-950/30'
                      : isPreparing
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-amber-950/30'
                      : 'bg-emerald-950/20 border-emerald-500/60 shadow-emerald-950/30'
                  }`}
                >
                  {/* Top Ticket Header */}
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      isPending
                        ? 'bg-rose-950/40 border-rose-900/50'
                        : isPreparing
                        ? 'bg-amber-950/40 border-amber-900/50'
                        : 'bg-emerald-950/40 border-emerald-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-lg text-white shadow-inner">
                        T{order.tableNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-white">
                            Table #{order.tableNumber}
                          </h3>
                          <span className="font-mono text-[11px] text-slate-400">
                            {order.orderId}
                          </span>
                        </div>
                        {/* Elapsed Cooking Timer & Server Name */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${getElapsedBadgeColor(
                              order
                            )}`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>Elapsed: {getElapsedTimeText(order)}</span>
                          </div>
                          {order.serverName && (
                            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              👤 {order.serverName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stage Badge & KOT Print */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setKotPrintOrder(order)}
                        title="Print Kitchen KOT Slip (ESC/POS)"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>KOT</span>
                      </button>

                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          isPending
                            ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                            : isPreparing
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                            : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        }`}
                      >
                        {isPending ? 'Pending' : isPreparing ? 'Cooking' : 'Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-2.5 flex-1 bg-slate-900/50">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                      <span>Ordered Dishes ({order.itemsList.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                      <span>Line Total</span>
                    </div>

                    <div className="space-y-2">
                      {order.itemsList.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs">
                                {item.quantity}×
                              </span>
                              <span className="font-extrabold text-sm text-white">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-mono text-xs text-slate-400">
                              Rs. {(item.price * item.quantity).toFixed(0)}
                            </span>
                          </div>

                          {/* Special Chef Instructions */}
                          {item.specialInstructions && (
                            <div className="mt-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold italic flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Instruction: "{item.specialInstructions}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* General Table / Kitchen Note */}
                    {order.kitchenNote && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-200">
                        <span className="font-black uppercase tracking-wider text-orange-400 block mb-0.5">
                          Table Kitchen Note:
                        </span>
                        {order.kitchenNote}
                      </div>
                    )}
                  </div>

                  {/* KDS Status Transition Control Buttons */}
                  <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Order Value (Est.)</span>
                      <span className="text-sm font-black text-amber-400">
                        Rs. {order.totalAmount.toFixed(0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.orderId, 'preparing')}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          <Flame className="w-4 h-4 stroke-[3]" />
                          <span>MARK COOKING (START PREP)</span>
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.orderId, 'served')}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <CheckCheck className="w-4 h-4 stroke-[3]" />
                          <span>MARK READY TO SERVE</span>
                        </button>
                      )}

                      {isServed && (
                        <div className="w-full flex items-center gap-2">
                          <button
                            onClick={() => onOpenCheckout(order)}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>CHECKOUT & BILL TABLE #{order.tableNumber}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KOT Print Modal */}
      {kotPrintOrder && (
        <ThermalReceiptModal
          order={kotPrintOrder}
          initialMode="kot"
          onClose={() => setKotPrintOrder(null)}
        />
      )}
    </div>
  );
};
