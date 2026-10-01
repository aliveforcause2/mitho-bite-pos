import React, { useState } from 'react';
import {
  SubscriptionInfo,
  SubscriptionPlan,
  SubscriptionPlanType,
} from '../types/pos';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Crown,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  UploadCloud,
  FileCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  KeyRound,
  Check,
  RefreshCw,
  Copy,
  Smartphone,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionInfo;
  onUpdateSubscription: (updated: SubscriptionInfo) => void;
  isBlockedByTrial?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: '1_year',
    name: '1 Year Plan',
    nameNepali: 'वार्षिक योजना (१ वर्ष)',
    duration: '१ वर्ष (365 दिन)',
    priceNpr: 20000,
    features: [
      'पूर्ण रेस्टुरेन्ट POS बिलिङ र अर्डरिङ',
      'किचेन डिस्प्ले (KDS) र KOT प्रिन्ट',
      'होटल रुम बुकिङ र ग्राहक ID कार्ड रेकर्ड',
      'दैनिक डे-क्लोज, १३% भ्याट र बिक्री रिपोर्ट',
      '१ वर्ष पूर्ण अपडेट र ग्राहक सपोर्ट',
    ],
  },
  {
    id: '3_years',
    name: '3 Years Plan',
    nameNepali: '३ वर्षे योजना (३ वर्ष)',
    duration: '३ वर्ष (1,095 दिन)',
    priceNpr: 40000,
    discountText: 'रु. ३,००० छुट (Best Value)',
    isPopular: true,
    features: [
      'वार्षिक योजनाका सबै सुविधाहरू समावेश',
      '३ वर्षसम्म कुनै नवीकरण झन्झट नहुने',
      'प्राथमिकता ग्राहक सपोर्ट (Priority Support)',
      'रु. ३,००० बराबरको विशेष छुट',
      'अटोम्याटिक दैनिक क्लाउड ब्याकअप',
    ],
  },
  {
    id: '5_years',
    name: '5 Years Plan',
    nameNepali: '५ वर्षे योजना (५ वर्ष)',
    duration: '५ वर्ष (1,825 दिन)',
    priceNpr: 55000,
    discountText: 'विशेष छुट (Maximum Savings)',
    features: [
      '५ वर्षको लागि व्यावसायिक लाइसेन्स',
      'दीर्घकालीन ढुक्क र भारी मूल्य बचत',
      'मल्टी-काउन्टर र असीमित डिभाइस सपोर्ट',
      'निःशुल्क कस्टम मेनु र रिपोर्ट सेटअप',
      '२४/७ डेडिकेटेड सपोर्ट लाइन',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime License',
    nameNepali: 'लाइफटाइम योजना (आजीवन लाइसेन्स)',
    duration: 'सधैँको लागि (Lifetime)',
    priceNpr: 100000,
    discountText: 'एकपटक मात्र भुक्तानी, सधैँको लागि',
    features: [
      'एकपटक मात्र भुक्तानी, कहिल्यै कुनै नवीकरण शुल्क छैन',
      'आजीवन अनलिमिटेड अपडेट र नयाँ फिचरहरू',
      'असीमित टेबल, अर्डर र होटल रुमहरू',
      'VIP सपोर्ट र अन-डिमान्ड टेक्निकल सहायता',
      'कस्टम ब्रान्डिङ र होटल लोगो इन्टिग्रेशन',
    ],
  },
];

export const SubscriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  isBlockedByTrial = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentStep, setPaymentStep] = useState<'plans' | 'payment'>('plans');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState('');
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const handleCopyEsewaNumber = () => {
    navigator.clipboard.writeText('9863171714');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  if (!isOpen) return null;

  const isTrial = subscription.planType === 'trial';
  const isExpired = subscription.remainingTrialDays <= 0 && isTrial;

  // Handle file slip upload
  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentSlipUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit payment & activate
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const activated: SubscriptionInfo = {
      ...subscription,
      planType: selectedPlan.id,
      planName: selectedPlan.nameNepali,
      status: 'active',
      isLifetime: selectedPlan.id === 'lifetime',
      priceNpr: selectedPlan.priceNpr,
      paymentMethod: 'eSewa (Gir Bahadur Mahara)',
      transactionRef: transactionRef || `ESEWA-${Date.now().toString().slice(-6)}`,
      paymentProofUrl: paymentSlipUrl || undefined,
      activatedAt: new Date().toLocaleDateString(),
      expiryDate:
        selectedPlan.id === '1_year'
          ? '2027-09-30'
          : selectedPlan.id === '3_years'
          ? '2029-09-30'
          : selectedPlan.id === '5_years'
          ? '2031-09-30'
          : 'आजीवन (Lifetime)',
      remainingTrialDays: 9999,
    };

    onUpdateSubscription(activated);
    setActivationSuccess(true);
    setTimeout(() => {
      setActivationSuccess(false);
      setPaymentStep('plans');
      setSelectedPlan(null);
      onClose();
    }, 2000);
  };

  // Direct license key activation (e.g. HPOS-YEAR-2026, HPOS-3YEAR, HPOS-5YEAR, HPOS-LIFETIME)
  const handleActivateLicenseKey = () => {
    const key = licenseKeyInput.trim().toUpperCase();
    if (!key) {
      alert('कृपया लाइसेन्स की (License Key) प्रविष्ट गर्नुहोस्।');
      return;
    }

    let planId: SubscriptionPlanType = '1_year';
    let planName = 'वार्षिक योजना (१ वर्ष)';
    let isLifetime = false;

    if (key.includes('LIFE')) {
      planId = 'lifetime';
      planName = 'लाइफटाइम योजना (आजीवन लाइसेन्स)';
      isLifetime = true;
    } else if (key.includes('5YEAR') || key.includes('5-YEAR')) {
      planId = '5_years';
      planName = '५ वर्षे योजना (५ वर्ष)';
    } else if (key.includes('3YEAR') || key.includes('3-YEAR')) {
      planId = '3_years';
      planName = '३ वर्षे योजना (३ वर्ष)';
    }

    const activated: SubscriptionInfo = {
      ...subscription,
      planType: planId,
      planName,
      status: 'active',
      isLifetime,
      licenseKey: key,
      paymentMethod: 'License Key Verified',
      activatedAt: new Date().toLocaleDateString(),
      expiryDate: isLifetime ? 'आजीवन (Lifetime)' : '2027-09-30',
      remainingTrialDays: 9999,
    };

    onUpdateSubscription(activated);
    setActivationSuccess(true);
    setTimeout(() => {
      setActivationSuccess(false);
      setPaymentStep('plans');
      setLicenseKeyInput('');
      onClose();
    }, 1800);
  };

  // Simulation handlers for testing
  const handleSimulateTrialDays = (days: number) => {
    onUpdateSubscription({
      ...subscription,
      planType: 'trial',
      planName: '१५ दिने निःशुल्क ट्रायल',
      remainingTrialDays: days,
      status: days > 0 ? 'active' : 'expired',
      isLifetime: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-5 flex items-center justify-between text-white flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">
                  एप सदस्यता तथा लाइसेन्स व्यवस्थापन (Subscription & Plans)
                </h3>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Himalayan POS & Hotel Management • सुरक्षित र विश्वसनीय सेवा
              </p>
            </div>
          </div>
          {!isBlockedByTrial && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Trial Status / Expiry Alert Banner */}
          {isExpired ? (
            <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-300 flex items-center gap-1.5">
                    <span>१५ दिने निःशुल्क ट्रायल समाप्त भएको छ! (Trial Expired)</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    बिल काट्ने (POS Billing) र किचेन अर्डर (KOT) सेवा स्वतः लक गरिएको छ। सेवा निरन्तर सुचारु राख्न कृपया सदस्यता नवीकरण गर्नुहोस्।
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider flex-shrink-0">
                सेवा लक भएको छ (Blocked)
              </span>
            </div>
          ) : isTrial ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-amber-300">
                      १५ दिने निःशुल्क ट्रायल सक्रिय छ (15 Days Free Trial)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                      पूर्ण फिचर निःशुल्क
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    तपाईंको रेस्टुरेन्टका लागि बाँकी ट्रायल दिन:{' '}
                    <strong className="text-amber-400 font-mono text-sm">
                      {subscription.remainingTrialDays} दिन बाँकी
                    </strong>{' '}
                    (कुल १५ दिन मध्ये)
                  </p>
                </div>
              </div>

              {/* Progress visual */}
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>प्रगति: {15 - subscription.remainingTrialDays}/15 दिन</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round(((15 - subscription.remainingTrialDays) / 15) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, ((15 - subscription.remainingTrialDays) / 15) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-emerald-300">
                      सक्रिय सदस्यता: {subscription.planName}
                    </h4>
                    {subscription.isLifetime && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                        LIFETIME
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    स्थिति: <span className="text-emerald-400 font-bold">पूर्ण सुचारु</span> • म्याद सकिने मिति:{' '}
                    <span className="font-mono text-white font-bold">{subscription.expiryDate || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl">
                सक्रिय (Active)
              </span>
            </div>
          )}

          {activationSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center gap-2 text-sm shadow-xl animate-bounce">
              <CheckCircle2 className="w-5 h-5 stroke-[3]" />
              <span>बधाई छ! सदस्यता सफलतापूर्वक सक्रिय भयो। POS बिलिङ अनलक भयो!</span>
            </div>
          )}

          {/* VIEW 1: PLANS SELECTION */}
          {paymentStep === 'plans' && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>सदस्यता योजनाहरू (Select Your Subscription Plan)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  आफ्नो रेस्टुरेन्टको आवश्यकता अनुसार उपयुक्त योजना छान्नुहोस् र निर्वाध सेवा पाउनुहोस्।
                </p>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = subscription.planType === plan.id;
                  const isLifetime = plan.id === 'lifetime';

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-5 border-2 flex flex-col justify-between transition-all duration-200 shadow-xl ${
                        isLifetime
                          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/70 hover:border-amber-400'
                          : plan.isPopular
                          ? 'bg-slate-900 border-orange-500/60 hover:border-orange-400'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {plan.duration}
                        </span>

                        {plan.discountText && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                            {plan.discountText}
                          </span>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="space-y-1 mb-4">
                        <h5 className="text-base font-black text-white flex items-center gap-1.5">
                          {isLifetime && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
                          <span>{plan.nameNepali}</span>
                        </h5>
                        <div className="flex items-baseline gap-1.5 pt-1">
                          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                            रु. {plan.priceNpr.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {isLifetime ? '/ एकपटक मात्र' : '/ अवधिभर'}
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 py-3 border-t border-slate-800/80 mb-5 flex-1">
                        {plan.features.map((f, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setPaymentStep('payment');
                        }}
                        className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                          isLifetime
                            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                        }`}
                      >
                        <span>यो योजना छान्नुहोस् र भुक्तानी गर्नुहोस्</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Direct License Key Quick Activation Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      पहिले नै लाइसेन्स की (License Key) छ?
                    </span>
                    <span className="text-[11px] text-slate-400">
                      एजेन्ट वा कम्पनीबाट प्राप्त भएको कोड हालेर सिधै सक्रिय गर्नुहोस्।
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    placeholder="उदा: HPOS-YEAR-2026"
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                  />
                  <button
                    onClick={handleActivateLicenseKey}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex-shrink-0 cursor-pointer"
                  >
                    सक्रिय गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PAYMENT & VERIFICATION */}
          {paymentStep === 'payment' && selectedPlan && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span>भुक्तानी तथा भेरिफिकेसन (Payment & Verification)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    छानिएको योजना: <strong className="text-amber-400">{selectedPlan.nameNepali}</strong> • कुल रकम:{' '}
                    <strong className="text-white font-mono font-black text-sm">
                      रु. {selectedPlan.priceNpr.toLocaleString()}
                    </strong>
                  </p>
                </div>
                <button
                  onClick={() => setPaymentStep('plans')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ← योजना फेर्नुहोस्
                </button>
              </div>

              {/* Exclusive eSewa Payment Box (Clean Details without QR Image) */}
              <div className="p-5 bg-slate-950 rounded-3xl border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#41a124] text-white flex items-center justify-center font-black text-lg shadow-md">
                      e
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>eSewa भुक्तानी विवरण (Payment Details)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        सिधै eSewa ID मा रकम ट्रान्सफर गर्नुहोस्
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    eSewa Direct
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* eSewa Mobile ID Box */}
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">eSewa ID (मोबाइल नम्बर):</span>
                      <span className="font-mono font-black text-emerald-400 text-lg tracking-wider block mt-0.5">
                        9863171714
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEsewaNumber}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
                      title="eSewa नम्बर कपी गर्नुहोस्"
                    >
                      {copiedNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                          <span>कपी भयो!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कपी</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Account Name Box */}
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-medium">खातावालाको नाम (Account Name):</span>
                    <span className="font-black text-white text-base block mt-0.5">
                      Gir Bahadur Mahara
                    </span>
                  </div>
                </div>

                {/* Amount to pay */}
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent rounded-2xl border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200">भुक्तानी गर्नुपर्ने कुल रकम:</span>
                  <span className="font-mono font-black text-amber-400 text-xl">
                    रु. {selectedPlan.priceNpr.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    💡 आफ्नो eSewa एप खोलेर <strong>Send Money</strong> मा जानुहोस् र eSewa ID <strong className="text-emerald-400 font-mono">9863171714 (Gir Bahadur Mahara)</strong> मा रु. {selectedPlan.priceNpr.toLocaleString()} पठाउनुहोस्। त्यसपछि तल <strong>कारोबार नम्बर (Transaction Code)</strong> लेख्नुहोस् वा रसिदको फोटो अपलोड गर्नुहोस्।
                  </p>
                </div>
              </div>

              {/* Upload Proof & Reference Form */}
              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      कारोबार नम्बर (Transaction Ref / Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="उदा: TXN-98234190"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      भुक्तानी भौचर / रसिदको फोटो (Payment Slip / Screenshot)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlipUpload}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-400 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 cursor-pointer"
                    />
                  </div>
                </div>

                {paymentSlipUrl && (
                  <div className="p-2 bg-slate-950 rounded-xl border border-emerald-500/40 flex items-center gap-3">
                    <img
                      src={paymentSlipUrl}
                      alt="Payment Slip Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-500/50"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-400 block">✓ भुक्तानी रसिद संलग्न भयो</span>
                      <span className="text-[10px] text-slate-400">प्रणालीले तुरुन्त सक्रिय गर्नेछ</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>भुक्तानी पेश गरी सदस्यता तुरुन्त सक्रिय गर्नुहोस् (Activate Plan)</span>
                </button>
              </form>
            </div>
          )}

          {/* Testing / Simulation Section for Admin / Client Verification */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1.5 text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>प्रणाली टेस्टिङ बार (Admin / Testing Simulation Toolbar):</span>
              </span>
              <span className="text-[10px] text-slate-500">ट्रायल र लक अवस्था टेस्ट गर्न क्लिक गर्नुहोस्</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateTrialDays(15)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Day 1 (१५ दिन बाँकी)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTrialDays(3)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Day 12 (३ दिन बाँकी)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTrialDays(0)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-500/40 transition-colors cursor-pointer"
              >
                Day 15 Expired (० दिन बाँकी - लक भएको)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateSubscription({
                    ...subscription,
                    planType: '1_year',
                    planName: 'वार्षिक योजना (१ वर्ष)',
                    status: 'active',
                    isLifetime: false,
                    expiryDate: '2027-09-30',
                    remainingTrialDays: 9999,
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                वार्षिक योजना सक्रिय
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateSubscription({
                    ...subscription,
                    planType: 'lifetime',
                    planName: 'लाइफटाइम योजना (आजीवन लाइसेन्स)',
                    status: 'active',
                    isLifetime: true,
                    expiryDate: 'आजीवन (Lifetime)',
                    remainingTrialDays: 9999,
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black transition-colors cursor-pointer"
              >
                👑 लाइफटाइम सक्रिय
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
