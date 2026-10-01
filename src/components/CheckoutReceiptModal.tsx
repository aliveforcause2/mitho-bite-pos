import React, { useState } from 'react';
import { OrderModel } from '../types/pos';
import {
  Receipt,
  Printer,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Info,
} from 'lucide-react';

export type PaymentMethodType =
  | 'Cash'
  | 'Fonepay (Mobile Banking)'
  | 'eSewa QR'
  | 'Khalti QR'
  | 'Card / POS';

interface Props {
  order: OrderModel;
  onClose: () => void;
  onCompletePayment: (
    orderId: string,
    tableNumber: number,
    finalTotal: number,
    discountPercent: number,
    paymentMethod: PaymentMethodType,
    transactionRef?: string
  ) => void;
}

interface WalletConfig {
  id: 'Fonepay (Mobile Banking)' | 'eSewa QR' | 'Khalti QR';
  tabName: 'Fonepay' | 'eSewa' | 'Khalti';
  brandTitle: string;
  subTitle: string;
  themeColor: string;
  bgColor: string;
  badgeBg: string;
  borderColor: string;
  merchantName: string;
  merchantPan: string;
  merchantCode: string;
  logoText: string;
  description: string;
  qrImageUrl?: string;
}

const WALLET_CONFIGS: Record<'fonepay' | 'esewa' | 'khalti', WalletConfig> = {
  fonepay: {
    id: 'Fonepay (Mobile Banking)',
    tabName: 'Fonepay',
    brandTitle: 'Fonepay / NepalPay Interoperable QR',
    subTitle: 'Scan with Global IME, Nabil, NIC Asia, Siddhartha, Sanima & 50+ Mobile Banking Apps',
    themeColor: '#DC2626', // Red
    bgColor: 'from-red-950/40 to-slate-900',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderColor: 'border-red-500/50',
    merchantName: 'HIMALAYAN RESTAURANT & BAR PVT. LTD.',
    merchantPan: 'PAN: 601928374',
    merchantCode: 'FONEPAY-MER-99412',
    logoText: 'fonepay',
    description: 'Supports all Nepali commercial banks, development banks & NepalPay wallets',
  },
  esewa: {
    id: 'eSewa QR',
    tabName: 'eSewa',
    brandTitle: 'eSewa Direct Merchant QR',
    subTitle: 'Scan directly via eSewa Mobile Wallet App for instant verification',
    themeColor: '#16A34A', // Green
    bgColor: 'from-emerald-950/40 to-slate-900',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/50',
    merchantName: 'HIMALAYAN RESTAURANT & BAR (ESEWA BIZ)',
    merchantPan: 'eSewa ID: 9841000000',
    merchantCode: 'ESEWA-POS-84210',
    logoText: 'eSewa',
    description: 'Instant zero-fee wallet transfer for verified eSewa users',
  },
  khalti: {
    id: 'Khalti QR',
    tabName: 'Khalti',
    brandTitle: 'Khalti Smart Merchant QR',
    subTitle: 'Scan via Khalti Digital Wallet app or linked Khalti Bank Account',
    themeColor: '#9333EA', // Purple
    bgColor: 'from-purple-950/40 to-slate-900',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderColor: 'border-purple-500/50',
    merchantName: 'HIMALAYAN HOSPITALITY & DINING (KHALTI)',
    merchantPan: 'Khalti Merchant: 9801234567',
    merchantCode: 'KHALTI-POS-33918',
    logoText: 'khalti',
    description: 'Fast QR settlement with real-time merchant notification & reward points',
  },
};

export const CheckoutReceiptModal: React.FC<Props> = ({
  order,
  onClose,
  onCompletePayment,
}) => {
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [primaryMode, setPrimaryMode] = useState<'cash' | 'qr' | 'card'>('cash');

  interface ExtraBank {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    qrImageUrl: string;
  }
  const extraBanks: ExtraBank[] = (() => {
    try {
      const saved = localStorage.getItem('mitho_bite_extra_banks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const [selectedWalletTab, setSelectedWalletTab] = useState<string>('fonepay');
  const [customTxnId, setCustomTxnId] = useState<string>(
    `TXN-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [copiedTxn, setCopiedTxn] = useState<boolean>(false);
  const [isSuccessPaid, setIsSuccessPaid] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Financial calculations with 13% Nepali VAT
  const subtotal = order.itemsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatRate = 0.13; // 13% Nepali VAT
  const vatAmount = taxableAmount * vatRate;
  const grandTotal = taxableAmount + vatAmount;

  const handlePayAndClose = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsProcessing(false);
    setIsSuccessPaid(true);

    const chosenMethod = getActivePaymentMethod();
    const finalTxn = primaryMode === 'qr' ? customTxnId : undefined;

    onCompletePayment(
      order.orderId,
      order.tableNumber,
      grandTotal,
      discountPercent,
      chosenMethod,
      finalTxn
    );
  };

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(customTxnId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getDynamicWalletConfig = (key: 'fonepay' | 'esewa' | 'khalti'): WalletConfig => {
    const base = WALLET_CONFIGS[key];
    const prefix = `mitho_bite_qr_${key}`;
    const name = localStorage.getItem(`${prefix}_name`);
    const pan = localStorage.getItem(`${prefix}_pan`);
    const code = localStorage.getItem(`${prefix}_code`);
    const img = localStorage.getItem(`${prefix}_img`);

    return {
      ...base,
      merchantName: name || base.merchantName,
      merchantPan: pan || base.merchantPan,
      merchantCode: code || base.merchantCode,
      qrImageUrl: img || '',
    };
  };

  const getActiveWalletConfig = (): WalletConfig => {
    if (selectedWalletTab === 'fonepay' || selectedWalletTab === 'esewa' || selectedWalletTab === 'khalti') {
      return getDynamicWalletConfig(selectedWalletTab as any);
    }
    const bank = extraBanks.find((b) => b.id === selectedWalletTab);
    if (bank) {
      return {
        id: bank.bankName as any,
        tabName: bank.bankName as any,
        brandTitle: bank.bankName,
        subTitle: `A/C: ${bank.accountNumber} (${bank.branch})`,
        themeColor: '#D97706',
        bgColor: 'from-amber-950/40 to-slate-900',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        borderColor: 'border-amber-500/50',
        merchantName: bank.accountName,
        merchantPan: `A/C: ${bank.accountNumber}`,
        merchantCode: `Branch: ${bank.branch}`,
        logoText: 'BANK',
        description: `Direct bank transfer to ${bank.bankName}`,
        qrImageUrl: bank.qrImageUrl,
      };
    }
    return getDynamicWalletConfig('fonepay');
  };

  const currentWallet = getActiveWalletConfig();

  const restaurantProfile = (() => {
    try {
      const saved = localStorage.getItem('mitho_bite_restaurant_profile');
      return saved ? JSON.parse(saved) : {
        restaurantName: 'HIMALAYAN RESTAURANT & BAR',
        address: 'Thamel Marg, Kathmandu, Nepal',
        panNumber: '601928374',
        phone: '+977-1-4412345'
      };
    } catch {
      return {
        restaurantName: 'HIMALAYAN RESTAURANT & BAR',
        address: 'Thamel Marg, Kathmandu, Nepal',
        panNumber: '601928374',
        phone: '+977-1-4412345'
      };
    }
  })();

  // Determine current active payment method label
  const getActivePaymentMethod = (): PaymentMethodType => {
    if (primaryMode === 'cash') return 'Cash';
    if (primaryMode === 'card') return 'Card / POS';
    return currentWallet.id as any;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  Table #{order.tableNumber} Checkout & Billing
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {order.orderId}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Nepali Digital QR Enabled
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supports Fonepay / NepalPay, eSewa, Khalti, Cash NPR & Cards with 13% Nepali VAT
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

        {/* Modal Body: Split between Controls and Printable Thermal Receipt */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/60">
          {/* LEFT: Billing Controls, Digital QR switcher, and Settlement (7 cols) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            {/* 1. Discount selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>Apply Special Discount</span>
                </label>
                {discountPercent > 0 && (
                  <span className="text-xs text-emerald-400 font-bold">
                    -{discountPercent}% (- Rs. {discountAmount.toFixed(2)})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[0, 5, 10, 15, 20].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setDiscountPercent(rate)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      discountPercent === rate
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {rate === 0 ? 'None' : `${rate}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Top-level Payment Mode Selector (Cash, QR, Card) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                Primary Payment Channel
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setPrimaryMode('cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    primaryMode === 'cash'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span>Cash NPR</span>
                  <span className="text-[10px] text-slate-500 font-normal">Physical Notes</span>
                </button>

                <button
                  onClick={() => setPrimaryMode('qr')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all relative ${
                    primaryMode === 'qr'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 text-rose-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span>Digital QR Codes</span>
                  <span className="text-[10px] text-amber-400 font-semibold">Fonepay • eSewa • Khalti</span>
                </button>

                <button
                  onClick={() => setPrimaryMode('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    primaryMode === 'card'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>Card / POS</span>
                  <span className="text-[10px] text-slate-500 font-normal">SCT / Visa / Master</span>
                </button>
              </div>
            </div>

            {/* 3. DYNAMIC NEPALI DIGITAL WALLET QR SWITCHER (When QR selected) */}
            {primaryMode === 'qr' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-4 transition-all">
                {/* Switcher Tabs: [Fonepay] [eSewa] [Khalti] */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Select QR Wallet Network</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-generated Dynamic QR
                    </span>
                  </div>

                  <div className={`grid ${extraBanks.length > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800`}>
                    <button
                      onClick={() => setSelectedWalletTab('fonepay')}
                      className={`py-2 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
                        selectedWalletTab === 'fonepay'
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-300"></span>
                      <span className="truncate">Fonepay</span>
                    </button>

                    <button
                      onClick={() => setSelectedWalletTab('esewa')}
                      className={`py-2 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
                        selectedWalletTab === 'esewa'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                      <span className="truncate">eSewa</span>
                    </button>

                    <button
                      onClick={() => setSelectedWalletTab('khalti')}
                      className={`py-2 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
                        selectedWalletTab === 'khalti'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-300"></span>
                      <span className="truncate">Khalti</span>
                    </button>

                    {extraBanks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedWalletTab(bank.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
                          selectedWalletTab === bank.id
                            ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-600/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                        <span className="truncate">{bank.bankName.replace(' QR', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Branded QR Container Box */}
                <div
                  className={`p-4 rounded-2xl border bg-gradient-to-b ${currentWallet.bgColor} ${currentWallet.borderColor} flex flex-col sm:flex-row items-center gap-4 transition-all`}
                >
                  {/* Left: Dynamic QR Mockup with Brand Overlay */}
                  <div className="relative bg-white p-3 rounded-xl shadow-xl shrink-0 flex flex-col items-center">
                    {/* Brand Banner on top of QR */}
                    <div
                      className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white tracking-wider mb-1"
                      style={{ backgroundColor: currentWallet.themeColor }}
                    >
                      {currentWallet.logoText}
                    </div>

                    {currentWallet.qrImageUrl ? (
                      <div className="w-32 h-32 flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden">
                        <img
                          src={currentWallet.qrImageUrl}
                          alt="Owner Custom QR"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      /* Stylized QR Matrix SVG */
                      <svg
                        className="w-32 h-32"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Corner 1 */}
                        <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A" />
                        <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                        <rect x="13" y="13" width="10" height="10" fill="#0F172A" />

                        {/* Corner 2 */}
                        <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F172A" />
                        <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                        <rect x="77" y="13" width="10" height="10" fill="#0F172A" />

                        {/* Corner 3 */}
                        <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F172A" />
                        <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                        <rect x="13" y="77" width="10" height="10" fill="#0F172A" />

                        {/* Data dots */}
                        <rect x="36" y="8" width="8" height="8" rx="1.5" fill="#0F172A" />
                        <rect x="48" y="14" width="6" height="6" rx="1" fill="#0F172A" />
                        <rect x="58" y="8" width="6" height="6" rx="1" fill="#0F172A" />

                        <rect x="36" y="38" width="10" height="10" rx="2" fill="#0F172A" />
                        <rect x="52" y="36" width="8" height="8" rx="1.5" fill="#0F172A" />
                        <rect x="66" y="44" width="8" height="8" rx="1.5" fill="#0F172A" />
                        <rect x="80" y="38" width="12" height="12" rx="2" fill="#0F172A" />

                        <rect x="10" y="38" width="8" height="8" rx="1.5" fill="#0F172A" />
                        <rect x="22" y="44" width="8" height="8" rx="1.5" fill="#0F172A" />
                        <rect x="14" y="54" width="8" height="8" rx="1.5" fill="#0F172A" />

                        <rect x="38" y="68" width="10" height="10" rx="2" fill="#0F172A" />
                        <rect x="54" y="72" width="8" height="8" rx="1.5" fill="#0F172A" />
                        <rect x="68" y="64" width="12" height="12" rx="2" fill="#0F172A" />
                        <rect x="84" y="78" width="8" height="8" rx="1.5" fill="#0F172A" />

                        {/* Center Brand Badge */}
                        <circle cx="50" cy="50" r="11" fill="white" />
                        <circle cx="50" cy="50" r="9" fill={currentWallet.themeColor} />
                        <text
                          x="50"
                          y="53.5"
                          textAnchor="middle"
                          fill="white"
                          fontSize="8"
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          NPR
                        </text>
                      </svg>
                    )}

                    <div className="mt-1 text-[9px] font-mono text-slate-600 font-bold text-center">
                      SCAN TO PAY
                    </div>
                  </div>

                  {/* Right: Dynamic Amount & Merchant Info */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${currentWallet.badgeBg}`}>
                        {currentWallet.brandTitle}
                      </span>
                      <h4 className="text-sm font-extrabold text-white mt-1">
                        {currentWallet.merchantName}
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {currentWallet.merchantPan} • {currentWallet.merchantCode}
                      </div>
                    </div>

                    {/* DYNAMIC AMOUNT TO PAY CALLOUT */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Exact Amount to Pay:
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-amber-400">
                        Rs. {grandTotal.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        (Includes 13% Nepal VAT & discounts)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {currentWallet.subTitle}
                    </p>
                  </div>
                </div>

                {/* Copyable Transaction Reference / Auth Code */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">
                        Merchant Reference / Txn Trace ID:
                      </div>
                      <div className="text-xs font-mono font-bold text-white">
                        {customTxnId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyTxn}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
                    >
                      {copiedTxn ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Trace ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Financial Calculation Breakdown Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal ({order.itemsList.length} items)</span>
                <span className="font-semibold text-slate-200">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-medium">
                  <span>Discount ({discountPercent}%)</span>
                  <span>- Rs. {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-400">
                <span>Taxable Amount</span>
                <span className="font-semibold text-slate-200">
                  Rs. {taxableAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Government VAT (13%)</span>
                <span className="font-semibold text-slate-200">
                  Rs. {vatAmount.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-white block">Grand Total Due</span>
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    Payment Method: {getActivePaymentMethod()}
                  </span>
                </div>
                <span className="text-xl font-black text-amber-400">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 5. Payment Received Confirmation Button */}
            <div>
              {!isSuccessPaid ? (
                <button
                  disabled={isProcessing}
                  onClick={handlePayAndClose}
                  className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                    isProcessing
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : primaryMode === 'qr'
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-emerald-600/20 active:scale-98'
                      : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-slate-950 shadow-amber-600/20 active:scale-98'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>VERIFYING TRANSACTION & FREEING TABLE...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                      <span>
                        {primaryMode === 'qr'
                          ? `CONFIRM ${currentWallet.tabName.toUpperCase()} PAYMENT & FREE TABLE #${order.tableNumber}`
                          : `CONFIRM PAYMENT RECEIVED & FREE TABLE #${order.tableNumber}`}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    Payment Received via {getActivePaymentMethod()}! Table #{order.tableNumber} is now AVAILABLE.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: High-Fidelity Printable Thermal Receipt Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Thermal Customer Receipt</span>
              </span>
              <button
                onClick={handlePrint}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Printer className="w-3 h-3" />
                <span>Print Bill</span>
              </button>
            </div>

            {/* Receipt Card (styled like a real restaurant receipt) */}
            <div
              id="printable-receipt"
              className="printable-receipt w-full max-w-sm bg-white text-slate-900 rounded-xl p-5 shadow-2xl font-mono text-xs border border-slate-300 relative print:m-0 print:border-none"
            >
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="font-black text-base tracking-tight text-slate-900 uppercase">
                  {restaurantProfile.restaurantName}
                </h3>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {restaurantProfile.address}
                </p>
                <p className="text-[10px] text-slate-600">
                  PAN: {restaurantProfile.panNumber} | Tel: {restaurantProfile.phone}
                </p>
                <div className="mt-2 text-[11px] font-bold bg-slate-100 py-1 rounded">
                  TAX INVOICE / CASH BILL
                </div>
              </div>

              {/* Order Meta */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold">Table #{order.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{new Date().toLocaleDateString()} {order.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pay Mode:</span>
                  <span className="font-bold uppercase text-slate-900">
                    {getActivePaymentMethod()}
                  </span>
                </div>
                {primaryMode === 'qr' && (
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Txn Trace:</span>
                    <span className="font-bold font-mono">{customTxnId}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-slate-500 pb-1.5 border-b border-slate-200">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Amt (Rs)</span>
                </div>

                <div className="divide-y divide-slate-100 py-1">
                  {order.itemsList.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 py-1.5 text-[11px]">
                      <span className="col-span-6 font-bold leading-tight">
                        {item.name}
                      </span>
                      <span className="col-span-2 text-center text-slate-600">
                        {item.quantity}
                      </span>
                      <span className="col-span-4 text-right font-semibold">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="py-2.5 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Item Subtotal:</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({discountPercent}%):</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Taxable Base:</span>
                  <span>Rs. {taxableAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>VAT (13%):</span>
                  <span>Rs. {vatAmount.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t-2 border-dashed border-slate-900 flex justify-between items-center text-sm font-black">
                  <span>GRAND TOTAL:</span>
                  <span className="text-base font-black">Rs. {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="pt-4 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-600 space-y-1">
                <p className="font-bold">DHANYABAD! THANK YOU FOR DINING WITH US!</p>
                <p className="text-[9px]">Please keep this invoice for your records.</p>
                <p className="font-mono text-[8px] text-slate-400">
                  Settled via {getActivePaymentMethod()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isSuccessPaid
              ? '✓ Transaction completed successfully'
              : 'Pending guest settlement'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              {isSuccessPaid ? 'Done & Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
