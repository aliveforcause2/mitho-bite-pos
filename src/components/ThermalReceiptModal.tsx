import React, { useState } from 'react';
import { OrderModel } from '../types/pos';
import {
  Printer,
  X,
  FileText,
  UtensilsCrossed,
  CheckCircle2,
  Copy,
  Check,
  Percent,
} from 'lucide-react';

interface ThermalReceiptModalProps {
  order: OrderModel;
  onClose: () => void;
  initialMode?: 'customer' | 'kot';
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  onClose,
  initialMode = 'customer',
}) => {
  const [printMode, setPrintMode] = useState<'customer' | 'kot'>(initialMode);
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [copied, setCopied] = useState(false);

  const subtotal = order.itemsList.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const discountAmount = order.discountAmount ?? ((subtotal * (order.discountPercent ?? 0)) / 100);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const vatAmount = order.taxAmount ?? (taxableBase * 0.13);
  const grandTotal = order.totalAmount ?? (taxableBase + vatAmount);

  const handleCopyText = () => {
    let text = '';
    if (printMode === 'customer') {
      text = `
========================================
    HIMALAYAN RESTAURANT & BAR PVT. LTD.
    Durbar Marg, Kathmandu, Nepal
    PAN: 601928374 | Tel: +977-1-4228901
========================================
Receipt #: REC-${order.orderId}
Table: Table #${order.tableNumber}
Date: ${new Date().toLocaleDateString()} ${order.timestamp}
Cashier: Front Desk / POS-01
----------------------------------------
ITEM                  QTY   PRICE  TOTAL
----------------------------------------
${order.itemsList
  .map(
    (i) =>
      `${i.name.slice(0, 18).padEnd(18)}  ${i.quantity}x  ${i.price}  Rs.${(i.price * i.quantity).toFixed(2)}`
  )
  .join('\n')}
----------------------------------------
Subtotal:                       Rs. ${subtotal.toFixed(2)}
Discount (${order.discountPercent ?? 0}%):                 - Rs. ${discountAmount.toFixed(2)}
Taxable Base:                   Rs. ${taxableBase.toFixed(2)}
13% Nepal VAT:                  Rs. ${vatAmount.toFixed(2)}
----------------------------------------
GRAND TOTAL:                    Rs. ${grandTotal.toFixed(2)}
Payment Mode:                   ${order.paymentMethod || 'Cash NPR'}
Ref / Txn ID:                   ${order.transactionRef || 'N/A'}
========================================
        DHANYABAD! THANK YOU!
      Prices are inclusive of VAT
========================================
      `;
    } else {
      text = `
========================================
        KITCHEN ORDER TICKET (KOT)
              CHEF SLIP
========================================
KOT #: KOT-${order.orderId}
TABLE #: ${order.tableNumber}
Time: ${order.timestamp}
Server: ${order.serverName || 'Staff Member'}
----------------------------------------
QTY   ITEM NAME & INSTRUCTIONS
----------------------------------------
${order.itemsList
  .map(
    (i) =>
      `[ ${i.quantity}x ]  ${i.name.toUpperCase()}\n${
        i.specialInstructions ? `     >> Note: ${i.specialInstructions}\n` : ''
      }`
  )
  .join('')}
----------------------------------------
Kitchen Note: ${order.kitchenNote || 'None'}
========================================
      `;
    }

    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Thermal Slip Generator
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  ESC/POS Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Table #{order.tableNumber} • Order {order.orderId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-950/40 border-b border-slate-800">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setPrintMode('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                printMode === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Customer Tax Bill
            </button>
            <button
              onClick={() => setPrintMode('kot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                printMode === 'kot'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Kitchen KOT Slip
            </button>
          </div>

          {/* Width Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Roll Width:</span>
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  paperWidth === '80mm'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm (Standard)
              </button>
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  paperWidth === '58mm'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm (Compact)
              </button>
            </div>
          </div>
        </div>

        {/* Paper Simulation Canvas */}
        <div className="p-6 bg-slate-950/80 flex justify-center">
          <div
            className={`bg-white text-slate-900 rounded-sm shadow-2xl p-6 font-mono text-xs transition-all relative ${
              paperWidth === '80mm' ? 'w-[360px]' : 'w-[280px]'
            }`}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Serrated Top Edge */}
            <div className="absolute -top-2 left-0 right-0 h-2 bg-radial from-slate-900 to-transparent bg-[length:8px_8px] opacity-20 pointer-events-none" />

            {printMode === 'customer' ? (
              /* CUSTOMER 13% VAT RECEIPT */
              <div>
                <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                  <div className="font-extrabold text-sm tracking-wide text-slate-950 uppercase">
                    Himalayan Restaurant & Bar
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    Durbar Marg, Kathmandu, Nepal
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 mt-1">
                    PAN / VAT REG: 601928374
                  </div>
                  <div className="text-[10px] text-slate-500">Tel: +977-1-4228901</div>
                </div>

                <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="font-bold">INVOICE: #{order.orderId}</span>
                    <span>Table #{order.tableNumber}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{new Date().toLocaleDateString('en-GB')} {order.timestamp}</span>
                    <span>POS Terminal #1</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700 font-semibold pt-0.5">
                    <span>Server / Waiter: {order.serverName || 'Front Desk'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700 font-semibold">
                    <span>Chef / Cook on Duty: Chef Santosh Karki</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="py-2.5 border-b-2 border-dashed border-slate-300">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase pb-1 border-b border-slate-200">
                    <span className="col-span-6">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-4 text-right">Amt (NPR)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {order.itemsList.map((item, idx) => (
                      <div key={idx} className="py-1.5 grid grid-cols-12 items-baseline text-[11px]">
                        <div className="col-span-6 font-semibold text-slate-800 truncate pr-1">
                          {item.name}
                        </div>
                        <div className="col-span-2 text-center text-slate-600">
                          {item.quantity}
                        </div>
                        <div className="col-span-4 text-right font-medium text-slate-900">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals & Taxes */}
                <div className="py-2.5 space-y-1 text-[11px] border-b-2 border-dashed border-slate-300">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  {(order.discountPercent ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({order.discountPercent}%):</span>
                      <span>- Rs. {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Base:</span>
                    <span>Rs. {taxableBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>13% Nepal VAT:</span>
                    <span>Rs. {vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 flex justify-between font-extrabold text-sm text-slate-950 border-t border-slate-200">
                    <span>GRAND TOTAL:</span>
                    <span>Rs. {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div className="py-2.5 text-[10px] space-y-0.5 text-slate-600 border-b border-dashed border-slate-300">
                  <div className="flex justify-between">
                    <span className="font-semibold">Paid Via:</span>
                    <span className="font-bold text-slate-900">
                      {order.paymentMethod || 'Cash NPR'}
                    </span>
                  </div>
                  {order.transactionRef && (
                    <div className="flex justify-between">
                      <span>Ref / Txn ID:</span>
                      <span className="font-mono">{order.transactionRef}</span>
                    </div>
                  )}
                </div>

                {/* Footer Notice */}
                <div className="text-center pt-3 space-y-1">
                  <div className="text-[10px] font-extrabold tracking-wider text-slate-800">
                    DHANYABAD! THANK YOU!
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Software: Himalayan POS • Licensed to Durbar Marg Branch
                  </div>
                </div>
              </div>
            ) : (
              /* KITCHEN ORDER TICKET (KOT) */
              <div>
                <div className="text-center pb-3 border-b-2 border-dashed border-slate-400">
                  <div className="font-black text-base tracking-wider text-slate-950 uppercase">
                    *** KITCHEN ORDER TICKET ***
                  </div>
                  <div className="text-xs font-extrabold text-slate-800 mt-1">
                    KOT #{order.orderId}
                  </div>
                </div>

                <div className="py-3 border-b-2 border-dashed border-slate-400 text-xs font-bold text-slate-900 space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-black">
                      TABLE #{order.tableNumber}
                    </span>
                    <span className="font-mono">{order.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold space-y-0.5">
                    <div>Server / Waiter: {order.serverName || 'Captain / Server 01'}</div>
                    <div>Assigned Cook / Chef: Chef Santosh Karki</div>
                  </div>
                </div>

                {/* KOT Items */}
                <div className="py-3 border-b-2 border-dashed border-slate-400 space-y-2">
                  {order.itemsList.map((item, idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-1.5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm bg-slate-200 px-1.5 py-0.5 rounded text-slate-950">
                          {item.quantity}x
                        </span>
                        <span className="font-bold text-xs uppercase text-slate-950">
                          {item.name}
                        </span>
                      </div>
                      {item.specialInstructions && (
                        <div className="ml-8 mt-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          ★ Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {order.kitchenNote && (
                  <div className="py-2.5 border-b border-dashed border-slate-300">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Chef Memo:</div>
                    <div className="text-xs font-bold text-amber-800 bg-amber-50 p-1.5 rounded mt-0.5">
                      {order.kitchenNote}
                    </div>
                  </div>
                )}

                <div className="pt-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  -- END OF KOT TICKET --
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Raw Receipt!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Thermal Text</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              Print Receipt (ESC/POS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
