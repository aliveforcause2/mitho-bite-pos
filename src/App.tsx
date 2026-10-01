/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { INITIAL_TABLES, NEPALI_MENU_ITEMS, INITIAL_SETTLED_ORDERS } from './data/mockNepaliData';
import { MenuItem, OrderItem, OrderModel, OrderStatus, TableModel, RoomModel, SupplierPurchaseModel, ExpenseModel, SubscriptionInfo, HotelCheckoutSummary } from './types/pos';
import { Navbar, ActiveTab, DeviceView } from './components/Navbar';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { MenuOrderingScreen } from './components/MenuOrderingScreen';
import { OrderReviewScreen } from './components/OrderReviewScreen';
import { KitchenDisplayScreen } from './components/KitchenDisplayScreen';
import { CheckoutReceiptModal } from './components/CheckoutReceiptModal';
import { SalesReportScreen } from './components/SalesReportScreen';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { CodeExplorer } from './components/CodeExplorer';
import { FirestoreSchemaViewer } from './components/FirestoreSchemaViewer';
import { SetupGuide } from './components/SetupGuide';
import { OwnerAdminModal } from './components/OwnerAdminModal';
import { RestaurantAuthModal, RestaurantProfile } from './components/RestaurantAuthModal';
import { HotelRoomsScreen } from './components/HotelRoomsScreen';
import { SupplierAccountingScreen } from './components/SupplierAccountingScreen';
import { OwnerFinancialReportScreen } from './components/OwnerFinancialReportScreen';
import { SubscriptionModal } from './components/SubscriptionModal';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [deviceView, setDeviceView] = useState<DeviceView>('responsive');

  // Restaurant Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile>(() => {
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
  });

  // Subscription & 15-Day Free Trial SaaS State
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    try {
      const saved = localStorage.getItem('mitho_bite_saas_subscription');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      planType: 'trial',
      planName: '१५ दिने निःशुल्क ट्रायल',
      status: 'active',
      trialStartDate: '2026-09-16',
      trialDaysTotal: 15,
      remainingTrialDays: 14,
      isLifetime: false,
    };
  });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Sync subscription state to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('mitho_bite_saas_subscription', JSON.stringify(subscription));
    } catch {}
  }, [subscription]);

  // Billing is blocked if trial expired (remainingTrialDays <= 0) and user has not activated a paid plan
  const isBillingBlocked = subscription.planType === 'trial' && subscription.remainingTrialDays <= 0;

  // Core POS Screens: 'tables' (Screen A) | 'menu' (Screen B) | 'review' (Screen C)
  const [posScreen, setPosScreen] = useState<'tables' | 'menu' | 'review'>('tables');

  // Simulated Live Firestore State
  const [tables, setTables] = useState<TableModel[]>(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(NEPALI_MENU_ITEMS);
  const [orders, setOrders] = useState<OrderModel[]>([
    ...INITIAL_SETTLED_ORDERS,
    {
      orderId: 'ORD-1001',
      tableNumber: 3,
      itemsList: [
        { menuItemId: 'momo-01', name: 'Steamed Buff Mo:Mo (10 pcs)', quantity: 2, price: 320, specialInstructions: 'Extra spicy achar' },
        { menuItemId: 'chw-01', name: 'Nepali Chicken Chowmein', quantity: 1, price: 280 },
        { menuItemId: 'bev-01', name: 'Hot Himalayan Masala Chiya', quantity: 2, price: 90 },
      ],
      subtotal: 1100,
      taxAmount: 143, // 13% Nepali VAT
      totalAmount: 1243,
      status: 'preparing',
      timestamp: '12:45 PM',
      createdAtMs: Date.now() - 14 * 60000, // 14 mins ago
      kitchenNote: 'Chiya served after main food',
      serverName: 'Bikash Shrestha',
    },
    {
      orderId: 'ORD-1002',
      tableNumber: 6,
      itemsList: [
        { menuItemId: 'khaja-01', name: 'Newari Samay Baji Platter', quantity: 3, price: 520 },
        { menuItemId: 'momo-04', name: 'C-Mo:Mo (Chilli Mo:Mo)', quantity: 2, price: 400 },
        { menuItemId: 'bev-02', name: 'Fresh Sweet Mango Lassi', quantity: 4, price: 180 },
      ],
      subtotal: 3080,
      taxAmount: 400.4,
      totalAmount: 3480.4,
      status: 'pending',
      timestamp: '1:10 PM',
      createdAtMs: Date.now() - 4 * 60000, // 4 mins ago
      kitchenNote: 'VIP table, guests from Pokhara',
      serverName: 'Pooja Thapa',
    },
  ]);

  // POS Active Session State
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [kitchenNote, setKitchenNote] = useState<string>('');

  // Hotel Rooms & Accounting State
  const [rooms, setRooms] = useState<RoomModel[]>([
    { id: 'room-1', roomNumber: '101', roomType: 'Standard', pricePerNight: 2500, status: 'available', imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80' },
    { id: 'room-2', roomNumber: '102', roomType: 'Deluxe', pricePerNight: 4000, status: 'occupied', guestName: 'Mr. David Miller', phone: '+977-9811223344', idCardType: 'राहदानी (Passport)', idCardNumber: 'PA9821450', idCardPhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', nights: 2, discountPercent: 10, checkInDate: '2026-09-28', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80' },
    { id: 'room-3', roomNumber: '201', roomType: 'Suite', pricePerNight: 7500, status: 'available', imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop&q=80' },
    { id: 'room-4', roomNumber: '202', roomType: 'Family Villa', pricePerNight: 12000, status: 'available', imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&auto=format&fit=crop&q=80' },
  ]);

  const [supplierPurchases, setSupplierPurchases] = useState<SupplierPurchaseModel[]>([
    { id: 'sup-1', supplierName: 'Kalimati Vegetables Mart', category: 'Vegetables & Produce', itemsDescription: 'Tomatoes 20kg, Potatoes 50kg, Onions 30kg', totalAmount: 4500, paidAmount: 4500, date: '2026-09-29', accountantName: 'Sujan Karki' },
    { id: 'sup-2', supplierName: 'Himalayan Meat Supplier', category: 'Meat & Poultry', itemsDescription: 'Fresh Buff meat 15kg, Chicken 20kg', totalAmount: 14500, paidAmount: 10000, date: '2026-09-29', accountantName: 'Sujan Karki' },
  ]);

  const [expenses, setExpenses] = useState<ExpenseModel[]>([
    { id: 'exp-1', title: 'Electricity Utility Bill', category: 'Electricity & Utility', amount: 3800, date: '2026-09-29', recordedBy: 'Sujan Karki' },
    { id: 'exp-2', title: 'Staff Lunch & Tea', category: 'Staff Meals & Tea', amount: 1200, date: '2026-09-29', recordedBy: 'Sujan Karki' },
  ]);

  const handleAddRoom = (room: RoomModel) => setRooms((prev) => [...prev, room]);
  const handleUpdateRoom = (updated: RoomModel) => setRooms((prev) => prev.map((r) => r.id === updated.id ? updated : r));
  const handleCheckOutRoom = (roomId: string, summary?: HotelCheckoutSummary) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: 'available',
              guestName: undefined,
              phone: undefined,
              nights: undefined,
              discountPercent: undefined,
              idCardType: undefined,
              idCardNumber: undefined,
              idCardPhotoUrl: undefined,
              orderedItems: [],
              notes: undefined,
            }
          : r
      )
    );

    if (summary) {
      const roomOrderRecord: OrderModel = {
        orderId: summary.invoiceNumber,
        tableNumber: parseInt(summary.roomNumber) || 900,
        itemsList: [
          {
            menuItemId: 'room-rent',
            name: `रुम #${summary.roomNumber} भाडा (${summary.nights} रात)`,
            quantity: 1,
            price: summary.roomRentNet,
          },
          ...summary.foodOrders.map((f) => ({
            menuItemId: f.id,
            name: f.name,
            quantity: f.quantity,
            price: f.price,
          })),
          ...summary.extraCharges.map((e) => ({
            menuItemId: e.id,
            name: e.title,
            quantity: 1,
            price: e.amount,
          })),
        ],
        subtotal: summary.subtotal,
        totalAmount: summary.grandTotal,
        taxAmount: summary.vatAmount,
        discountPercent: summary.roomDiscountPercent,
        discountAmount: summary.roomDiscountAmount,
        status: 'paid',
        timestamp: summary.checkOutTime,
        serverName: summary.cashierName,
        paymentMethod:
          summary.paymentMethod === 'Cash'
            ? 'Cash'
            : summary.paymentMethod === 'eSewa'
            ? 'eSewa QR'
            : summary.paymentMethod === 'Fonepay'
            ? 'Fonepay (Mobile Banking)'
            : 'Card / POS',
        transactionRef: summary.transactionRef,
        settledAt: summary.settledAt,
      };
      setOrders((prev) => [roomOrderRecord, ...prev]);
    }
  };
  const handleAddPurchase = (p: SupplierPurchaseModel) => setSupplierPurchases((prev) => [p, ...prev]);
  const handleAddExpense = (e: ExpenseModel) => setExpenses((prev) => [e, ...prev]);

  // Phase 2 Checkout Modal State
  const [checkoutOrder, setCheckoutOrder] = useState<OrderModel | null>(null);

  // Phase 3 Thermal Slip / KOT Modal State
  const [thermalReceiptOrder, setThermalReceiptOrder] = useState<OrderModel | null>(null);
  const [thermalMode, setThermalMode] = useState<'customer' | 'kot'>('customer');

  // Owner Admin Modal State
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const handleAddMenuItem = (item: MenuItem) => setMenuItems((prev) => [...prev, item]);
  const handleDeleteMenuItem = (id: string) => setMenuItems((prev) => prev.filter((i) => i.id !== id));
  const handleUpdateMenuItem = (updated: MenuItem) => setMenuItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  const handleAddTable = (table: TableModel) => setTables((prev) => [...prev, table]);
  const handleDeleteTable = (tableNumber: number) => setTables((prev) => prev.filter((t) => t.tableNumber !== tableNumber));

  // Table selection handler (Screen A -> Screen B)
  const handleSelectTable = (table: TableModel) => {
    if (isBillingBlocked) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    setSelectedTable(table);
    setCart([]);
    setKitchenNote('');
    setPosScreen('menu');
  };

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem, specialInstructions?: string) => {
    if (item.stockQuantity <= 0) return; // Prevent adding if out of stock

    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        if (existing.quantity >= item.stockQuantity) return prev; // Do not exceed available stock
        return prev.map((i) =>
          i.menuItemId === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                specialInstructions: specialInstructions || i.specialInstructions,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          specialInstructions,
        },
      ];
    });
  };

  // Adjust quantity
  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    const item = menuItems.find((m) => m.id === menuItemId);

    setCart((prev) =>
      prev
        .map((cartItem) => {
          if (cartItem.menuItemId === menuItemId) {
            const newQty = cartItem.quantity + delta;
            if (delta > 0 && item && newQty > item.stockQuantity) return cartItem;
            return newQty > 0 ? { ...cartItem, quantity: newQty } : null;
          }
          return cartItem;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  // Remove from cart
  const handleRemoveItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  // Update instructions
  const handleUpdateInstruction = (menuItemId: string, note: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId ? { ...i, specialInstructions: note } : i
      )
    );
  };

  // Screen C: Push to Kitchen (Simulates Firestore transaction + stock deduction)
  const handleSendToKitchen = async (serverName: string): Promise<boolean> => {
    if (isBillingBlocked) {
      setIsSubscriptionModalOpen(true);
      return false;
    }
    if (!selectedTable || cart.length === 0) return false;

    // Simulate network write delay
    await new Promise((r) => setTimeout(r, 650));

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const taxAmount = subtotal * 0.13; // 13% Nepali VAT
    const totalAmount = subtotal + taxAmount;

    const newOrder: OrderModel = {
      orderId,
      tableNumber: selectedTable.tableNumber,
      itemsList: [...cart],
      subtotal,
      taxAmount,
      totalAmount,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtMs: Date.now(),
      kitchenNote: kitchenNote || undefined,
      serverName,
    };

    // 1. Add order to Firestore orders collection
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Real-time Stock Deduction
    setMenuItems((prev) =>
      prev.map((m) => {
        const ordered = cart.find((c) => c.menuItemId === m.id);
        if (ordered) {
          const updatedStock = Math.max(0, m.stockQuantity - ordered.quantity);
          return {
            ...m,
            stockQuantity: updatedStock,
            isAvailable: updatedStock > 0,
          };
        }
        return m;
      })
    );

    // 3. Update Table status to 'occupied'
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === selectedTable.tableNumber
          ? {
              ...t,
              status: 'occupied',
              currentOrderId: orderId,
              occupiedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );

    // Clear session cart
    setCart([]);
    setKitchenNote('');

    return true;
  };

  // Quick inventory restock
  const handleRestockItem = (itemId: string, addedQty: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              stockQuantity: item.stockQuantity + addedQty,
              isAvailable: true,
            }
          : item
      )
    );
  };

  // KDS Status progression
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );
  };

  // Clear / Free Table after billing
  const handleClearTable = (tableNumber: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === tableNumber
          ? { ...t, status: 'available', currentOrderId: undefined, occupiedSince: undefined }
          : t
      )
    );
  };

  // Phase 2 & 3 Checkout & Billing Handler: Marks order as 'paid', records payment details, and frees table
  const handleCompletePayment = (
    orderId: string,
    tableNumber: number,
    finalTotal: number,
    discountPercent: number,
    paymentMethod: 'Cash' | 'Fonepay (Mobile Banking)' | 'eSewa QR' | 'Khalti QR' | 'Card / POS',
    transactionRef?: string
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Mark order as 'paid'
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status: 'paid',
              totalAmount: finalTotal,
              discountPercent,
              paymentMethod,
              transactionRef,
              settledAt: timeNow,
            }
          : o
      )
    );

    // 2. Free table
    handleClearTable(tableNumber);
  };

  // Quick billing from floor view
  const handleQuickCheckout = (tableNumber: number) => {
    if (isBillingBlocked) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    const targetOrder = orders.find(
      (o) => o.tableNumber === tableNumber && o.status !== 'paid'
    );
    if (targetOrder) {
      setCheckoutOrder(targetOrder);
    }
  };

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'paid').length;
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Main Navigation with 15-Day Trial Countdown Banner */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deviceView={deviceView}
        setDeviceView={setDeviceView}
        occupiedTablesCount={occupiedCount}
        activeOrdersCount={activeOrdersCount}
        cartCount={cartItemCount}
        onOpenOwnerAdmin={() => setIsOwnerModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        subscription={subscription}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pos' && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden">
            {/* Device Frame Wrapper */}
            <div
              className={`transition-all duration-300 w-full h-[calc(100vh-68px)] max-h-[920px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col bg-slate-900 ${
                deviceView === 'tablet'
                  ? 'max-w-4xl ring-8 ring-slate-800/80'
                  : deviceView === 'mobile'
                  ? 'max-w-sm ring-8 ring-slate-800/80'
                  : 'max-w-full'
              }`}
            >
              {/* Screen A: Table Selection Grid */}
              {posScreen === 'tables' && (
                <TableSelectionScreen
                  tables={tables}
                  onSelectTable={handleSelectTable}
                  selectedTableNumber={selectedTable?.tableNumber || null}
                  onQuickCheckout={handleQuickCheckout}
                  restaurantName={restaurantProfile.restaurantName}
                  isBlockedByTrial={isBillingBlocked}
                  onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
                />
              )}

              {/* Screen B: Menu & Fast Ordering */}
              {posScreen === 'menu' && selectedTable && (
                <MenuOrderingScreen
                  table={selectedTable}
                  menuItems={menuItems}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onUpdateInstruction={handleUpdateInstruction}
                  onProceedToReview={() => setPosScreen('review')}
                  onBackToTables={() => setPosScreen('tables')}
                />
              )}

              {/* Screen C: Order Review & Push */}
              {posScreen === 'review' && selectedTable && (
                <OrderReviewScreen
                  table={selectedTable}
                  cart={cart}
                  kitchenNote={kitchenNote}
                  onUpdateKitchenNote={setKitchenNote}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onSendToKitchen={handleSendToKitchen}
                  onBackToMenu={() => setPosScreen('menu')}
                  onBackToTables={() => setPosScreen('tables')}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Kitchen Display System (KDS) */}
        {activeTab === 'kds' && (
          <KitchenDisplayScreen
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenCheckout={(order) => setCheckoutOrder(order)}
          />
        )}

        {/* Tab 3: Day Close & Sales Report (NEW Phase 3) */}
        {activeTab === 'report' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <SalesReportScreen
              orders={orders}
              menuItems={menuItems}
              rooms={rooms}
              onRestockItem={handleRestockItem}
            />
          </div>
        )}

        {/* Hotel Rooms Booking Screen */}
        {activeTab === 'rooms' && (
          <HotelRoomsScreen
            rooms={rooms}
            menuItems={menuItems}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onCheckOutRoom={handleCheckOutRoom}
          />
        )}

        {/* Supplier & Expense Ledger (Accountant) */}
        {activeTab === 'supplier' && (
          <SupplierAccountingScreen
            supplierPurchases={supplierPurchases}
            expenses={expenses}
            onAddPurchase={handleAddPurchase}
            onAddExpense={handleAddExpense}
          />
        )}

        {/* Owner Daily P&L Dashboard */}
        {activeTab === 'owner_pnl' && (
          <OwnerFinancialReportScreen
            orders={orders}
            supplierPurchases={supplierPurchases}
            expenses={expenses}
            rooms={rooms}
          />
        )}

        {/* Tab 4: Flutter Code Architecture & File Tree */}
        {activeTab === 'code' && <CodeExplorer />}

        {/* Tab 5: Cloud Firestore NoSQL Schema & Live JSON */}
        {activeTab === 'schema' && (
          <FirestoreSchemaViewer
            tables={tables}
            menuItems={menuItems}
            orders={orders}
          />
        )}

        {/* Tab 6: Beginner Step-by-Step Setup & APK Guide */}
        {activeTab === 'guide' && <SetupGuide />}
      </main>

      {/* Phase 2: Checkout & Receipt Billing Modal */}
      {checkoutOrder && (
        <CheckoutReceiptModal
          order={checkoutOrder}
          onClose={() => setCheckoutOrder(null)}
          onCompletePayment={handleCompletePayment}
        />
      )}

      {/* Phase 3: Thermal Receipt & KOT Slip Generator Modal */}
      {thermalReceiptOrder && (
        <ThermalReceiptModal
          order={thermalReceiptOrder}
          onClose={() => setThermalReceiptOrder(null)}
          initialMode={thermalMode}
        />
      )}

      {/* Owner Admin Modal */}
      <OwnerAdminModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        menuItems={menuItems}
        tables={tables}
        onAddMenuItem={handleAddMenuItem}
        onDeleteMenuItem={handleDeleteMenuItem}
        onUpdateMenuItem={handleUpdateMenuItem}
        onAddTable={handleAddTable}
        onDeleteTable={handleDeleteTable}
        restaurantProfile={restaurantProfile}
        onUpdateRestaurantProfile={setRestaurantProfile}
      />

      {/* Restaurant Auth & Profile Modal */}
      <RestaurantAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSaveProfile={(profile) => setRestaurantProfile(profile)}
      />

      {/* Subscription & SaaS License Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={setSubscription}
        isBlockedByTrial={isBillingBlocked}
      />
    </div>
  );
}

