import React, { useState } from 'react';
import { SupplierPurchaseModel, ExpenseModel } from '../types/pos';
import { Truck, Plus, DollarSign, Receipt, Calendar, User, FileText, CheckCircle2, TrendingDown } from 'lucide-react';

interface Props {
  supplierPurchases: SupplierPurchaseModel[];
  expenses: ExpenseModel[];
  onAddPurchase: (purchase: SupplierPurchaseModel) => void;
  onAddExpense: (expense: ExpenseModel) => void;
}

export const SupplierAccountingScreen: React.FC<Props> = ({
  supplierPurchases,
  expenses,
  onAddPurchase,
  onAddExpense,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'expenses'>('suppliers');

  // Supplier form state
  const [supplierName, setSupplierName] = useState('');
  const [category, setCategory] = useState('Vegetables & Produce');
  const [itemsDesc, setItemsDesc] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(2500);
  const [paidAmount, setPaidAmount] = useState<number>(2500);
  const [accountantName, setAccountantName] = useState('Sujan Karki (Accountant)');

  // Expense form state
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('Electricity & Utility');
  const [expAmount, setExpAmount] = useState<number>(1200);

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !itemsDesc.trim()) return;

    const purchase: SupplierPurchaseModel = {
      id: `sup-${Date.now()}`,
      supplierName,
      category,
      itemsDescription: itemsDesc,
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount),
      date: new Date().toLocaleDateString(),
      accountantName,
    };
    onAddPurchase(purchase);
    setSupplierName('');
    setItemsDesc('');
    alert('दैनिक आपूर्तिकर्ता (Supplier) खरिद हिसाब सफलताપूर्वक रेकर्ड भयो!');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;

    const expense: ExpenseModel = {
      id: `exp-${Date.now()}`,
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toLocaleDateString(),
      recordedBy: accountantName,
    };
    onAddExpense(expense);
    setExpTitle('');
    setExpAmount(1000);
    alert('दैनिक खर्च सफलतापूर्वक रेकर्ड भयो!');
  };

  const totalSupplierSpend = supplierPurchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalSupplierDue = supplierPurchases.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);
  const totalOtherExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Accountant Ledger
            </span>
            <span className="text-xs text-slate-400">
              Daily Purchases & Expense Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Truck className="w-7 h-7 text-emerald-400" />
            <span>दैनिक सप्लायर तथा खर्च खाता (Suppliers & Expenses Ledger)</span>
          </h1>
        </div>

        {/* Sub-tab toggles */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeSubTab === 'suppliers' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            📦 Suppliers (आपूर्तिकर्ता)
          </button>
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeSubTab === 'expenses' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            💸 Daily Expenses (दैनिक खर्च)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Supplier Purchases</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">NPR {totalSupplierSpend.toFixed(0)}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Pending Supplier Due</span>
            <div className="text-xl font-black text-rose-400 mt-0.5">NPR {totalSupplierDue.toFixed(0)}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Operating Expenses</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">NPR {totalOtherExpenses.toFixed(0)}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeSubTab === 'suppliers' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Form: Add Supplier Purchase */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl h-fit">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>नयाँ सप्लायर खरिद रेकर्ड गर्नुहोस्</span>
              </h3>
              <form onSubmit={handleCreatePurchase} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">सप्लायरको नाम (Supplier Name)</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="उदाहरण: Kalimati Veg Mart / Fresh Meat"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">सामग्री वर्ग (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Vegetables & Produce">Vegetables & Produce (तरकारी/फलफूल)</option>
                    <option value="Meat & Poultry">Meat & Poultry (मासु/कुखुरा)</option>
                    <option value="Dairy & Bakery">Dairy & Bakery (दुग्ध/ब्रेड)</option>
                    <option value="Beverages & Beer">Beverages & Beer (पे पदार्थ/बियर)</option>
                    <option value="LPG Gas & Fuel">LPG Gas & Fuel (ग्यास सिलिन्डर)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">खरिद गरिएका सामानहरू (Items Description)</label>
                  <input
                    type="text"
                    required
                    value={itemsDesc}
                    onChange={(e) => setItemsDesc(e.target.value)}
                    placeholder="उदाहरण: आलु 50kg, प्याज 30kg, टमाटर 20kg"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">कुल मूल्य (Total NPR)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">भुक्तानी रकम (Paid NPR)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">लेखापाल (Accountant Name)</label>
                  <input
                    type="text"
                    required
                    value={accountantName}
                    onChange={(e) => setAccountantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
                >
                  खरिद खातामा प्रविष्ट गर्नुहोस्
                </button>
              </form>
            </div>

            {/* Right List: Supplier Purchases Table */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col h-[520px]">
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <span>दैनिक सप्लायर खरिद सूची ({supplierPurchases.length} records)</span>
                <span className="text-xs text-slate-400">Accountant Verified</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {supplierPurchases.map((p) => {
                  const due = p.totalAmount - p.paidAmount;
                  return (
                    <div
                      key={p.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{p.supplierName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{p.itemsDescription}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                          <span>मिति: {p.date}</span>
                          <span>•</span>
                          <span>Accountant: {p.accountantName}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400">NPR {p.totalAmount}</div>
                        {due > 0 ? (
                          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                            बाँकी तिर्नुपर्ने: NPR {due}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            चुक्ता (Settled)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Form: Add Daily Expense */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl h-fit">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>नयाँ दैनिक खर्च रेकर्ड गर्नुहोस्</span>
              </h3>
              <form onSubmit={handleCreateExpense} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">खर्चको शीर्षक (Title)</label>
                  <input
                    type="text"
                    required
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder="उदाहरण: बिजुली बिल / स्टाफ खाजा"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">खर्चको प्रकार (Category)</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Electricity & Utility">Electricity & Utility (बिजुली/पानी)</option>
                    <option value="Staff Meals & Tea">Staff Meals & Tea (स्टाफ खाजा)</option>
                    <option value="Maintenance & Repairs">Maintenance & Repairs (मर्मतसम्भार)</option>
                    <option value="Transport & Delivery">Transport & Delivery (ढुवानी खर्च)</option>
                    <option value="Miscellaneous">Miscellaneous (विविध खर्च)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">खर्च रकम (Amount NPR)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
                >
                  खर्च प्रविष्ट गर्नुहोस्
                </button>
              </form>
            </div>

            {/* Right List: Expenses Table */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col h-[520px]">
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                <span>दैनिक खर्च सूची ({expenses.length} items)</span>
                <span className="text-xs text-slate-400">Accountant Ledger</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {expenses.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{e.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">
                          {e.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        <span>मिति: {e.date}</span> • <span>Recorded by: {e.recordedBy}</span>
                      </div>
                    </div>
                    <div className="text-base font-black text-amber-400">NPR {e.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
