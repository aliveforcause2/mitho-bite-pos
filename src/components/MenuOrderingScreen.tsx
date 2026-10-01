import React, { useState } from 'react';
import { MenuItem, OrderItem, TableModel } from '../types/pos';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  FileEdit,
  ArrowRight,
  Flame,
  Leaf,
  ShoppingBag,
  ArrowLeft,
  X,
} from 'lucide-react';

interface Props {
  table: TableModel;
  menuItems: MenuItem[];
  cart: OrderItem[];
  onAddToCart: (item: MenuItem, specialInstructions?: string) => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onUpdateInstruction: (menuItemId: string, note: string) => void;
  onProceedToReview: () => void;
  onBackToTables: () => void;
}

export const MenuOrderingScreen: React.FC<Props> = ({
  table,
  menuItems,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateInstruction,
  onProceedToReview,
  onBackToTables,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpenMobile, setIsCartOpenMobile] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<{
    item: MenuItem;
    instruction: string;
  } | null>(null);

  const categories = [
    'All',
    'Mo:Mo',
    'Noodles',
    'Khaja & Snacks',
    'Light Snacks',
    'Nepali Khana',
    'Rice & Biryani',
    'Hard Drinks & Beer',
    'Cigarettes',
    'Beverages',
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartTax = cartSubtotal * 0.1;
  const cartGrandTotal = cartSubtotal + cartTax;

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* LEFT: Menu Browsing & Ordering (Square POS Clean Interface) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-800">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToTables}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="Back to Floor View"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Table #{table.tableNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    {table.seatingCapacity} Guests Capacity
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  POS Menu & Fast Ordering
                </h1>
              </div>
            </div>

            {/* Mobile Cart Button */}
            <button
              onClick={() => setIsCartOpenMobile(true)}
              className="lg:hidden relative flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartTotalCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-amber-700 text-xs font-black">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search food by name, Mo:Mo, Chowmein, Chiya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs (Square POS clean pill row) */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <ShoppingBag className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-slate-300 font-semibold">No food items found</p>
              <p className="text-slate-500 text-xs mt-1">
                Try clearing your search query or selecting a different category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const inCart = cart.find((i) => i.menuItemId === item.id);

                return (
                  <div
                    key={item.id}
                    className="group bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* High-Resolution Food Image Banner */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-950">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                      {/* Top Floating Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span
                          className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-md shadow-md border ${
                            item.isVeg
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {item.isVeg ? (
                            <Leaf className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Flame className="w-3 h-3 text-rose-400" />
                          )}
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>

                        {item.stockQuantity <= 0 ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/90 text-white backdrop-blur-md shadow-md">
                            Out of Stock
                          </span>
                        ) : item.stockQuantity <= (item.lowStockThreshold ?? 5) ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 backdrop-blur-md shadow-md animate-pulse">
                            Only {item.stockQuantity} Left!
                          </span>
                        ) : null}
                      </div>

                      {/* Category Badge bottom right of image */}
                      <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-white/10 shadow-md">
                        {item.category}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Pricing & Quick Action */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-500 block">Price</span>
                          <div className="text-base font-black text-amber-400">
                            NPR {item.price.toFixed(0)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setEditingItem({
                                item,
                                instruction: inCart?.specialInstructions || '',
                              })
                            }
                            disabled={item.stockQuantity <= 0}
                            title="Add Special Kitchen Instruction"
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onAddToCart(item)}
                            disabled={item.stockQuantity <= 0}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>{item.stockQuantity <= 0 ? 'Out' : 'Add'}</span>
                            {inCart && (
                              <span className="ml-1 w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[11px] flex items-center justify-center font-black shadow">
                                {inCart.quantity}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Persistent Floating Cart Bar */}
        {cartTotalCount > 0 && (
          <div className="lg:hidden p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">
                {cartTotalCount} items selected
              </span>
              <div className="text-base font-black text-amber-400">
                NPR {cartGrandTotal.toFixed(0)}
              </div>
            </div>
            <button
              onClick={onProceedToReview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-md"
            >
              <span>Review & Push</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Real-time Cart Sidebar (Square POS style) */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isCartOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white">Live Order Cart</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Table {table.tableNumber}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-700 mb-3" />
              <p className="font-semibold text-slate-300">Cart is empty</p>
              <p className="text-xs text-slate-500 mt-1">
                Tap food cards on the left to add items to Table #{table.tableNumber}.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      NPR {item.price} each
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-400">
                    NPR {(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>

                {/* Special Instruction if set */}
                {item.specialInstructions && (
                  <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 italic">
                    Note: {item.specialInstructions}
                  </div>
                )}

                {/* Counter & Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() =>
                      setEditingItem({
                        item: menuItems.find((m) => m.id === item.menuItemId) || {
                          id: item.menuItemId,
                          name: item.name,
                          category: 'Mo:Mo',
                          price: item.price,
                          stockQuantity: 20,
                          isAvailable: true,
                        },
                        instruction: item.specialInstructions || '',
                      })
                    }
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <FileEdit className="w-3 h-3" />
                    <span>Instructions</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
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
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80">
            <div className="space-y-1.5 text-xs text-slate-400 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-200">
                  NPR {cartSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax / Service (10%)</span>
                <span className="font-semibold text-slate-200">
                  NPR {cartTax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Estimated Total</span>
                <span className="text-amber-400">
                  NPR {cartGrandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToReview}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
            >
              <span>Review & Push to Kitchen (Screen C)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Special Instruction Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-lg font-black text-white">
              Special Instructions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize for <strong className="text-amber-400">{editingItem.item.name}</strong>
            </p>

            <textarea
              rows={3}
              value={editingItem.instruction}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  instruction: e.target.value,
                })
              }
              placeholder="e.g. Extra spicy achar, less oil, well done, no onions..."
              className="w-full mt-3 p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateInstruction(
                    editingItem.item.id,
                    editingItem.instruction
                  );
                  // Also add if not in cart yet
                  if (!cart.some((c) => c.menuItemId === editingItem.item.id)) {
                    onAddToCart(editingItem.item, editingItem.instruction);
                  }
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Save Instruction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
