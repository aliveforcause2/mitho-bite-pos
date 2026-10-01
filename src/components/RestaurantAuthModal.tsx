import React, { useState } from 'react';
import { Store, X, ShieldCheck, Phone, MapPin, FileText, User, Lock, Mail } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: RestaurantProfile) => void;
}

export interface RestaurantProfile {
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  panNumber: string;
  address: string;
  pin: string;
}

export const RestaurantAuthModal: React.FC<Props> = ({ isOpen, onClose, onSaveProfile }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const getStoredProfile = (): RestaurantProfile => {
    try {
      const saved = localStorage.getItem('mitho_bite_restaurant_profile');
      return saved ? JSON.parse(saved) : {
        restaurantName: 'HIMALAYAN RESTAURANT & BAR',
        ownerName: 'Rajesh Shrestha',
        phone: '+977-9841000000',
        email: 'mithobite@gmail.com',
        panNumber: '601928374',
        address: 'Thamel Marg, Kathmandu, Nepal',
        pin: '1234'
      };
    } catch {
      return {
        restaurantName: 'HIMALAYAN RESTAURANT & BAR',
        ownerName: 'Rajesh Shrestha',
        phone: '+977-9841000000',
        email: 'mithobite@gmail.com',
        panNumber: '601928374',
        address: 'Thamel Marg, Kathmandu, Nepal',
        pin: '1234'
      };
    }
  };

  const [form, setForm] = useState<RestaurantProfile>(getStoredProfile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.restaurantName.trim() || !form.phone.trim()) {
      alert('कृपया रेस्टुरेन्टको नाम र फोन नम्बर अनिवार्य भर्नुहोस्!');
      return;
    }
    localStorage.setItem('mitho_bite_restaurant_profile', JSON.stringify(form));
    localStorage.setItem('mitho_bite_owner_pin', form.pin);
    onSaveProfile(form);
    alert('रेस्टुरेन्ट प्रोफाइल सफलतापूर्वक सेभ/लगइन भयो!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">
                {isRegisterMode ? 'नयाँ रेस्टुरेन्ट रेजिष्ट्रेसन (Register)' : 'रेस्टुरेन्ट लगइन / प्रोफाइल (Login)'}
              </h2>
              <p className="text-xs text-amber-100">
                तपाईंको रेस्टुरेन्टको नाम, PAN र विवरणहरू सेटअप गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>रेस्टुरेन्टको नाम (Restaurant Name)</span>
            </label>
            <input
              type="text"
              required
              value={form.restaurantName}
              onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>धनी/व्यवस्थापक नाम (Owner Name)</span>
              </label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>फोन नम्बर (Phone)</span>
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>इमेल (Email)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>PAN / VAT नम्बर</span>
              </label>
              <input
                type="text"
                required
                value={form.panNumber}
                onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>ठेगाना (Address & Location)</span>
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Owner PIN (4 अंक)</span>
            </label>
            <input
              type="password"
              maxLength={6}
              required
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-center font-mono tracking-widest text-lg"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
            >
              रेस्टुरेन्ट प्रोफाइल सेभ गर्नुहोस् (Save Profile)
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>तपाईंको डेटा सुरक्षित रूपमा ब्राउजरमा सेभ हुन्छ।</span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 font-bold hover:underline"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
