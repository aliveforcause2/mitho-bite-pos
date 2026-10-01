import React from 'react';
import { OrderModel, SupplierPurchaseModel, ExpenseModel, RoomModel } from '../types/pos';
import { DollarSign, TrendingUp, TrendingDown, PieChart, ShieldCheck, Award, FileText, Calendar } from 'lucide-react';

interface Props {
  orders: OrderModel[];
  supplierPurchases: SupplierPurchaseModel[];
  expenses: ExpenseModel[];
  rooms: RoomModel[];
}

export const OwnerFinancialReportScreen: React.FC<Props> = ({
  orders,
  supplierPurchases,
  expenses,
  rooms,
}) => {
  // Income calculations
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const restaurantSales = paidOrders.reduce((s, o) => s + o.totalAmount, 0);

  // Room stay income from occupied rooms
  const roomStayIncome = rooms
    .filter((r) => r.status === 'occupied')
    .reduce((s, r) => s + (r.pricePerNight * (r.nights || 1) * (1 - (r.discountPercent || 0) / 100)), 0);

  // Room service food/beverage orders inside booked rooms
  const roomServiceSales = rooms.reduce((s, r) => {
    const itemsTotal = (r.orderedItems || []).reduce((acc, i) => acc + i.price * i.quantity, 0);
    return s + itemsTotal;
  }, 0);

  const totalGrossIncome = restaurantSales + roomStayIncome + roomServiceSales;

  // Expense calculations
  const totalSupplierSpend = supplierPurchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalOperatingExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalSupplierSpend + totalOperatingExpenses;

  const netProfit = totalGrossIncome - totalExpenses;
  const profitMargin = totalGrossIncome > 0 ? (netProfit / totalGrossIncome) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Owner Financial P&L
            </span>
            <span className="text-xs text-slate-400">
              Daily Income vs Expense & Net Profit
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-amber-400" />
            <span>दैनिक आम्दानी तथा खर्च P&L रिपोर्ट (Owner P&L Dashboard)</span>
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium">कुल आम्दानी (Gross Income)</span>
            <div className="text-2xl font-black text-amber-400 mt-1">NPR {totalGrossIncome.toFixed(0)}</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">POS: {restaurantSales.toFixed(0)} + Room Stay: {roomStayIncome.toFixed(0)} + Service: {roomServiceSales.toFixed(0)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium">कुल खर्च (Total Expenses)</span>
            <div className="text-2xl font-black text-rose-400 mt-1">NPR {totalExpenses.toFixed(0)}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Suppliers + Operating Costs</span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-500/20 text-rose-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium">शुद्ध नाफा (Net Profit)</span>
            <div className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              NPR {netProfit.toFixed(0)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Income minus Expenses</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium">नाफा मार्जिन (Profit Margin)</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">{profitMargin.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Net Margin Ratio</span>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown Detailed Sections */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>आम्दानी विवरण (Income Breakdown)</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                <span className="text-slate-300">🍽️ Restaurant POS Sales (Paid Orders)</span>
                <span className="font-bold text-amber-400">NPR {restaurantSales.toFixed(0)}</span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                <span className="text-slate-300">🏨 Hotel Room Bookings & Services</span>
                <span className="font-bold text-amber-400">NPR {(roomStayIncome + roomServiceSales).toFixed(0)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between font-black text-base">
            <span>Total Gross Income:</span>
            <span className="text-amber-400">NPR {totalGrossIncome.toFixed(0)}</span>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>खर्च तथा सप्लायर लगानी (Supplier & Expense Ledger)</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                <span className="text-slate-300">📦 Supplier Purchases (Veg, Meat, Gas Investment)</span>
                <span className="font-bold text-rose-400">NPR {totalSupplierSpend.toFixed(0)}</span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                <span className="text-slate-300">💸 Operating Expenses (Utility, Staff, Repairs)</span>
                <span className="font-bold text-rose-400">NPR {totalOperatingExpenses.toFixed(0)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between font-black text-base">
            <span>Total Expenses & Investments:</span>
            <span className="text-rose-400">NPR {totalExpenses.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Day Close & Profit / Loss Summary Banner */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Day Close & Net P&L Settled
          </span>
          <h4 className="text-lg font-black text-white mt-1">दैनिक बन्द तथा शुद्ध मुनाफा हिसाब (Day Close Balance)</h4>
          <p className="text-xs text-slate-400">All supplier purchases, inventory investments, and daily operational expenses have been deducted from restaurant & hotel gross revenues.</p>
        </div>
        <div className="text-right bg-slate-950 p-4 rounded-xl border border-slate-800 min-w-[220px]">
          <span className="text-xs text-slate-400 block font-medium">Net Profit / (Loss):</span>
          <span className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            NPR {netProfit.toFixed(0)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">ROI Margin: {profitMargin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
