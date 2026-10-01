import React, { useState } from 'react';
import { OrderItem, TableModel, OrderModel } from '../types/pos';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import {
  ArrowLeft,
  Send,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  User,
} from 'lucide-react';

interface Props {
  table: TableModel;
  cart: OrderItem[];
  kitchenNote: string;
  onUpdateKitchenNote: (note: string) => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onSendToKitchen: (serverName: string) => Promise<boolean>;
  onBackToMenu: () => void;
  onBackToTables: () => void;
}

export const OrderReviewScreen: React.FC<Props> = ({
  table,
  cart,
  kitchenNote,
  onUpdateKitchenNote,
  onUpdateQuantity,
  onRemoveItem,
  onSendToKitchen,
  onBackToMenu,
  onBackToTables,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('Rajesh Shrestha (Waiter)');

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = cartSubtotal * 0.13; // 13% Nepal VAT
  const totalAmount = cartSubtotal + taxAmount;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [slipMode, setSlipMode] = useState<'customer' | 'kot'>('kot');

  const handlePushOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSendToKitchen(selectedStaff);
    setIsSubmitting(false);

    if (success) {
      const generatedId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedOrderId(generatedId);
      setSubmitSuccess(true);
    }
  };

  const previewOrderObject: OrderModel = {
    orderId: createdOrderId || 'ORD-NEW',
    tableNumber: table.tableNumber,
    itemsList: cart,
    subtotal: cartSubtotal,
    taxAmount,
    totalAmount,
    status: 'pending',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    kitchenNote,
    serverName: selectedStaff,
  };

  if (submitSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mb-5 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Firestore Real-Time Sync Success</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Order Dispatched to Kitchen!
        </h2>
        <p className="text-slate-400 text-sm max-w-md mt-2">
          The order has been written to the <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded">orders/</code> Firestore collection. 
          Table #{table.tableNumber} status is now updated to <strong className="text-rose-400">OCCUPIED</strong>.
        </p>

        <div className="my-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-left w-full max-w-sm">
          <div className="flex justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span>Dispatched Table:</span>
            <span className="font-bold text-white">Table #{table.tableNumber}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 py-2 border-b border-slate-800">
            <span>Items Count:</span>
            <span className="font-bold text-white">{totalItemsCount} items</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-2">
            <span>Total Amount (Inc. 13% VAT):</span>
            <span className="font-black text-amber-400">NPR {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setSlipMode('kot');
              setShowSlipModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all shadow-md"
          >
            <ChefHat className="w-4 h-4" />
            <span>Print Kitchen KOT Slip</span>
          </button>

          <button
            onClick={() => {
              setSlipMode('customer');
              setShowSlipModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Print Guest Check</span>
          </button>

          <button
            onClick={onBackToTables}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Back to Floor View
          </button>
        </div>

        {showSlipModal && (
          <ThermalReceiptModal
            order={previewOrderObject}
            initialMode={slipMode}
            onClose={() => setShowSlipModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Screen C: Final Verification
              </span>
              <span className="text-xs text-slate-400">Table #{table.tableNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Order Review & Kitchen Dispatch
            </h1>
          </div>
        </div>
      </div>

      {/* Main Review Content */}
      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 flex-1">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No items in the order</h3>
            <p className="text-slate-400 text-sm mt-1">
              Please go back to the menu to add delicious Nepali items to Table #{table.tableNumber}.
            </p>
            <button
              onClick={onBackToMenu}
              className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
            >
              Go to Menu
            </button>
          </div>
        ) : (
          <>
            {/* Table & Order Info Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl border border-amber-500/30">
                  T{table.tableNumber}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Table #{table.tableNumber} • Dine-In
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>Capacity: {table.seatingCapacity} seats</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Order Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Items Count</span>
                <div className="text-xl font-black text-white">
                  {totalItemsCount} item{totalItemsCount > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Itemized Order List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ordered Dishes & Drinks
                </span>
                <span className="text-xs font-mono text-slate-400">Nepali Currency (NPR)</span>
              </div>

              <div className="divide-y divide-slate-800">
                {cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        NPR {item.price.toFixed(0)} per portion
                      </div>

                      {item.specialInstructions && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                          <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                          <span>Special: {item.specialInstructions}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="w-6 text-center font-black text-sm text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-base font-black text-amber-400">
                          NPR {(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff / Server Selector Box */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  KOT Issuing Staff / Server (Waiter, Receptionist, Manager)
                </h4>
              </div>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              >
                <option value="Rajesh Shrestha (Waiter)">Rajesh Shrestha (Waiter)</option>
                <option value="Pooja Thapa (Waiter & Floor Captain)">Pooja Thapa (Waiter & Floor Captain)</option>
                <option value="Bikash Shrestha (Restaurant Manager)">Bikash Shrestha (Restaurant Manager)</option>
                <option value="Sunita Maharjan (Front Receptionist)">Sunita Maharjan (Front Receptionist)</option>
                <option value="Sujan Karki (Accountant / Manager)">Sujan Karki (Accountant / Manager)</option>
              </select>
            </div>

            {/* Kitchen Instructions Box */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Kitchen Notes & Special Instructions
                </h4>
              </div>
              <textarea
                rows={2}
                value={kitchenNote}
                onChange={(e) => onUpdateKitchenNote(e.target.value)}
                placeholder="e.g. Serve Mo:Mo appetizers first, pack leftovers, customer allergic to peanuts..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Bill Summary Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Receipt className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Payment & Bill Estimate</h4>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({totalItemsCount} items)</span>
                  <span className="font-semibold text-slate-200">
                    NPR {cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>13% Nepal VAT</span>
                  <span className="font-semibold text-slate-200">
                    NPR {taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-lg font-black text-white">
                  <span>Total Amount Due</span>
                  <span className="text-xl text-amber-400 font-black">
                    NPR {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Push to Kitchen CTA */}
            <div className="pt-2">
              <button
                disabled={isSubmitting || cart.length === 0}
                onClick={handlePushOrder}
                className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl transition-all ${
                  isSubmitting
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 shadow-orange-600/25 active:scale-98'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    <span>PULLING REAL-TIME TRANSACTION (FIRESTORE)...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5 stroke-[2.5]" />
                    <span>SEND TO KITCHEN (PUSH TO FIRESTORE)</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-2">
                This triggers a multi-document Firestore write: creates new doc in <code className="text-amber-400">orders/</code> and sets table status to <code className="text-rose-400">occupied</code>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
