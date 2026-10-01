import React, { useState } from 'react';
import { TableModel } from '../types/pos';
import { Users, UtensilsCrossed, CheckCircle2, Clock, PlusCircle, Lock } from 'lucide-react';

interface Props {
  tables: TableModel[];
  onSelectTable: (table: TableModel) => void;
  selectedTableNumber: number | null;
  onQuickCheckout?: (tableNumber: number) => void;
  restaurantName?: string;
  isBlockedByTrial?: boolean;
  onOpenSubscription?: () => void;
}

export const TableSelectionScreen: React.FC<Props> = ({
  tables,
  onSelectTable,
  selectedTableNumber,
  onQuickCheckout,
  restaurantName = 'HIMALAYAN GRAND RESORT & BAR',
  isBlockedByTrial = false,
  onOpenSubscription,
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');

  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  const filteredTables = tables.filter((table) => {
    if (filter === 'available') return table.status === 'available';
    if (filter === 'occupied') return table.status === 'occupied';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Compact Minimal Height Welcome Banner with Fire Left, Hotel Name Center, Coffee Right (No Occupied/Free text) */}
      <div className="mx-3 sm:mx-4 mt-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-950 via-amber-950 to-slate-950 border border-amber-500/30 shadow flex items-center justify-between gap-3 flex-shrink-0">
        {/* Left: Fire / Sizzling BBQ */}
        <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs sm:text-sm animate-pulse">
          <span className="text-base">🔥</span>
          <span className="hidden sm:inline font-bold tracking-tight text-orange-300">Sizzling BBQ</span>
        </div>

        {/* Center: Hotel Name nicely displayed */}
        <div className="text-center px-2">
          <h2 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 truncate max-w-[240px] sm:max-w-md">
            {restaurantName}
          </h2>
        </div>

        {/* Right: Coffee / Steam */}
        <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
          <span className="animate-bounce text-base">☕</span>
          <span className="text-[11px] text-amber-200 hidden sm:inline">Hot Coffee</span>
        </div>
      </div>

      {/* Seamless Floor View Header & Filters */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Floor View
            </span>
            <span className="text-xs text-slate-400">Real-time Matrix</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-white mt-0.5">
            Table Selection & Dine-In Floor
          </h1>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-500'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({tables.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
              filter === 'available'
                ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500'
                : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Free ({availableCount})
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
              filter === 'occupied'
                ? 'bg-rose-500/30 text-rose-300 ring-1 ring-rose-500'
                : 'bg-slate-800 text-slate-400 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Occupied ({occupiedCount})
          </button>
        </div>
      </div>

      {/* Tables Grid - Fully Responsive with Zero Black Gaps */}
      <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
        {isBlockedByTrial && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0">
                <Lock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-300">
                  बिलिङ तथा KOT प्रणाली स्वतः लक गरिएको छ (Billing Blocked)
                </h3>
                <p className="text-xs text-slate-300">
                  तपाईंको १५ दिनको निःशुल्क ट्रायल सकिएको छ। टेबल अर्डर लिन र बिलिङ सुरु गर्न सदस्यता अपग्रेड गर्नुहोस्।
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSubscription}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>अहिले अनलक गर्नुहोस्</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredTables.map((table) => {
            const isAvailable = table.status === 'available';
            const isSelected = selectedTableNumber === table.tableNumber;

            return (
              <button
                key={table.tableNumber}
                onClick={() => onSelectTable(table)}
                className={`relative group text-left rounded-2xl p-3 sm:p-4 transition-all duration-200 border-2 ${
                  isSelected
                    ? 'ring-4 ring-amber-500/50 scale-[1.02]'
                    : 'hover:scale-[1.02]'
                } ${
                  isAvailable
                    ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-950/30 shadow-lg shadow-emerald-950/40'
                    : 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400 hover:bg-rose-950/30 shadow-lg shadow-rose-950/40'
                }`}
              >
                {/* Header: Table No & Seats */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black text-white">
                      T-{table.tableNumber}
                    </span>
                    {isAvailable ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="font-bold">{table.seatingCapacity}s</span>
                  </div>
                </div>

                {/* Center Visual */}
                <div className="py-1 sm:py-2 flex flex-col items-center justify-center">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30'
                    }`}
                  >
                    <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                </div>

                {/* Details / Occupied Info */}
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wide text-[10px] sm:text-[11px] ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {isAvailable ? 'FREE' : 'BUSY'}
                  </span>

                  {isAvailable ? (
                    <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <PlusCircle className="w-3.5 h-3.5" />
                      Order
                    </span>
                  ) : (
                    <div className="text-slate-400 flex items-center gap-1 text-[10px] sm:text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{table.occupiedSince || 'Active'}</span>
                    </div>
                  )}
                </div>

                {table.currentOrderId && (
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800">
                    <span className="text-amber-300 font-mono font-medium truncate">
                      {table.currentOrderId}
                    </span>
                    {onQuickCheckout && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickCheckout(table.tableNumber);
                        }}
                        className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 border border-blue-500/30 text-[10px] font-bold"
                      >
                        Bill
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
