import React, { useState, useRef, useEffect } from 'react';
import {
  Tablet,
  Smartphone,
  Maximize2,
  Code2,
  Database,
  ChefHat,
  BookOpen,
  UtensilsCrossed,
  Flame,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  TrendingUp,
  Package,
  BarChart3,
  Building2,
  Crown,
  Lock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { SubscriptionInfo } from '../types/pos';

export type ActiveTab = 'pos' | 'kds' | 'report' | 'rooms' | 'supplier' | 'owner_pnl' | 'code' | 'schema' | 'guide';
export type DeviceView = 'tablet' | 'mobile' | 'responsive';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  deviceView: DeviceView;
  setDeviceView: (view: DeviceView) => void;
  occupiedTablesCount: number;
  activeOrdersCount: number;
  cartCount: number;
  onOpenOwnerAdmin: () => void;
  onOpenAuthModal: () => void;
  subscription: SubscriptionInfo;
  onOpenSubscription: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  deviceView,
  setDeviceView,
  occupiedTablesCount,
  activeOrdersCount,
  cartCount,
  onOpenOwnerAdmin,
  onOpenAuthModal,
  subscription,
  onOpenSubscription,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        
        {/* Left: Hamburger (☰) + Brand ("MITHO BITE") */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm"
            title="Open Menu Drawer"
          >
            {isDrawerOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Brand & Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20 flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                  MITHO BITE
                </span>
                <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden lg:inline-block">
                  POS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden xl:block">
                Firestore • Multi-QR • POS & Hotel
              </p>
            </div>
          </div>
        </div>

        {/* Center: Main Primary Tabs (POS Desk, KDS, Rooms perfectly fitted) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs gap-1">
          <button
            onClick={() => handleTabSelect('pos')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all relative ${
              activeTab === 'pos'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Restaurant POS Floor & Table Ordering"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 relative">
              <UtensilsCrossed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <span className="text-xs">POS</span>
            {cartCount > 0 && (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-950 text-amber-400 text-[9px] sm:text-[10px] flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabSelect('kds')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'kds'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Kitchen Display System"
          >
            <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs">KDS</span>
            {activeOrdersCount > 0 && (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] flex items-center justify-center font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabSelect('rooms')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'rooms'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Hotel Rooms Booking"
          >
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs">Rooms</span>
          </button>
        </div>

        {/* Right: Device Viewport Controls + Compact 3-line / Admin Dropdown */}
        <div className="flex items-center gap-1.5">
          {/* Device Viewport Toggle (Only in POS view) */}
          {activeTab === 'pos' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setDeviceView('tablet')}
                title="Tablet POS Mode"
                className={`p-1 rounded-lg transition-all ${
                  deviceView === 'tablet' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                title="Smartphone Mode"
                className={`p-1 rounded-lg transition-all ${
                  deviceView === 'mobile' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceView('responsive')}
                title="Full Responsive"
                className={`p-1 rounded-lg transition-all ${
                  deviceView === 'responsive' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Subscription / Plan Badge Button */}
          <button
            onClick={onOpenSubscription}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subscription.planType === 'trial'
                ? subscription.remainingTrialDays <= 0
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
            }`}
            title="सदस्यता तथा लाइसेन्स योजनाहरू (Subscription & Plans)"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
            <span className="hidden sm:inline">
              {subscription.planType === 'trial'
                ? subscription.remainingTrialDays <= 0
                  ? 'ट्रायल लक'
                  : `${subscription.remainingTrialDays} दिन बाँकी`
                : subscription.isLifetime
                ? 'Lifetime'
                : 'सक्रिय'}
            </span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full font-mono">
              {subscription.planType === 'trial'
                ? `${subscription.remainingTrialDays}d`
                : 'PRO'}
            </span>
          </button>

          {/* Compact 3-Line / Admin Dropdown Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-800 shadow-sm transition-all"
              title="Management & Admin"
            >
              <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs">
                👑
              </div>
              <span className="hidden sm:inline">Admin</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-black text-white">MITHO BITE Admin</p>
                  <p className="text-[10px] text-amber-400 font-medium">Enterprise Management</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restaurant Login</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenOwnerAdmin();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Owner Admin Panel</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Side Drawer (☰ Menu) for Reports, Suppliers, P&L, and Developer Tools */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          ></div>

          {/* Drawer Panel */}
          <div className="absolute top-full left-0 w-80 sm:w-96 bg-slate-950 border-r border-b border-slate-800 shadow-2xl z-50 p-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Enterprise Navigation Drawer
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {/* Subscription & SaaS License Card */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenSubscription();
                }}
                className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/40 text-white flex items-center justify-between transition-all hover:border-amber-400 cursor-pointer shadow-lg mb-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Crown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black block text-amber-300">
                      सदस्यता योजनाहरू (Subscription)
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {subscription.planType === 'trial'
                        ? subscription.remainingTrialDays <= 0
                          ? '🚨 ट्रायल समाप्त - अहिले अनलक गर्नुहोस्'
                          : `१५ दिने ट्रायल: ${subscription.remainingTrialDays} दिन बाँकी`
                        : `सक्रिय: ${subscription.planName}`}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  {subscription.planType === 'trial' ? 'Upgrade' : 'Active'}
                </span>
              </button>

              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">
                Financials & Reports
              </p>
              
              <button
                onClick={() => handleTabSelect('report')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeTab === 'report'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Day Close & Reports</span>
              </button>

              <button
                onClick={() => handleTabSelect('owner_pnl')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeTab === 'owner_pnl'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Owner P&L (Profit & Loss)</span>
              </button>

              <button
                onClick={() => handleTabSelect('supplier')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeTab === 'supplier'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 text-orange-400" />
                <span>Suppliers & Inventory Ledgers</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">
                Developer & Integration Tools
              </p>

              <button
                onClick={() => handleTabSelect('code')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeTab === 'code'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Flutter Code Architecture</span>
              </button>

              <button
                onClick={() => handleTabSelect('schema')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeTab === 'schema'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4 text-purple-400" />
                <span>Firestore JSON Schema</span>
              </button>

              <button
                onClick={() => handleTabSelect('guide')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  activeTab === 'guide'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>APK Build Guide</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
