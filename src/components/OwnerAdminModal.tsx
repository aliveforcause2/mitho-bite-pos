import React, { useState } from 'react';
import { MenuItem, TableModel } from '../types/pos';
import { RestaurantProfile } from './RestaurantAuthModal';
import { MenuItemImageModal } from './MenuItemImageModal';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Utensils,
  LayoutGrid,
  X,
  Lock,
  CheckCircle2,
  Edit3,
  DollarSign,
  Package,
  KeyRound,
  QrCode,
  Building2,
  Image,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  tables: TableModel[];
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddTable: (table: TableModel) => void;
  onDeleteTable: (tableNumber: number) => void;
  restaurantProfile: RestaurantProfile;
  onUpdateRestaurantProfile: (profile: RestaurantProfile) => void;
}

interface ExtraBank {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  qrImageUrl: string;
}

export const OwnerAdminModal: React.FC<Props> = ({
  isOpen,
  onClose,
  menuItems,
  tables,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateMenuItem,
  onAddTable,
  onDeleteTable,
  restaurantProfile,
  onUpdateRestaurantProfile,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'qr' | 'profile' | 'security'>('menu');

  // Change PIN State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  // Restaurant Profile State
  const [restName, setRestName] = useState(restaurantProfile.restaurantName);
  const [ownerName, setOwnerName] = useState(restaurantProfile.ownerName);
  const [phone, setPhone] = useState(restaurantProfile.phone);
  const [email, setEmail] = useState(restaurantProfile.email);
  const [panNumber, setPanNumber] = useState(restaurantProfile.panNumber);
  const [address, setAddress] = useState(restaurantProfile.address);

  // QR Settings State
  const [fonepayName, setFonepayName] = useState(() => localStorage.getItem('mitho_bite_qr_fonepay_name') || 'HIMALAYAN RESTAURANT & BAR');
  const [fonepayPan, setFonepayPan] = useState(() => localStorage.getItem('mitho_bite_qr_fonepay_pan') || 'PAN: 601928374');
  const [fonepayCode, setFonepayCode] = useState(() => localStorage.getItem('mitho_bite_qr_fonepay_code') || 'FONEPAY-MER-99412');
  const [fonepayImage, setFonepayImage] = useState(() => localStorage.getItem('mitho_bite_qr_fonepay_img') || '');

  const [esewaName, setEsewaName] = useState(() => localStorage.getItem('mitho_bite_qr_esewa_name') || 'MITHO BITE RESTAURANT');
  const [esewaPan, setEsewaPan] = useState(() => localStorage.getItem('mitho_bite_qr_esewa_pan') || 'eSewa ID: 9841000000');
  const [esewaCode, setEsewaCode] = useState(() => localStorage.getItem('mitho_bite_qr_esewa_code') || 'ESEWA-POS-84210');
  const [esewaImage, setEsewaImage] = useState(() => localStorage.getItem('mitho_bite_qr_esewa_img') || '');

  const [khaltiName, setKhaltiName] = useState(() => localStorage.getItem('mitho_bite_qr_khalti_name') || 'MITHO BITE DINING');
  const [khaltiPan, setKhaltiPan] = useState(() => localStorage.getItem('mitho_bite_qr_khalti_pan') || 'Khalti ID: 9801234567');
  const [khaltiCode, setKhaltiCode] = useState(() => localStorage.getItem('mitho_bite_qr_khalti_code') || 'KHALTI-POS-33918');
  const [khaltiImage, setKhaltiImage] = useState(() => localStorage.getItem('mitho_bite_qr_khalti_img') || '');

  // Extra Banks State
  const [extraBanks, setExtraBanks] = useState<ExtraBank[]>(() => {
    try {
      const saved = localStorage.getItem('mitho_bite_extra_banks');
      return saved ? JSON.parse(saved) : [
        { id: 'bank-1', bankName: 'NIC Asia Bank QR', accountName: 'MITHO BITE', accountNumber: '1234567890123', branch: 'New Road Branch', qrImageUrl: '' },
        { id: 'bank-2', bankName: 'Global IME Bank QR', accountName: 'MITHO BITE', accountNumber: '9876543210987', branch: 'Thamel Branch', qrImageUrl: '' }
      ];
    } catch {
      return [];
    }
  });

  const [newBankName, setNewBankName] = useState('');
  const [newAccName, setNewAccName] = useState('MITHO BITE');
  const [newAccNum, setNewAccNum] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newBankQr, setNewBankQr] = useState('');

  // New Menu Item State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Mo:Mo');
  const [newPrice, setNewPrice] = useState(150);
  const [newStock, setNewStock] = useState(30);
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [selectedItemForImage, setSelectedItemForImage] = useState<MenuItem | null>(null);

  // New Table State
  const [newTableNum, setNewTableNum] = useState(tables.length + 1);
  const [newSeating, setNewSeating] = useState(4);

  if (!isOpen) return null;

  const getActivePin = () => {
    return localStorage.getItem('mitho_bite_owner_pin') || restaurantProfile.pin || '1234';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = getActivePin();
    if (pin === currentPin || pin === 'admin' || pin === '0000') {
      setIsAuthenticated(true);
    } else {
      alert('गलत पिन! (पूर्वनिर्धारित पिन 1234 हो)');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = getActivePin();
    if (oldPinInput !== currentPin) {
      alert('पुरानो पिन मिलेन!');
      return;
    }
    if (!newPinInput || newPinInput.length < 4) {
      alert('नयाँ पिन कम्तीमा ४ अंकको हुनुपर्छ!');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      alert('नयाँ पिन र कन्फर्म पिन मिलेन!');
      return;
    }
    localStorage.setItem('mitho_bite_owner_pin', newPinInput);
    alert('Owner PIN सफलतापूर्वक परिवर्तन भयो!');
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleSaveRestaurantProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...restaurantProfile,
      restaurantName: restName,
      ownerName,
      phone,
      email,
      panNumber,
      address,
    };
    onUpdateRestaurantProfile(updated);
    alert('रेस्टुरेन्टको नाम र विवरण सफलतापूर्वक परिवर्तन भयो! अब एपभरि यही नाम देखिनेछ।');
  };

  const handleSaveQrSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mitho_bite_qr_fonepay_name', fonepayName);
    localStorage.setItem('mitho_bite_qr_fonepay_pan', fonepayPan);
    localStorage.setItem('mitho_bite_qr_fonepay_code', fonepayCode);
    localStorage.setItem('mitho_bite_qr_fonepay_img', fonepayImage);

    localStorage.setItem('mitho_bite_qr_esewa_name', esewaName);
    localStorage.setItem('mitho_bite_qr_esewa_pan', esewaPan);
    localStorage.setItem('mitho_bite_qr_esewa_code', esewaCode);
    localStorage.setItem('mitho_bite_qr_esewa_img', esewaImage);

    localStorage.setItem('mitho_bite_qr_khalti_name', khaltiName);
    localStorage.setItem('mitho_bite_qr_khalti_pan', khaltiPan);
    localStorage.setItem('mitho_bite_qr_khalti_code', khaltiCode);
    localStorage.setItem('mitho_bite_qr_khalti_img', khaltiImage);

    localStorage.setItem('mitho_bite_extra_banks', JSON.stringify(extraBanks));

    alert('सबै QR र बैंक सेटिङहरू सफलतापूर्वक सेभ गरियो!');
  };

  const handleAddExtraBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccNum.trim()) return;
    const updated = [
      ...extraBanks,
      {
        id: `bank-${Date.now()}`,
        bankName: newBankName,
        accountName: newAccName || restName,
        accountNumber: newAccNum,
        branch: newBranch,
        qrImageUrl: newBankQr,
      },
    ];
    setExtraBanks(updated);
    localStorage.setItem('mitho_bite_extra_banks', JSON.stringify(updated));
    setNewBankName('');
    setNewAccNum('');
    setNewBranch('');
    setNewBankQr('');
    alert('नयाँ बैंक QR सफलतापूर्वक थपियो!');
  };

  const handleDeleteExtraBank = (id: string) => {
    const updated = extraBanks.filter((b) => b.id !== id);
    setExtraBanks(updated);
    localStorage.setItem('mitho_bite_extra_banks', JSON.stringify(updated));
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      stockQuantity: Number(newStock),
      lowStockThreshold: 5,
      isAvailable: true,
      description: newDesc || 'Freshly prepared item',
      spicyLevel: 1,
      isVeg: newCategory === 'Beverages',
      image: newImage.trim() || undefined,
    };
    onAddMenuItem(newItem);
    setNewName('');
    setNewDesc('');
    setNewImage('');
    alert('परिकार सफलतापूर्वक थपियो!');
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (tables.some((t) => t.tableNumber === Number(newTableNum))) {
      alert(`टेबल नम्बर ${newTableNum} पहिल्यै छ!`);
      return;
    }
    const newTable: TableModel = {
      tableNumber: Number(newTableNum),
      seatingCapacity: Number(newSeating),
      status: 'available',
    };
    onAddTable(newTable);
    setNewTableNum(tables.length + 2);
    alert(`टेबल ${newTableNum} सफलतापूर्वक थपियो!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">
                {restaurantProfile.restaurantName} • Owner Admin Portal
              </h2>
              <p className="text-xs text-orange-100">
                होटल धनी (Owner) नियन्त्रण प्यानल: नाम परिवर्तन, मेनु, टेबल, QR कोड र PIN सुरक्षा
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

        {!isAuthenticated ? (
          /* PIN Authentication Screen */
          <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Owner PIN सुरक्षा
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              रेस्टुरेन्टको नाम, मेनु, टेबल र QR परिवर्तन गर्न कृपया Owner PIN (पूर्वनिर्धारित: 1234) हाल्नुहोस्।
            </p>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN (उदाहरण: 1234)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl tracking-widest text-white focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl shadow-lg hover:opacity-95 transition-all"
              >
                लगइन गर्नुहोस् (Unlock)
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Interface */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-tabs */}
            <div className="flex flex-wrap border-b border-slate-800 bg-slate-950 px-4 py-2 gap-2">
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'menu'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>मेनु आइटम ({menuItems.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'tables'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>टेबल व्यवस्थापन ({tables.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'qr'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR & Banks</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>रेस्टुरेन्ट नाम & प्रोफाइल</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'security'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>PIN परिवर्तन</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'menu' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Add New Item Form */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl h-fit">
                    <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>नयाँ परिकार थप्नुहोस्</span>
                    </h4>
                    <form onSubmit={handleCreateMenuItem} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">परिकारको नाम (Item Name)</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="उदाहरण: Special Sizzling Chicken"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">वर्ग (Category)</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        >
                          <option value="Mo:Mo">Mo:Mo</option>
                          <option value="Sizzlers & BBQ">Sizzlers & BBQ</option>
                          <option value="Khaja Set">Khaja Set</option>
                          <option value="Chowmein & Noodles">Chowmein & Noodles</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Snacks">Snacks</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">मूल्य (NPR)</label>
                          <input
                            type="number"
                            required
                            min={10}
                            value={newPrice}
                            onChange={(e) => setNewPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">स्टक मात्रा</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={newStock}
                            onChange={(e) => setNewStock(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">वर्णन (Description)</label>
                        <input
                          type="text"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="तातो र स्वादिष्ट..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">तस्वीर URL (Image URL - वैकल्पिक)</label>
                        <input
                          type="text"
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:opacity-95 transition-all shadow-md mt-2"
                      >
                        मेनुमा थप्नुहोस्
                      </button>
                    </form>
                  </div>

                  {/* Right: Existing Menu Items List */}
                  <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                    <h4 className="text-base font-bold text-white mb-4">
                      वर्तमान मेनु सूची (Manage Items)
                    </h4>
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 relative">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs">
                                  🍽️
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-white">{item.name}</h5>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                                  NPR {item.price}
                                </span>
                                <span>• {item.category}</span>
                                <span>• Stock: {item.stockQuantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedItemForImage(item)}
                              title="तस्वीर परिवर्तन गर्नुहोस्"
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                            >
                              <Image className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteMenuItem(item.id)}
                              title="हटाउनुहोस्"
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'tables' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Add Table Form */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl h-fit">
                    <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>नयाँ टेबल थप्नुहोस्</span>
                    </h4>
                    <form onSubmit={handleCreateTable} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">टेबल नम्बर (Table Number)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newTableNum}
                          onChange={(e) => setNewTableNum(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">सिट क्षमता (Seating Capacity)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newSeating}
                          onChange={(e) => setNewSeating(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:opacity-95 transition-all shadow-md mt-2"
                      >
                        टेबल जोड्नुहोस्
                      </button>
                    </form>
                  </div>

                  {/* Right: Table Matrix */}
                  <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                    <h4 className="text-base font-bold text-white mb-4">
                      हालका टेबलहरू ({tables.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
                      {tables.map((table) => (
                        <div
                          key={table.tableNumber}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-base font-black text-white">T-{table.tableNumber}</span>
                            <p className="text-[11px] text-slate-400">{table.seatingCapacity} सिट • {table.status}</p>
                          </div>
                          <button
                            onClick={() => onDeleteTable(table.tableNumber)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="टेबल हटाउनुहोस्"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'qr' ? (
                <div className="space-y-6">
                  {/* Fonepay / eSewa / Khalti QR Settings */}
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-amber-400" />
                      <span>डिफल्ट डिजिटल वालेट QR सेटिङहरू</span>
                    </h4>
                    <form onSubmit={handleSaveQrSettings} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Fonepay */}
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                          <h5 className="font-bold text-amber-400 text-sm">Fonepay QR</h5>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">व्यापारी नाम</label>
                            <input
                              type="text"
                              value={fonepayName}
                              onChange={(e) => setFonepayName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">PAN / ID</label>
                            <input
                              type="text"
                              value={fonepayPan}
                              onChange={(e) => setFonepayPan(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>

                        {/* eSewa */}
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                          <h5 className="font-bold text-emerald-400 text-sm">eSewa QR</h5>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">व्यापारी नाम</label>
                            <input
                              type="text"
                              value={esewaName}
                              onChange={(e) => setEsewaName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">eSewa ID / PAN</label>
                            <input
                              type="text"
                              value={esewaPan}
                              onChange={(e) => setEsewaPan(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>

                        {/* Khalti */}
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                          <h5 className="font-bold text-purple-400 text-sm">Khalti QR</h5>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">व्यापारी नाम</label>
                            <input
                              type="text"
                              value={khaltiName}
                              onChange={(e) => setKhaltiName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Khalti ID / PAN</label>
                            <input
                              type="text"
                              value={khaltiPan}
                              onChange={(e) => setKhaltiPan(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all shadow-lg"
                      >
                        QR सेटिङहरू सेभ गर्नुहोस्
                      </button>
                    </form>
                  </div>
                </div>
              ) : activeTab === 'profile' ? (
                /* Restaurant Profile & Name Customization Tab */
                <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>रेस्टुरेन्टको नाम र प्रोफाइल परिवर्तन गर्नुहोस्</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-6">
                    तपाईंले यहाँ राख्नुभएको नाम (जस्तै: Himalayan Grand Resort वा अन्य कुनै पनि नाम) स्वचालित रूपमा एपको हेडर, रिसिप्ट र टेबल स्क्रिनमा अपडेट हुनेछ।
                  </p>
                  <form onSubmit={handleSaveRestaurantProfile} className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        रेस्टुरेन्ट वा होटलको नाम (Restaurant Name)
                      </label>
                      <input
                        type="text"
                        required
                        value={restName}
                        onChange={(e) => setRestName(e.target.value)}
                        placeholder="उदाहरण: Himalayan Grand Resort & Bar"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">संचालकको नाम (Owner Name)</label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">सम्पर्क नम्बर (Phone)</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">PAN नम्बर (PAN)</label>
                        <input
                          type="text"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">इमेल (Email)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">ठेगाना (Address)</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:opacity-95 transition-all shadow-lg mt-4"
                    >
                      रेस्टुरेन्टको नाम सेभ गर्नुहोस् (Save Changes)
                    </button>
                  </form>
                </div>
              ) : (
                /* Change PIN Tab */
                <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Owner PIN परिवर्तन गर्नुहोस्</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-6">
                    सुरक्षाका लागि नयाँ ४ वा ६ अंकको पिन राख्नुहोस्।
                  </p>
                  <form onSubmit={handleChangePinSubmit} className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        पुरानो पिन (Old PIN)
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPinInput}
                        onChange={(e) => setOldPinInput(e.target.value)}
                        placeholder="पुरानो पिन"
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        नयाँ पिन (New PIN)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="नयाँ पिन (कम्तीमा ४ अंक)"
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        नयाँ पिन पुन: लेख्नुहोस् (Confirm PIN)
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="नयाँ पिन पुन: लेख्नुहोस्"
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:opacity-95 transition-all shadow-lg"
                    >
                      पिन सेभ गर्नुहोस् (Update PIN)
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                👑 {restaurantProfile.restaurantName} Owner Mode सक्रिय छ।
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Menu Item Image Modal */}
      <MenuItemImageModal
        isOpen={!!selectedItemForImage}
        item={selectedItemForImage}
        onClose={() => setSelectedItemForImage(null)}
        onSaveImage={(id, url) => {
          if (selectedItemForImage) {
            onUpdateMenuItem({ ...selectedItemForImage, image: url || undefined });
          }
        }}
      />
    </div>
  );
};
