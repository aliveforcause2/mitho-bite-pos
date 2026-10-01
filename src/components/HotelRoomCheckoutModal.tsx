import React, { useState } from 'react';
import { RoomModel, RoomOrderItem, HotelCheckoutSummary, ExtraChargeItem } from '../types/pos';
import {
  Printer,
  X,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  CreditCard,
  DollarSign,
  Utensils,
  Plus,
  Trash2,
  Copy,
  Check,
  Building2,
  FileText,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Banknote,
  Percent,
  Clock,
  BedDouble,
  FileCheck,
} from 'lucide-react';
import { amountToWordsEnglish } from '../utils/nepaliNumberWords';

interface Props {
  room: RoomModel;
  onClose: () => void;
  onConfirmCheckout: (summary: HotelCheckoutSummary) => void;
}

export const HotelRoomCheckoutModal: React.FC<Props> = ({
  room,
  onClose,
  onConfirmCheckout,
}) => {
  // Stay & Billing states
  const [nights, setNights] = useState<number>(room.nights || 1);
  const [discountPercent, setDiscountPercent] = useState<number>(room.discountPercent || 0);
  const [isVatEnabled, setIsVatEnabled] = useState<boolean>(true);
  const [cashierName, setCashierName] = useState<string>('Sujan Karki (Front Desk)');
  const [notes, setNotes] = useState<string>(room.notes || '');

  // Extra service charges (Laundry, Airport pickup, Minibar, Extra Bed, etc.)
  const [extraCharges, setExtraCharges] = useState<ExtraChargeItem[]>([]);
  const [newExtraTitle, setNewExtraTitle] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState<number | ''>('');

  // Payment Settlement states
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'eSewa' | 'Fonepay' | 'Card' | 'Credit / Khata'>('Cash');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [transactionRef, setTransactionRef] = useState('');
  const [copied, setCopied] = useState(false);

  // View state: 'billing' | 'tax_invoice' | 'thermal'
  const [activeView, setActiveView] = useState<'billing' | 'tax_invoice' | 'thermal'>('billing');
  const [isSettled, setIsSettled] = useState(false);

  // Generate stable invoice number
  const [invoiceNumber] = useState<string>(() => {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  });

  const checkInDateStr = room.checkInDate || new Date().toLocaleDateString();
  const checkOutDateStr = new Date().toLocaleDateString();
  const checkOutTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Financial calculations
  const pricePerNight = room.pricePerNight || 0;
  const roomRentGross = pricePerNight * (nights > 0 ? nights : 1);
  const roomDiscountAmount = (roomRentGross * (discountPercent || 0)) / 100;
  const roomRentNet = Math.max(0, roomRentGross - roomDiscountAmount);

  const foodOrders = room.orderedItems || [];
  const foodOrdersTotal = foodOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const extraChargesTotal = extraCharges.reduce((sum, item) => sum + item.amount, 0);

  const subtotal = roomRentNet + foodOrdersTotal + extraChargesTotal;
  const vatAmount = isVatEnabled ? subtotal * 0.13 : 0;
  const grandTotal = Math.round(subtotal + vatAmount);

  const numericCashReceived = Number(cashReceived) || 0;
  const changeDue = paymentMethod === 'Cash' && numericCashReceived >= grandTotal ? numericCashReceived - grandTotal : 0;

  // Add extra charge
  const handleAddExtraCharge = () => {
    if (!newExtraTitle.trim() || !newExtraAmount || Number(newExtraAmount) <= 0) return;
    setExtraCharges((prev) => [
      ...prev,
      {
        id: `extra-${Date.now()}`,
        title: newExtraTitle.trim(),
        amount: Number(newExtraAmount),
      },
    ]);
    setNewExtraTitle('');
    setNewExtraAmount('');
  };

  const handleRemoveExtraCharge = (id: string) => {
    setExtraCharges((prev) => prev.filter((i) => i.id !== id));
  };

  // Perform Final Checkout & Settle
  const handleFinalizeCheckout = () => {
    const summary: HotelCheckoutSummary = {
      id: `checkout-${room.id}-${Date.now()}`,
      invoiceNumber: `HTL-INV-${invoiceNumber}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      guestName: room.guestName || 'Guest',
      phone: room.phone,
      idCardType: room.idCardType,
      idCardNumber: room.idCardNumber,
      checkInDate: checkInDateStr,
      checkOutDate: checkOutDateStr,
      checkOutTime: checkOutTimeStr,
      nights,
      pricePerNight,
      roomRentGross,
      roomDiscountPercent: discountPercent,
      roomDiscountAmount,
      roomRentNet,
      foodOrders,
      foodOrdersTotal,
      extraCharges,
      extraChargesTotal,
      subtotal,
      isVatEnabled,
      vatAmount,
      grandTotal,
      paymentMethod,
      amountReceived: paymentMethod === 'Cash' ? numericCashReceived || grandTotal : grandTotal,
      changeDue,
      transactionRef: transactionRef.trim() || undefined,
      cashierName,
      notes,
      settledAt: `${checkOutDateStr} ${checkOutTimeStr}`,
    };

    onConfirmCheckout(summary);
    setIsSettled(true);
    setActiveView('tax_invoice');
  };

  // Print Bill
  const handlePrint = () => {
    window.print();
  };

  // Copy plain text receipt
  const handleCopyReceiptText = () => {
    const text = `
=====================================================
        HIMALAYAN GRAND HOTEL & RESORT PVT. LTD.
        Durbar Marg, Kathmandu, Nepal
        PAN/VAT: 601928374 | Tel: +977-1-4228901
=====================================================
TAX INVOICE #: HTL-INV-${invoiceNumber}
Date: ${checkOutDateStr} ${checkOutTimeStr}
Guest: ${room.guestName || 'Guest'}
Phone: ${room.phone || 'N/A'}
ID Doc: ${room.idCardType || 'Verified'} ${room.idCardNumber ? '#' + room.idCardNumber : ''}
Room #: ${room.roomNumber} (${room.roomType})
Stay: ${checkInDateStr} to ${checkOutDateStr} (${nights} Nights)
-----------------------------------------------------
PARTICULARS                QTY    RATE        AMOUNT
-----------------------------------------------------
Room Rent (${room.roomType})    ${nights}x   Rs.${pricePerNight}   Rs.${roomRentGross.toFixed(2)}
${discountPercent > 0 ? `Room Discount (${discountPercent}%)                     -Rs.${roomDiscountAmount.toFixed(2)}\n` : ''}${
      foodOrders.length > 0
        ? foodOrders
            .map(
              (f) =>
                `${f.name.slice(0, 20).padEnd(20)}   ${f.quantity}x   Rs.${f.price}   Rs.${(f.price * f.quantity).toFixed(2)}`
            )
            .join('\n') + '\n'
        : ''
    }${
      extraCharges.length > 0
        ? extraCharges
            .map((e) => `${e.title.slice(0, 20).padEnd(20)}   1x    Rs.${e.amount}   Rs.${e.amount.toFixed(2)}`)
            .join('\n') + '\n'
        : ''
    }-----------------------------------------------------
Subtotal:                                Rs.${subtotal.toFixed(2)}
${isVatEnabled ? `13% Nepal VAT:                           Rs.${vatAmount.toFixed(2)}\n` : ''}GRAND TOTAL:                             Rs.${grandTotal.toFixed(2)}
=====================================================
Payment: ${paymentMethod} (${isSettled ? 'PAID / चुक्ता' : 'PENDING'})
Amount in Words: ${amountToWordsEnglish(grandTotal)}
Cashier: ${cashierName}
Thank you for staying with us! Please visit again.
=====================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
        {/* Modal Top Header (Hidden in Print) */}
        <div className="no-print bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-white flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center text-emerald-300">
              <BedDouble className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">
                  रुम चेक-आउट तथा बिलिङ (Room Check-Out & Billing)
                </h3>
                {isSettled ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider animate-pulse">
                    सम्पन्न / PAID
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                    Room #{room.roomNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                पाहुना: <strong className="text-white">{room.guestName || 'Guest'}</strong> • {room.roomType} • दर: NPR {room.pricePerNight}/night
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950/40 p-1 rounded-xl border border-emerald-500/30">
              <button
                type="button"
                onClick={() => setActiveView('billing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'billing'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                1. बिलिङ विवरण (Billing)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('tax_invoice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'tax_invoice'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>2. कर बीजक प्रिन्ट (Print Bill)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('thermal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'thermal'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>3. थर्मल रसिद (80mm)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          {/* TAB 1: BILLING & CHECKOUT SETTLEMENT CONTROLS */}
          {activeView === 'billing' && (
            <div className="space-y-6">
              {/* Settled Notification Banner */}
              {isSettled && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-white">चेक-आउट तथा बिलिङ सम्पन्न भयो!</h4>
                      <p className="text-xs text-emerald-200">
                        रुम #{room.roomNumber} खाली भयो र भुक्तानी चुक्ता गरिएको छ।
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('tax_invoice')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    <span>बिल प्रिन्ट गर्नुहोस्</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: Guest Info, Stay Breakdown, Food Orders, Extra Services */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Guest and Room Information Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>पाहुना तथा रुम विवरण (Guest & Room Details)</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Invoice #{invoiceNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">पाहुनाको नाम:</span>
                        <strong className="text-white text-sm block">{room.guestName || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">सम्पर्क फोन:</span>
                        <span className="font-mono text-slate-200 block">{room.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">रुम नं. तथा प्रकार:</span>
                        <span className="font-bold text-amber-400 block">Room #{room.roomNumber} ({room.roomType})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">चेक-इन मिति:</span>
                        <span className="font-mono text-slate-200 block">{checkInDateStr}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">चेक-आउट मिति:</span>
                        <span className="font-mono text-emerald-400 font-bold block">{checkOutDateStr} {checkOutTimeStr}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">परिचयपत्र (ID):</span>
                        <span className="font-mono text-blue-300 block">
                          {room.idCardType || 'Citizenship'} {room.idCardNumber ? `#${room.idCardNumber}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stay Duration & Room Rent Calculator */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>रुम भाडा हिसाब (Room Rent Calculation)</span>
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        दर: रु. {pricePerNight} प्रति रात
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nights adjustment */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 block">
                          बसेको रात (Number of Nights):
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNights((prev) => Math.max(1, prev - 1))}
                            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={nights}
                            onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => setNights((prev) => prev + 1)}
                            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-400">रात</span>
                        </div>
                      </div>

                      {/* Discount % adjustment */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 block">
                          रुममा छुट प्रतिशत (Discount %):
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[0, 5, 10, 15, 20].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDiscountPercent(d)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                discountPercent === d
                                  ? 'bg-amber-400 text-slate-950 shadow'
                                  : 'bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              {d}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Gross: रु. {pricePerNight} × {nights} = रु. {roomRentGross.toFixed(0)}
                        {discountPercent > 0 && ` (छुट -${discountPercent}%: रु. ${roomDiscountAmount.toFixed(0)})`}
                      </span>
                      <span className="font-bold text-white text-sm">
                        रुम जम्मा: <span className="text-amber-400 font-mono">रु. {roomRentNet.toFixed(0)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Room Service / Food Orders Charged to Room */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-4 h-4" />
                        <span>रुम सर्भिस खाना तथा पेय पदार्थ (Food & Drinks Orders)</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {foodOrders.reduce((s, i) => s + i.quantity, 0)} items • रु. {foodOrdersTotal.toFixed(0)}
                      </span>
                    </div>

                    {foodOrders.length > 0 ? (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs pr-1">
                        {foodOrders.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-200">{item.name}</span>
                              <span className="text-[11px] text-slate-400">
                                ({item.quantity} × रु. {item.price})
                              </span>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">
                              रु. {(item.price * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-1">
                        यस रुममा कुनै खाना तथा पेय पदार्थ जोडिएको छैन।
                      </p>
                    )}
                  </div>

                  {/* Extra Charges (Laundry, Extra Bed, Transport, Minibar) */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />
                        <span>अतिरिक्त सेवा तथा शुल्क (Extra Services / Charges)</span>
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        रु. {extraChargesTotal.toFixed(0)}
                      </span>
                    </div>

                    {extraCharges.length > 0 && (
                      <div className="space-y-1.5 text-xs">
                        {extraCharges.map((charge) => (
                          <div
                            key={charge.id}
                            className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-300">{charge.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">रु. {charge.amount}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExtraCharge(charge.id)}
                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                                title="हटाउनुहोस्"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Extra Charge Row */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="उदा: Laundry / Extra Bed / Taxi"
                        value={newExtraTitle}
                        onChange={(e) => setNewExtraTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="number"
                        placeholder="रकम (रु.)"
                        value={newExtraAmount}
                        onChange={(e) => setNewExtraAmount(e.target.value ? Number(e.target.value) : '')}
                        className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddExtraCharge}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        + थप्नुहोस्
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Billing Summary, Payment Modes & Settlement */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Financial Bill Summary Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
                      <span>बिल सारांश (Bill Summary)</span>
                      <span className="font-mono">PAN: 601928374</span>
                    </h4>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">रुम भाडा कुल ({nights} रात):</span>
                        <span className="font-mono font-bold text-white">रु. {roomRentGross.toFixed(2)}</span>
                      </div>
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>रुम छुट ({discountPercent}%):</span>
                          <span className="font-mono font-bold">- रु. {roomDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">रुम सर्भिस खाना/पेय:</span>
                        <span className="font-mono font-bold text-white">रु. {foodOrdersTotal.toFixed(2)}</span>
                      </div>
                      {extraChargesTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">अतिरिक्त सेवा शुल्क:</span>
                          <span className="font-mono font-bold text-white">रु. {extraChargesTotal.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                        <span>कुल रकम (Subtotal):</span>
                        <span className="font-mono text-white">रु. {subtotal.toFixed(2)}</span>
                      </div>

                      {/* VAT 13% Toggle */}
                      <div className="flex items-center justify-between pt-1 text-slate-300">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                          <input
                            type="checkbox"
                            checked={isVatEnabled}
                            onChange={(e) => setIsVatEnabled(e.target.checked)}
                            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <span>१३% नेपाल भ्याट (13% Nepal VAT)</span>
                        </label>
                        <span className="font-mono font-bold text-slate-200">
                          {isVatEnabled ? `रु. ${vatAmount.toFixed(2)}` : 'छैन (N/A)'}
                        </span>
                      </div>

                      {/* Grand Total */}
                      <div className="p-3 bg-amber-500/10 border-2 border-amber-500/50 rounded-xl flex items-center justify-between mt-2">
                        <div>
                          <span className="text-xs font-black text-amber-300 uppercase block">
                            कुल भुक्तानी गर्नुपर्ने (GRAND TOTAL):
                          </span>
                          <span className="text-[10px] text-slate-400 italic block">
                            {amountToWordsEnglish(grandTotal)}
                          </span>
                        </div>
                        <span className="text-2xl font-black font-mono text-amber-400">
                          रु. {grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">
                      भुक्तानी माध्यम (Payment Method):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Cash', 'eSewa', 'Fonepay', 'Card', 'Credit / Khata'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            paymentMethod === method
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {method === 'Cash' && <Banknote className="w-4 h-4" />}
                          {method === 'eSewa' && <Smartphone className="w-4 h-4 text-emerald-600" />}
                          {method === 'Fonepay' && <Smartphone className="w-4 h-4 text-red-600" />}
                          {method === 'Card' && <CreditCard className="w-4 h-4" />}
                          {method === 'Credit / Khata' && <FileText className="w-4 h-4" />}
                          <span>{method}</span>
                        </button>
                      ))}
                    </div>

                    {/* Cash Details with Change Calculation */}
                    {paymentMethod === 'Cash' && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-semibold">नगद प्राप्त रकम (Cash Received):</label>
                          <input
                            type="number"
                            placeholder="रु. 0"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value ? Number(e.target.value) : '')}
                            className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        {/* Quick cash notes */}
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setCashReceived(grandTotal)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono cursor-pointer"
                          >
                            Exact
                          </button>
                          {[1000, 2000, 5000, 10000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCashReceived(amt)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono cursor-pointer"
                            >
                              रु.{amt}
                            </button>
                          ))}
                        </div>

                        {numericCashReceived > 0 && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold">
                            <span className="text-emerald-400">फिर्ता दिनुपर्ने रकम (Change Return):</span>
                            <span className="font-mono text-emerald-400 text-sm">
                              रु. {changeDue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Digital / Ref ID */}
                    {(paymentMethod === 'eSewa' || paymentMethod === 'Fonepay' || paymentMethod === 'Card') && (
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 block">कारोबार नम्बर (Transaction Ref / Approval Code):</label>
                        <input
                          type="text"
                          placeholder="उदा: TXN-89234190"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cashier and Notes */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">क्यासियर / अधिकृत:</label>
                      <input
                        type="text"
                        value={cashierName}
                        onChange={(e) => setCashierName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">थप कैफियत (Notes):</label>
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    {!isSettled ? (
                      <button
                        type="button"
                        onClick={handleFinalizeCheckout}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        <span>चेक-आउट तथा बिलिङ सम्पन्न गर्नुहोस् (Settle & Check-Out)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveView('tax_invoice')}
                          className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>कर बीजक प्रिन्ट (Print Bill)</span>
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          सम्पन्न गरी बन्द गर्नुहोस्
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveView('tax_invoice')}
                        className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                      >
                        🖨️ कर बीजक प्रिभ्यु हेर्नुहोस् (Preview Tax Bill)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveView('thermal')}
                        className="text-slate-400 hover:text-slate-300 underline cursor-pointer"
                      >
                        🧾 थर्मल रसिद प्रिभ्यु (Thermal 80mm)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDARD TAX INVOICE (A4 / FULL PAGE PRINTABLE BILL) */}
          {activeView === 'tax_invoice' && (
            <div className="space-y-4">
              {/* Print Action Toolbar */}
              <div className="no-print p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('billing')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ← बिलिङमा फर्किनुहोस्
                  </button>
                  <span className="text-xs text-slate-400 font-medium">
                    आधिकारिक कर बीजक (Official Tax Invoice Format)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReceiptText}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'कपी भयो!' : 'टेक्स्ट कपी'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span>बिल प्रिन्ट गर्नुहोस् (Print Invoice)</span>
                  </button>
                </div>
              </div>

              {/* The Actual Printable Tax Invoice Container */}
              <div
                id="printable-hotel-bill-root"
                className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl max-w-3xl mx-auto border border-slate-300 font-sans print:border-none print:shadow-none print:p-0"
              >
                {/* Invoice Top Header */}
                <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                  <div className="inline-block px-3 py-0.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded mb-1">
                    आन्तरिक राजस्व विभाग दर्ता (IRD Registered)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                    HIMALAYAN GRAND HOTEL & RESORT PVT. LTD.
                  </h2>
                  <p className="text-xs text-slate-700 font-medium">
                    Durbar Marg, Kathmandu, Nepal • Tel: +977-1-4228901, 9863171714
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-800 pt-1">
                    <span>PAN/VAT NO: <strong className="font-mono text-slate-950">601928374</strong></span>
                    <span>•</span>
                    <span className="font-black text-rose-700 uppercase tracking-wider">कर बीजक (TAX INVOICE)</span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs text-slate-800">
                  <div className="space-y-1">
                    <p><strong>पाहुनाको नाम (Guest Name):</strong> {room.guestName || 'Guest'}</p>
                    <p><strong>सम्पर्क फोन (Phone):</strong> {room.phone || 'N/A'}</p>
                    <p>
                      <strong>परिचयपत्र (ID Doc):</strong> {room.idCardType || 'Citizenship'} {room.idCardNumber ? `(${room.idCardNumber})` : ''}
                    </p>
                    <p><strong>भुक्तानी माध्यम (Payment Mode):</strong> {paymentMethod}</p>
                  </div>
                  <div className="space-y-1 text-right sm:text-right">
                    <p><strong>बीजक नं. (Invoice No):</strong> <span className="font-mono font-bold">HTL-INV-{invoiceNumber}</span></p>
                    <p><strong>मिति (Date):</strong> {checkOutDateStr} {checkOutTimeStr}</p>
                    <p><strong>रुम नं. (Room No):</strong> <span className="font-bold">Room #{room.roomNumber} ({room.roomType})</span></p>
                    <p><strong>बसेको अवधि (Stay):</strong> {checkInDateStr} to {checkOutDateStr} ({nights} रात)</p>
                  </div>
                </div>

                {/* Itemized Charges Table */}
                <div className="py-4">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-800 bg-slate-100 font-black text-slate-900">
                        <th className="py-2 px-2 w-10 text-center">क्र.सं.</th>
                        <th className="py-2 px-2">विवरण (Particulars)</th>
                        <th className="py-2 px-2 text-center w-20">परिमाण (Qty)</th>
                        <th className="py-2 px-2 text-right w-24">दर (Rate)</th>
                        <th className="py-2 px-2 text-right w-28">रकम (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* Room Stay Row */}
                      <tr>
                        <td className="py-2 px-2 text-center font-bold">1</td>
                        <td className="py-2 px-2">
                          <strong className="block text-slate-950 font-bold">
                            होटल रुम बसाइ शुल्क • Room #{room.roomNumber} ({room.roomType})
                          </strong>
                          <span className="text-[11px] text-slate-600 block">
                            चेक-इन: {checkInDateStr} • चेक-आउट: {checkOutDateStr}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono">{nights} रात</td>
                        <td className="py-2 px-2 text-right font-mono">रु. {pricePerNight.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">रु. {roomRentGross.toFixed(2)}</td>
                      </tr>

                      {/* Room Discount Row if any */}
                      {discountPercent > 0 && (
                        <tr className="text-emerald-700 bg-emerald-50/50">
                          <td className="py-1.5 px-2 text-center font-bold">-</td>
                          <td className="py-1.5 px-2">
                            रुम विशेष छुट (Room Discount {discountPercent}%)
                          </td>
                          <td className="py-1.5 px-2 text-center">-</td>
                          <td className="py-1.5 px-2 text-right font-mono">{discountPercent}%</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold">- रु. {roomDiscountAmount.toFixed(2)}</td>
                        </tr>
                      )}

                      {/* Food and Beverage Orders */}
                      {foodOrders.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2 text-center text-slate-600">{idx + 2}</td>
                          <td className="py-2 px-2">
                            <span>रुम सर्भिस: {item.name}</span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono">रु. {item.price.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono">
                            रु. {(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}

                      {/* Extra Charges */}
                      {extraCharges.map((extra, idx) => (
                        <tr key={extra.id}>
                          <td className="py-2 px-2 text-center text-slate-600">
                            {foodOrders.length + idx + 2}
                          </td>
                          <td className="py-2 px-2">
                            <span>अतिरिक्त सेवा: {extra.title}</span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono">1</td>
                          <td className="py-2 px-2 text-right font-mono">रु. {extra.amount.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-mono">रु. {extra.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Taxes Calculation Block */}
                <div className="pt-3 border-t-2 border-slate-800 flex justify-end">
                  <div className="w-72 space-y-1.5 text-xs text-slate-800">
                    <div className="flex justify-between">
                      <span>जम्मा रकम (Subtotal):</span>
                      <span className="font-mono font-bold">रु. {subtotal.toFixed(2)}</span>
                    </div>
                    {isVatEnabled && (
                      <div className="flex justify-between">
                        <span>१३% नेपाल भ्याट (13% VAT):</span>
                        <span className="font-mono font-bold">रु. {vatAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-950">
                      <span>कुल भुक्तानी (GRAND TOTAL):</span>
                      <span className="font-mono text-base">रु. {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* In Words */}
                <div className="mt-4 p-2.5 bg-slate-100 rounded border border-slate-200 text-xs">
                  <p className="text-slate-800">
                    <strong>अक्षरमा (In Words):</strong> {amountToWordsEnglish(grandTotal)}
                  </p>
                </div>

                {/* Payment Receipt Acknowledgement */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-700 pb-8">
                  <div>
                    <span className="block font-semibold">भुक्तानी स्थिति (Status):</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black uppercase text-[11px] border border-emerald-300">
                      PAID / चुक्ता भयो ({paymentMethod})
                    </span>
                    {transactionRef && (
                      <span className="block font-mono text-[10px] text-slate-600 mt-0.5">
                        Ref: {transactionRef}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold">जारी गर्ने क्यासियर:</span>
                    <span className="font-bold text-slate-900">{cashierName}</span>
                  </div>
                </div>

                {/* Signatures Area */}
                <div className="pt-10 grid grid-cols-2 gap-8 text-xs text-slate-800 border-t border-dashed border-slate-300">
                  <div className="text-center">
                    <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold">
                      पाहुनाको दस्तखत (Guest Signature)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-bold">
                      अधिकृत कर्मचारी (Authorized Signature)
                    </div>
                  </div>
                </div>

                {/* Footer Greeting */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-600">
                  <p className="font-bold">धन्यवाद! पुनः पाल्नुहोला • Thank you for staying with us!</p>
                  <p className="text-[10px] text-slate-500">Software powered by Himalayan POS & Hotel System</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THERMAL 80MM POS RECEIPT */}
          {activeView === 'thermal' && (
            <div className="space-y-4">
              <div className="no-print p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveView('billing')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ← बिलिङमा फर्किनुहोस्
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReceiptText}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>थर्मल प्रिन्ट (ESC/POS 80mm)</span>
                  </button>
                </div>
              </div>

              {/* Thermal Bill Box */}
              <div className="max-w-sm mx-auto bg-white text-slate-950 p-6 rounded-2xl font-mono text-xs shadow-2xl border border-slate-200 select-none">
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
                  <h3 className="font-black text-sm uppercase">HIMALAYAN GRAND HOTEL</h3>
                  <p className="text-[10px] text-slate-600">Durbar Marg, Kathmandu • PAN: 601928374</p>
                  <span className="font-bold text-[11px] uppercase block">CHECK-OUT TAX RECEIPT</span>
                </div>

                <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <span className="font-bold">HTL-{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span className="font-bold">{room.guestName || 'Guest'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room #:</span>
                    <span className="font-bold">#{room.roomNumber} ({room.roomType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{nights} Nights ({checkInDateStr})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>{checkOutDateStr} {checkOutTimeStr}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>ITEM</span>
                    <span>AMOUNT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Rent ({nights}x @{pricePerNight})</span>
                    <span>Rs.{roomRentGross.toFixed(0)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Room Discount ({discountPercent}%)</span>
                      <span>-Rs.{roomDiscountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {foodOrders.map((f, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{f.quantity}x {f.name}</span>
                      <span>Rs.{(f.price * f.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  {extraCharges.map((e) => (
                    <div key={e.id} className="flex justify-between">
                      <span>{e.title}</span>
                      <span>Rs.{e.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  {isVatEnabled && (
                    <div className="flex justify-between">
                      <span>13% VAT:</span>
                      <span>Rs.{vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-900">
                    <span>GRAND TOTAL:</span>
                    <span>Rs.{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] space-y-1 text-slate-600">
                  <p className="font-bold text-slate-800">Payment: {paymentMethod} (PAID)</p>
                  <p>Cashier: {cashierName}</p>
                  <p className="pt-1 font-bold text-slate-900 uppercase">THANK YOU, VISIT AGAIN!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
