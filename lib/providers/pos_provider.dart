// lib/providers/pos_provider.dart
import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/daily_sales_report.dart';
import '../models/supplier_model.dart';
import '../models/expense_model.dart';
import '../models/subscription_model.dart';
import '../services/pos_firestore_service.dart';

class PosProvider extends ChangeNotifier {
  final PosFirestoreService _service = PosFirestoreService();

  RestaurantProfile _profile = RestaurantProfile();
  RestaurantProfile get profile => _profile;

  // Available Rooms/Sections
  final List<String> _rooms = [
    'Main Hall',
    'Rooftop Garden',
    'AC Cabin',
    'Family Dining',
    'Bar & Lounge',
  ];
  List<String> get rooms => _rooms;

  // Initial tables seeded by default with section assignment
  List<TableModel> _tables = [
    TableModel(tableNumber: 1, roomSection: 'Main Hall', seatingCapacity: 2, status: TableStatus.available),
    TableModel(tableNumber: 2, roomSection: 'Main Hall', seatingCapacity: 2, status: TableStatus.available),
    TableModel(tableNumber: 3, roomSection: 'Main Hall', seatingCapacity: 4, status: TableStatus.available),
    TableModel(tableNumber: 4, roomSection: 'Main Hall', seatingCapacity: 4, status: TableStatus.available),
    TableModel(tableNumber: 5, roomSection: 'Rooftop Garden', seatingCapacity: 4, status: TableStatus.available),
    TableModel(tableNumber: 6, roomSection: 'Rooftop Garden', seatingCapacity: 4, status: TableStatus.available),
    TableModel(tableNumber: 7, roomSection: 'Rooftop Garden', seatingCapacity: 6, status: TableStatus.available),
    TableModel(tableNumber: 8, roomSection: 'AC Cabin', seatingCapacity: 6, status: TableStatus.available),
    TableModel(tableNumber: 9, roomSection: 'AC Cabin', seatingCapacity: 8, status: TableStatus.available),
    TableModel(tableNumber: 10, roomSection: 'Family Dining', seatingCapacity: 8, status: TableStatus.available),
    TableModel(tableNumber: 11, roomSection: 'Family Dining', seatingCapacity: 10, status: TableStatus.available),
    TableModel(tableNumber: 12, roomSection: 'Bar & Lounge', seatingCapacity: 4, status: TableStatus.available),
  ];

  // Initial popular Nepali menu items seeded with images & cost
  List<MenuItem> _menuItems = [
    MenuItem(
      id: 'item-1',
      name: 'Buff Steamed Mo:Mo',
      price: 150.0,
      costPrice: 65.0,
      category: 'Mo:Mo Specials',
      stockQuantity: 50,
      isVeg: false,
      spicyLevel: 2,
      description: 'Juicy buff mince filled dumplings with homemade spicy sesame achar',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300',
    ),
    MenuItem(
      id: 'item-2',
      name: 'Chicken Jhol Mo:Mo',
      price: 220.0,
      costPrice: 90.0,
      category: 'Mo:Mo Specials',
      stockQuantity: 40,
      isVeg: false,
      spicyLevel: 3,
      description: 'Hot steaming chicken momo immersed in tangy spiced nutty soup',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300',
    ),
    MenuItem(
      id: 'item-3',
      name: 'Paneer Fried Mo:Mo',
      price: 200.0,
      costPrice: 85.0,
      category: 'Mo:Mo Specials',
      stockQuantity: 30,
      isVeg: true,
      spicyLevel: 1,
      description: 'Crispy fried cottage cheese dumplings served with mint dip',
      imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300',
    ),
    MenuItem(
      id: 'item-4',
      name: 'Chicken Chowmein',
      price: 180.0,
      costPrice: 75.0,
      category: 'Noodles & Chowmein',
      stockQuantity: 45,
      isVeg: false,
      spicyLevel: 2,
      description: 'Wok tossed hand-pulled noodles with chicken shreds & fresh veggies',
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300',
    ),
    MenuItem(
      id: 'item-5',
      name: 'Special Newari Khaja Set',
      price: 380.0,
      costPrice: 160.0,
      category: 'Khaja & Platters',
      stockQuantity: 25,
      isVeg: false,
      spicyLevel: 3,
      description: 'Baji (beaten rice), Choila, Aalu Tama, Bhatmas, Egg, & Achar',
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300',
    ),
    MenuItem(
      id: 'item-6',
      name: 'Thakali Mutton Khana Set',
      price: 450.0,
      costPrice: 210.0,
      category: 'Curry & Rice',
      stockQuantity: 20,
      isVeg: false,
      spicyLevel: 2,
      description: 'Basmati rice, Jimbu flavored black dal, Local Mutton, Saag, Ghee',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300',
    ),
    MenuItem(
      id: 'item-7',
      name: 'Everest Cold Beer (650ml)',
      price: 360.0,
      costPrice: 220.0,
      category: 'Beverages & Desserts',
      stockQuantity: 60,
      isVeg: true,
      spicyLevel: 0,
      description: 'Chilled premium Nepali lager beer',
      imageUrl: 'https://images.unsplash.com/photo-1608270119293-8f64585c543f?w=300',
    ),
    MenuItem(
      id: 'item-8',
      name: 'Masala Milk Tea / Chiya',
      price: 50.0,
      costPrice: 15.0,
      category: 'Beverages & Desserts',
      stockQuantity: 100,
      isVeg: true,
      spicyLevel: 1,
      description: 'Traditional spiced Himalayan CTC milk tea brewed with cardamom',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300',
    ),
  ];

  // Suppliers List
  List<SupplierModel> _suppliers = [
    SupplierModel(
      id: 'sup-1',
      name: 'Himalayan Fresh Poultry & Meat',
      contactPerson: 'Bikash Shrestha',
      phone: '9851023456',
      address: 'Baneshwor, Kathmandu',
      category: 'Meat & Poultry',
      outstandingBalance: 12500.0,
    ),
    SupplierModel(
      id: 'sup-2',
      name: 'Kalimati Green Vegetable Wholesalers',
      contactPerson: 'Ram Kumar Thapa',
      phone: '9841334455',
      address: 'Kalimati, Kathmandu',
      category: 'Vegetables',
      outstandingBalance: 4200.0,
    ),
    SupplierModel(
      id: 'sup-3',
      name: 'DDC Dairy & Milk Distributors',
      contactPerson: 'Suresh KC',
      phone: '9801223344',
      address: 'Lainchaur, Kathmandu',
      category: 'Dairy & Milk',
      outstandingBalance: 3100.0,
    ),
  ];
  List<SupplierModel> get suppliers => _suppliers;

  // Purchase Entries (सामान खरिद रेकर्ड)
  List<PurchaseEntry> _purchases = [
    PurchaseEntry(
      id: 'pur-1',
      supplierName: 'Himalayan Fresh Poultry',
      itemName: 'Fresh Boneless Chicken & Buff Mince',
      quantity: 25,
      unit: 'kg',
      rate: 380.0,
      totalAmount: 9500.0,
      invoiceNumber: 'INV-7801',
      date: DateTime.now().subtract(const Duration(hours: 4)),
      paymentStatus: 'Paid',
    ),
    PurchaseEntry(
      id: 'pur-2',
      supplierName: 'Kalimati Green Vegetable',
      itemName: 'Onions, Cabbage, Ginger, Garlic, Coriander',
      quantity: 40,
      unit: 'kg',
      rate: 85.0,
      totalAmount: 3400.0,
      invoiceNumber: 'INV-4412',
      date: DateTime.now().subtract(const Duration(hours: 6)),
      paymentStatus: 'Paid',
    ),
  ];
  List<PurchaseEntry> get purchases => _purchases;

  // Daily Expenses (खर्चहरू)
  List<ExpenseModel> _expenses = [
    ExpenseModel(
      id: 'exp-1',
      title: 'Commercial LPG Gas Refill (2 Cylinders)',
      category: 'LPG Gas Cylinder',
      amount: 4400.0,
      paymentMethod: 'Cash',
      date: DateTime.now().subtract(const Duration(hours: 5)),
      note: 'Kitchen stove burners',
    ),
    ExpenseModel(
      id: 'exp-2',
      title: 'Kitchen Cleaning & Tissue Paper Roll Supplies',
      category: 'Miscellaneous',
      amount: 850.0,
      paymentMethod: 'eSewa',
      date: DateTime.now().subtract(const Duration(hours: 2)),
    ),
  ];
  List<ExpenseModel> get expenses => _expenses;

  List<OrderModel> _orders = [];
  Map<int, List<OrderItem>> _tableCarts = {};
  bool _isLoading = false;

  // Getters
  List<TableModel> get tables => _tables;
  List<MenuItem> get menuItems => _menuItems;
  List<OrderModel> get orders => _orders;
  List<OrderModel> get activeOrders => _orders.where((o) => o.status != OrderStatus.paid && o.status != OrderStatus.cancelled).toList();
  bool get isLoading => _isLoading;

  PosProvider() {
    _initStreamListeners();
  }

  void _initStreamListeners() {
    _service.getTablesStream().listen(
      (cloudTables) {
        if (cloudTables.isNotEmpty) {
          _tables = cloudTables;
          notifyListeners();
        }
      },
      onError: (e) => debugPrint('Tables fallback: $e'),
    );

    _service.getOrdersStream().listen(
      (cloudOrders) {
        if (cloudOrders.isNotEmpty) {
          _orders = cloudOrders;
          notifyListeners();
        }
      },
      onError: (e) => debugPrint('Orders fallback: $e'),
    );
  }

  // --- ROOM & TABLE MANAGEMENT ---
  void addRoom(String roomName) {
    if (!_rooms.contains(roomName)) {
      _rooms.add(roomName);
      notifyListeners();
    }
  }

  void addTable({required int tableNumber, required String roomSection, required int seatingCapacity}) {
    final existingIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (existingIndex >= 0) {
      _tables[existingIndex] = TableModel(
        tableNumber: tableNumber,
        roomSection: roomSection,
        seatingCapacity: seatingCapacity,
        status: TableStatus.available,
      );
    } else {
      _tables.add(
        TableModel(
          tableNumber: tableNumber,
          roomSection: roomSection,
          seatingCapacity: seatingCapacity,
          status: TableStatus.available,
        ),
      );
      _tables.sort((a, b) => a.tableNumber.compareTo(b.tableNumber));
    }
    notifyListeners();
  }

  void deleteTable(int tableNumber) {
    _tables.removeWhere((t) => t.tableNumber == tableNumber);
    _tableCarts.remove(tableNumber);
    notifyListeners();
  }

  void bookTable({
    required int tableNumber,
    required String customerName,
    required String phone,
    required String bookingTime,
  }) {
    final index = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (index >= 0) {
      _tables[index] = _tables[index].copyWith(
        status: TableStatus.reserved,
        reservedForName: customerName,
        reservedForPhone: phone,
        reservedTime: bookingTime,
      );
      notifyListeners();
    }
  }

  void freeTable(int tableNumber) {
    final index = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (index >= 0) {
      _tables[index] = _tables[index].copyWith(
        status: TableStatus.available,
        currentOrderId: null,
        occupiedSince: null,
        reservedForName: null,
        reservedForPhone: null,
        reservedTime: null,
      );
      _tableCarts.remove(tableNumber);
      notifyListeners();
    }
  }

  // --- MENU ITEM MANAGEMENT (ADD / EDIT / DELETE / PHOTO) ---
  void addMenuItem(MenuItem item) {
    _menuItems.add(item);
    notifyListeners();
  }

  void updateMenuItem(MenuItem updatedItem) {
    final index = _menuItems.indexWhere((i) => i.id == updatedItem.id);
    if (index >= 0) {
      _menuItems[index] = updatedItem;
      notifyListeners();
    }
  }

  void deleteMenuItem(String itemId) {
    _menuItems.removeWhere((i) => i.id == itemId);
    notifyListeners();
  }

  void toggleItemAvailability(String itemId) {
    final index = _menuItems.indexWhere((i) => i.id == itemId);
    if (index >= 0) {
      final current = _menuItems[index];
      _menuItems[index] = current.copyWith(isAvailable: !current.isAvailable);
      notifyListeners();
    }
  }

  // --- SUPPLIERS & PURCHASES & EXPENSES ---
  void addSupplier(SupplierModel supplier) {
    _suppliers.add(supplier);
    notifyListeners();
  }

  void addPurchase(PurchaseEntry purchase) {
    _purchases.insert(0, purchase);
    notifyListeners();
  }

  void addExpense(ExpenseModel expense) {
    _expenses.insert(0, expense);
    notifyListeners();
  }

  // --- ADMIN PROFILE & SETTINGS ---
  void updateProfile(RestaurantProfile profile) {
    _profile = profile;
    notifyListeners();
  }

  // --- CART MANAGEMENT ---
  List<OrderItem> getCartForTable(int tableNumber) {
    return _tableCarts[tableNumber] ?? [];
  }

  double getTableCartSubtotal(int tableNumber) {
    final items = getCartForTable(tableNumber);
    return items.fold(0.0, (sum, item) => sum + item.lineTotal);
  }

  void addItemToTableCart(int tableNumber, MenuItem menuItem, {int qty = 1, String? specialInstructions}) {
    if (!_tableCarts.containsKey(tableNumber)) {
      _tableCarts[tableNumber] = [];
    }

    final cart = _tableCarts[tableNumber]!;
    final existingIndex = cart.indexWhere((item) => item.menuItemId == menuItem.id);

    if (existingIndex >= 0) {
      final existing = cart[existingIndex];
      cart[existingIndex] = existing.copyWith(
        quantity: existing.quantity + qty,
        specialInstructions: specialInstructions ?? existing.specialInstructions,
      );
    } else {
      cart.add(
        OrderItem(
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: qty,
          price: menuItem.price,
          specialInstructions: specialInstructions,
        ),
      );
    }

    // Set table status to occupied if available
    final tableIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (tableIndex >= 0 && _tables[tableIndex].isAvailable) {
      _tables[tableIndex] = _tables[tableIndex].copyWith(
        status: TableStatus.occupied,
        occupiedSince: DateTime.now().toIso8601String(),
      );
    }

    notifyListeners();
  }

  void removeItemFromTableCart(int tableNumber, String menuItemId) {
    if (!_tableCarts.containsKey(tableNumber)) return;
    _tableCarts[tableNumber]!.removeWhere((item) => item.menuItemId == menuItemId);
    notifyListeners();
  }

  void updateCartItemQuantity(int tableNumber, String menuItemId, int newQuantity) {
    if (!_tableCarts.containsKey(tableNumber)) return;
    final cart = _tableCarts[tableNumber]!;
    final index = cart.indexWhere((item) => item.menuItemId == menuItemId);

    if (index >= 0) {
      if (newQuantity <= 0) {
        cart.removeAt(index);
      } else {
        cart[index] = cart[index].copyWith(quantity: newQuantity);
      }
      notifyListeners();
    }
  }

  void clearTableCart(int tableNumber) {
    _tableCarts.remove(tableNumber);
    notifyListeners();
  }

  // --- KOT & ORDER SUBMISSION ---
  Future<bool> sendKOTToKitchen(int tableNumber, {String? kitchenNote, String? serverName}) async {
    final cartItems = getCartForTable(tableNumber);
    if (cartItems.isEmpty) return false;

    _isLoading = true;
    notifyListeners();

    final subtotal = getTableCartSubtotal(tableNumber);
    final serviceCharge = subtotal * (_profile.serviceChargeRate / 100.0);
    final taxableAmount = subtotal + serviceCharge;
    final tax = _profile.isPanEnabled ? (taxableAmount * (_profile.vatRate / 100.0)) : 0.0;
    final total = taxableAmount + tax;

    final orderId = 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    final newOrder = OrderModel(
      orderId: orderId,
      tableNumber: tableNumber,
      itemsList: List.from(cartItems),
      subtotal: subtotal,
      taxAmount: tax,
      totalAmount: total,
      status: OrderStatus.preparing,
      timestamp: DateTime.now(),
      kitchenNote: kitchenNote,
      serverName: serverName ?? 'Staff POS',
    );

    _orders.insert(0, newOrder);

    final tableIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (tableIndex >= 0) {
      _tables[tableIndex] = _tables[tableIndex].copyWith(
        status: TableStatus.occupied,
        currentOrderId: orderId,
        occupiedSince: _tables[tableIndex].occupiedSince ?? DateTime.now().toIso8601String(),
      );
    }

    try {
      await _service.saveNewOrder(newOrder);
      await _service.updateTableStatus(tableNumber, TableStatus.occupied, orderId: orderId);
    } catch (e) {
      debugPrint('Cloud sync handled locally: $e');
    }

    _isLoading = false;
    notifyListeners();
    return true;
  }

  // --- KDS STATUS UPDATE ---
  Future<void> updateOrderStatus(String orderId, OrderStatus status) async {
    final orderIndex = _orders.indexWhere((o) => o.orderId == orderId);
    if (orderIndex >= 0) {
      _orders[orderIndex] = _orders[orderIndex].copyWith(status: status);
      notifyListeners();
    }

    try {
      await _service.updateOrderStatus(orderId, status);
    } catch (e) {
      debugPrint('Order status update handled: $e');
    }
  }

  // --- BILL SETTLEMENT & NEPALI PAYMENTS ---
  Future<void> completePaymentAndFreeTable({
    required String orderId,
    required int tableNumber,
    required double finalTotal,
    required double discountPercent,
    required String paymentMethod,
    String? transactionRef,
  }) async {
    final orderIndex = _orders.indexWhere((o) => o.orderId == orderId);
    if (orderIndex >= 0) {
      _orders[orderIndex] = _orders[orderIndex].copyWith(
        status: OrderStatus.paid,
        totalAmount: finalTotal,
        discountPercent: discountPercent,
        paymentMethod: paymentMethod,
        transactionRef: transactionRef ?? 'TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}',
        settledAt: DateTime.now().toIso8601String(),
      );
    }

    freeTable(tableNumber);

    try {
      await _service.settleBill(orderId, paymentMethod, finalTotal);
      await _service.updateTableStatus(tableNumber, TableStatus.available);
    } catch (e) {
      debugPrint('Cloud sync handled: $e');
    }

    notifyListeners();
  }

  // --- TOTAL ACCOUNTS & FINANCIAL METRICS (सबै हिसाब किताब) ---
  double get totalSalesToday => _orders
      .where((o) => o.status == OrderStatus.paid)
      .fold(0.0, (sum, o) => sum + o.totalAmount);

  double get totalPurchasesToday => _purchases
      .fold(0.0, (sum, p) => sum + p.totalAmount);

  double get totalExpensesToday => _expenses
      .fold(0.0, (sum, e) => sum + e.amount);

  List<OrderModel> get paidOrders => _orders.where((o) => o.status == OrderStatus.paid).toList();

  double get vatCollectedToday => _orders
      .where((o) => o.status == OrderStatus.paid)
      .fold(0.0, (sum, o) => sum + o.taxAmount);

  double get totalDiscountsToday => _orders
      .where((o) => o.status == OrderStatus.paid)
      .fold(0.0, (sum, o) => sum + o.discountAmount);

  Map<String, double> get paymentChannelBreakdown => {
    'Cash': cashSales,
    'Fonepay': digitalSales * 0.40,
    'eSewa': digitalSales * 0.40,
    'Khalti': digitalSales * 0.20,
    'Card': 0.0,
  };

  
  List<OrderItem> get cart => _tableCarts.values.isNotEmpty ? _tableCarts.values.first : [];
  double get cartSubtotal => _tableCarts.values.isNotEmpty ? _tableCarts.values.first.fold(0.0, (s, i) => s + i.lineTotal) : 0.0;
  double get cartVatAmount => cartSubtotal * (_profile.vatRate / 100.0);
  double get cartGrandTotal => cartSubtotal + cartVatAmount;
  void updateCartQuantity(String itemId, int delta) {
    if (_tableCarts.isNotEmpty) {
      final tNum = _tableCarts.keys.first;
      final cartList = _tableCarts[tNum]!;
      final idx = cartList.indexWhere((i) => i.menuItemId == itemId);
      if (idx >= 0) {
        updateCartItemQuantity(tNum, itemId, cartList[idx].quantity + delta);
      }
    }
  }

  double get netProfitToday => totalSalesToday - (totalPurchasesToday + totalExpensesToday);

  double get netRevenueToday => totalSalesToday;

  double get grossSalesToday => totalSalesToday;

  Map<String, double> get paymentBreakdown => {
    'Cash': cashSales,
    'eSewa': digitalSales * 0.55,
    'Khalti': digitalSales * 0.35,
    'Card': digitalSales * 0.10,
  };

  void restockMenuItem(String itemId, int qty) {
    final idx = _menuItems.indexWhere((i) => i.id == itemId);
    if (idx >= 0) {
      _menuItems[idx] = _menuItems[idx].copyWith(
        stockQuantity: _menuItems[idx].stockQuantity + qty,
      );
      notifyListeners();
    }
  }

  Future<void> performDayClose() async {
    _tableCarts.clear();
    notifyListeners();
  }

  double get cashSales => _orders
      .where((o) => o.status == OrderStatus.paid && (o.paymentMethod ?? '').toLowerCase() == 'cash')
      .fold(0.0, (sum, o) => sum + o.totalAmount);

  double get digitalSales => totalSalesToday - cashSales;
}
