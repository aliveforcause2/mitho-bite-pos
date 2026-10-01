import React, { useState } from 'react';
import { MenuItem } from '../types/pos';
import { X, Image as ImageIcon, CheckCircle2, Sparkles, Link as LinkIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSaveImage: (itemId: string, newImageUrl: string) => void;
}

const PRESET_FOOD_IMAGES = [
  { name: 'Mo:Mo Dumplings', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80' },
  { name: 'Noodles / Chowmein', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sekuwa / Grilled BBQ', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80' },
  { name: 'Nepali Khana Set', url: 'https://images.unsplash.com/photo-1626844994196-8066f1fc1548?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fried Rice & Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
  { name: 'Snacks & Fries', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80' },
  { name: 'Beer & Beverages', url: 'https://images.unsplash.com/photo-1608270119136-1e37a3dc1e32?w=600&auto=format&fit=crop&q=80' },
  { name: 'Tea & Hot Drinks', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80' },
];

export const MenuItemImageModal: React.FC<Props> = ({ isOpen, item, onClose, onSaveImage }) => {
  const [imageUrl, setImageUrl] = useState(item?.image || '');

  React.useEffect(() => {
    if (item) {
      setImageUrl(item.image || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveImage(item.id, imageUrl.trim());
    alert(`"${item.name}" को फोटो सफलतापूर्वक अपडेट भयो!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">मेनु फोटो परिवर्तन (Change Menu Image)</h3>
              <p className="text-xs text-amber-100">{item.name} • NPR {item.price}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-sm">
          {/* Live Preview */}
          <div className="flex flex-col items-center">
            <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-inner">
              <img
                src={imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-400">
                Live Preview
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>नयाँ इमेज URL (Image URL)</span>
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quick Presets Gallery */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>लोकप्रिय फुड प्रेसेटहरूबाट छान्नुहोस्:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_FOOD_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(preset.url)}
                  className={`p-2 rounded-xl border text-left text-[11px] font-medium flex flex-col gap-1 transition-all ${
                    imageUrl === preset.url
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="h-14 w-full rounded-lg overflow-hidden bg-slate-900">
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="line-clamp-1">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-center"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>सेभ गर्नुहोस्</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
