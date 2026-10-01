import React, { useState } from 'react';
import { FIRESTORE_SCHEMA_JSON } from '../data/flutterCodeSnippets';
import { MenuItem, OrderModel, TableModel } from '../types/pos';
import { Database, Copy, Check, Sparkles, RefreshCw, FileJson, Server } from 'lucide-react';

interface Props {
  tables: TableModel[];
  menuItems: MenuItem[];
  orders: OrderModel[];
}

export const FirestoreSchemaViewer: React.FC<Props> = ({
  tables,
  menuItems,
  orders,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'live'>('schema');
  const [copied, setCopied] = useState<boolean>(false);

  // Construct real-time live database state
  const liveFirestoreState = {
    tables: tables.reduce((acc, t) => {
      acc[`table_${t.tableNumber}`] = {
        tableNumber: t.tableNumber,
        seatingCapacity: t.seatingCapacity,
        status: t.status,
        currentOrderId: t.currentOrderId || null,
        occupiedSince: t.occupiedSince || null,
      };
      return acc;
    }, {} as Record<string, any>),
    menu_items: menuItems.reduce((acc, m) => {
      acc[m.id] = {
        id: m.id,
        name: m.name,
        category: m.category,
        price: m.price,
        isAvailable: m.isAvailable,
        description: m.description,
        isVeg: m.isVeg,
      };
      return acc;
    }, {} as Record<string, any>),
    orders: orders.reduce((acc, o) => {
      acc[o.orderId] = {
        orderId: o.orderId,
        tableNumber: o.tableNumber,
        status: o.status,
        subtotal: o.subtotal,
        taxAmount: o.taxAmount,
        totalAmount: o.totalAmount,
        timestamp: o.timestamp,
        kitchenNote: o.kitchenNote || null,
        itemsList: o.itemsList,
      };
      return acc;
    }, {} as Record<string, any>),
  };

  const jsonStringToDisplay =
    activeTab === 'schema'
      ? FIRESTORE_SCHEMA_JSON
      : JSON.stringify(liveFirestoreState, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStringToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Firestore Database
              </span>
              <span className="text-xs text-slate-400">NoSQL Document Store Structure</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Cloud Firestore Schema & Real-Time Collections
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Deliverable #1: Complete NoSQL database schema representation for restaurant POS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center">
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'schema'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Architecture Schema
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'live'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Database View ({orders.length} orders)</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Copied JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full flex-1">
        {/* Schema Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
              <Server className="w-4 h-4" />
              <span>Collection: tables</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Tracks physical dining tables, seat count, and occupied status.
            </p>
            <div className="text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1 text-slate-300">
              <div>tableNumber: <span className="text-blue-400">int</span></div>
              <div>seatingCapacity: <span className="text-blue-400">int</span></div>
              <div>status: <span className="text-emerald-400">'available' | 'occupied'</span></div>
              <div>currentOrderId: <span className="text-purple-400">string?</span></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <FileJson className="w-4 h-4" />
              <span>Collection: menu_items</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Catalog of all dishes, Nepali specials, prices, and availability flags.
            </p>
            <div className="text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1 text-slate-300">
              <div>id: <span className="text-purple-400">string (docId)</span></div>
              <div>name: <span className="text-purple-400">string</span></div>
              <div>category: <span className="text-purple-400">string</span></div>
              <div>price: <span className="text-blue-400">double</span></div>
              <div>isAvailable: <span className="text-emerald-400">bool</span></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
              <Database className="w-4 h-4" />
              <span>Collection: orders</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Kitchen orders generated by POS with items list, notes, and totals.
            </p>
            <div className="text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1 text-slate-300">
              <div>orderId: <span className="text-purple-400">string</span></div>
              <div>tableNumber: <span className="text-blue-400">int</span></div>
              <div>itemsList: <span className="text-amber-400">Array&lt;OrderItem&gt;</span></div>
              <div>totalAmount: <span className="text-blue-400">double</span></div>
              <div>status: <span className="text-emerald-400">'pending' | 'preparing' ...</span></div>
            </div>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-white">
                {activeTab === 'schema'
                  ? 'firestore_document_structure.json'
                  : 'live_firestore_snapshot.json'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              JSON Format • UTF-8
            </span>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs sm:text-sm text-slate-200 overflow-auto max-h-[500px]">
            <pre className="leading-relaxed">
              <code>{jsonStringToDisplay}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
