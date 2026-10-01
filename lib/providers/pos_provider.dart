// lib/providers/pos_provider.dart
import 'package:flutter/material.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/menu_item.dart';
import '../models/daily_sales_report.dart';
import '../models/supplier_model.dart';
import '../models/expense_model.dart';
import '../models/subscription_model.dart';
import '../services/pos_firestore_service.dart';

class PosProvider extends ChangeNotifier {
  final PosFirestoreService _firestoreService = PosFirestoreService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  List<TableModel> _tables = [];
  List<MenuItem> _menuItems = [];
  List<OrderModel> _orders = [];
  List<SupplierModel> _suppliers = [];
  List<PurchaseEntry> _purchases = [];
  List<ExpenseModel> _expenses = [];

  List<String> _rooms = [
    'Main Hall',
    'Rooftop Garden',
    'AC Cabin',
    'Family Dining',
    'Bar & Lounge',
    'Banquet Hall',
  ];

  final List<String> _staffList = [
    'Bikash Shrestha',
    'Pooja Gurung',
    'Aayush Thapa',
    'Rohan Sharma',
    'Sita Koirala',
  ];

  final List<String> _chefList = [
    'Chef Ram Karki',
    'Chef Suman Tamang',
    'Chef Deepak Adhikari',
    'Chef Mina Magar',
  ];

  String _selectedServer = 'Bikash Shrestha';

  RestaurantProfile _profile = RestaurantProfile(
    restaurantName: 'HIMALAYAN RESTAURANT & BAR',
    ownerName: 'Rajesh Shrestha',
    phone: '+977-9841000000',
    email: 'mithobite@gmail.com',
    panVatNumber: '601928374',
    address: 'Thamel Marg, Kathmandu, Nepal',
    serviceChargeRate: 0.0,
    vatRate: 13.0,
    isPanEnabled: true,
  );

  SubscriptionPlan _subscription = SubscriptionPlan(
    planType: PlanType.trial,
    planName: '१५ दिने निःशुल्क ट्रायल (15-Day Trial)',
    price: 0,
    trialDaysRemaining: 14,
    status: 'ACTIVE',
  );

  final Map<int, List<OrderItem>> _tableCarts = {};
  TableModel? _selectedTable;

  List<TableModel> get tables => _tables;
  List<MenuItem> get menuItems => _menuItems;
  List<OrderModel> get orders => _orders;
  List<SupplierModel> get suppliers => _suppliers;
  List<PurchaseEntry> get purchases => _purchases;
  List<ExpenseModel> get expenses => _expenses;
  List<String> get rooms => _rooms;
  List<String> get staffList => _staffList;
  List<String> get chefList => _chefList;
  String get selectedServer => _selectedServer;
  RestaurantProfile get profile => _profile;
  SubscriptionPlan get subscription => _subscription;
  TableModel? get selectedTable => _selectedTable;

  List<OrderModel> get activeOrders =>
      _orders.where((o) => o.status != OrderStatus.paid && o.status != OrderStatus.cancelled).toList();

  List<OrderModel> get paidOrders =>
      _orders.where((o) => o.status == OrderStatus.paid).toList();

  int get cartCount => _tableCarts.values.fold(0, (sum, list) => sum + list.length);

  // Financial Getters for Accounting & Sales Reports
  double get totalSalesToday => paidOrders.fold(0.0, (sum, o) => sum + o.totalAmount);
  double get grossSalesToday => totalSalesToday;
  double get netRevenueToday => paidOrders.fold(0.0, (sum, o) => sum + o.subtotal - o.discountAmount);
  double get vatCollectedToday => paidOrders.fold(0.0, (sum, o) => sum + o.taxAmount);
  double get totalDiscountsToday => paidOrders.fold(0.0, (sum, o) => sum + o.discountAmount);

  double get totalPurchasesToday => _purchases.fold(0.0, (sum, p) => sum + p.totalAmount);
  double get totalExpensesToday => _expenses.fold(0.0, (sum, e) => sum + e.amount);

  double get netProfitToday => totalSalesToday - (totalPurchasesToday + totalExpensesToday);

  double get cashSales => paidOrders
      .where((o) => (o.paymentMethod ?? '').toLowerCase().contains('cash') || o.isSplitPayment)
      .fold(0.0, (sum, o) => sum + (o.isSplitPayment ? o.splitCashAmount : o.totalAmount));

  double get digitalSales => paidOrders
      .where((o) => !(o.paymentMethod ?? '').toLowerCase().contains('cash') || o.isSplitPayment)
      .fold(0.0, (sum, o) => sum + (o.isSplitPayment ? o.splitDigitalAmount : o.totalAmount));

  Map<String, double> get paymentChannelBreakdown {
    final map = <String, double>{
      'Cash': 0.0,
      'eSewa': 0.0,
      'Khalti': 0.0,
      'Fonepay': 0.0,
      'Card': 0.0,
    };
    for (final o in paidOrders) {
      if (o.isSplitPayment) {
        map['Cash'] = (map['Cash'] ?? 0.0) + o.splitCashAmount;
        final w = o.splitDigitalWallet ?? 'eSewa';
        map[w] = (map[w] ?? 0.0) + o.splitDigitalAmount;
      } else {
        final m = o.paymentMethod ?? 'Cash';
        map[m] = (map[m] ?? 0.0) + o.totalAmount;
      }
    }
    return map;
  }

  void selectTable(TableModel table) {
    _selectedTable = table;
    notifyListeners();
  }

  void setSelectedServer(String server) {
    _selectedServer = server;
    notifyListeners();
  }

  void updateProfile({
    String? restaurantName,
    String? ownerName,
    String? phone,
    String? email,
    String? panVatNumber,
    String? address,
    double? serviceChargeRate,
    double? vatRate,
    bool? isPanEnabled,
  }) {
    _profile = _profile.copyWith(
      restaurantName: restaurantName,
      ownerName: ownerName,
      phone: phone,
      email: email,
      panVatNumber: panVatNumber,
      address: address,
      serviceChargeRate: serviceChargeRate,
      vatRate: vatRate,
      isPanEnabled: isPanEnabled,
    );
    notifyListeners();
  }

  void updateRestaurantProfile(RestaurantProfile newProfile) {
    _profile = newProfile;
    notifyListeners();
  }

  void updateSubscription(SubscriptionPlan newSub) {
    _subscription = newSub;
    notifyListeners();
  }

  PosProvider() {
    _initData();
  }

  void _initData() {
    _tables = [
      TableModel(tableNumber: 1, seatingCapacity: 4, roomSection: 'Main Hall', isAvailable: true),
      TableModel(tableNumber: 2, seatingCapacity: 2, roomSection: 'Main Hall', isAvailable: true),
      TableModel(tableNumber: 3, seatingCapacity: 6, roomSection: 'Main Hall', isAvailable: false, status: TableStatus.occupied),
      TableModel(tableNumber: 4, seatingCapacity: 4, roomSection: 'Rooftop Garden', isAvailable: true),
      TableModel(tableNumber: 5, seatingCapacity: 4, roomSection: 'Rooftop Garden', isAvailable: true),
      TableModel(tableNumber: 6, seatingCapacity: 8, roomSection: 'Rooftop Garden', isAvailable: false, status: TableStatus.occupied),
      TableModel(tableNumber: 7, seatingCapacity: 4, roomSection: 'AC Cabin', isAvailable: true),
      TableModel(tableNumber: 8, seatingCapacity: 6, roomSection: 'AC Cabin', isAvailable: false, status: TableStatus.reserved),
      TableModel(tableNumber: 9, seatingCapacity: 4, roomSection: 'Family Dining', isAvailable: true),
      TableModel(tableNumber: 10, seatingCapacity: 10, roomSection: 'Family Dining', isAvailable: true),
      TableModel(tableNumber: 11, seatingCapacity: 4, roomSection: 'Bar & Lounge', isAvailable: true),
      TableModel(tableNumber: 12, seatingCapacity: 2, roomSection: 'Bar & Lounge', isAvailable: true),
    ];

    _menuItems = [
      MenuItem(
        id: 'momo-01',
        name: 'Steamed Buff Mo:Mo (10 pcs)',
        category: 'Mo:Mo Specials',
        price: 320,
        costPrice: 110,
        isVeg: false,
        isBestseller: true,
        spicyLevel: 2,
        prepTimeMinutes: 10,
        rating: 4.9,
        stockQuantity: 45,
        description: 'Authentic juicy steamed buffalo meat dumplings served with spicy tomato sesame achar.',
        imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'momo-02',
        name: 'Paneer Cheese Fried Mo:Mo',
        category: 'Mo:Mo Specials',
        price: 350,
        costPrice: 130,
        isVeg: true,
        isBestseller: true,
        spicyLevel: 1,
        prepTimeMinutes: 12,
        rating: 4.8,
        stockQuantity: 30,
        description: 'Crispy fried cottage cheese & fresh green herbs momo with mint chutney.',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'momo-03',
        name: 'Hot & Spicy Jhol Mo:Mo',
        category: 'Mo:Mo Specials',
        price: 380,
        costPrice: 140,
        isVeg: false,
        isBestseller: true,
        spicyLevel: 3,
        prepTimeMinutes: 12,
        rating: 4.9,
        stockQuantity: 25,
        description: 'Steamed chicken momo submerged in hot, sour & spicy sesame soybean gravy soup.',
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'chw-01',
        name: 'Nepali Chicken Chowmein',
        category: 'Noodles & Chowmein',
        price: 280,
        costPrice: 95,
        isVeg: false,
        isBestseller: true,
        spicyLevel: 2,
        prepTimeMinutes: 10,
        rating: 4.7,
        stockQuantity: 40,
        description: 'Wok-tossed noodles with shredded chicken breast, bell peppers and mountain spices.',
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'khaja-01',
        name: 'Newari Samay Baji Platter',
        category: 'Khaja & Platters',
        price: 520,
        costPrice: 190,
        isVeg: false,
        isBestseller: true,
        spicyLevel: 2,
        prepTimeMinutes: 15,
        rating: 5.0,
        stockQuantity: 18,
        description: 'Traditional Newari feast with Baji (beaten rice), Chhwela, Choila, Achar & Bhatmas.',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'curry-01',
        name: 'Himalayan Thakali Mutton Thali',
        category: 'Curry & Rice',
        price: 650,
        costPrice: 240,
        isVeg: false,
        isBestseller: true,
        spicyLevel: 2,
        prepTimeMinutes: 15,
        rating: 4.9,
        stockQuantity: 22,
        description: 'Authentic Mustang Thakali set with organic Jimbu scented black lentils and local goat curry.',
        imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'bev-01',
        name: 'Hot Himalayan Masala Chiya',
        category: 'Beverages & Desserts',
        price: 90,
        costPrice: 25,
        isVeg: true,
        isBestseller: false,
        spicyLevel: 0,
        prepTimeMinutes: 5,
        rating: 4.8,
        stockQuantity: 100,
        description: 'Creamy milk tea brewed with cardamom, clove, cinnamon & fresh ginger.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      ),
      MenuItem(
        id: 'bev-02',
        name: 'Fresh Sweet Mango Lassi',
        category: 'Beverages & Desserts',
        price: 180,
        costPrice: 60,
        isVeg: true,
        isBestseller: true,
        spicyLevel: 0,
        prepTimeMinutes: 5,
        rating: 4.9,
        stockQuantity: 35,
        description: 'Rich curd blended with sweet Terai mango pulp and crushed pistachios.',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
      ),
    ];

    _orders = [
      OrderModel(
        orderId: 'ORD-1001',
        tableNumber: 3,
        itemsList: [
          OrderItem(menuItemId: 'momo-01', name: 'Steamed Buff Mo:Mo (10 pcs)', quantity: 2, price: 320, specialInstructions: 'Extra spicy achar'),
          OrderItem(menuItemId: 'chw-01', name: 'Nepali Chicken Chowmein', quantity: 1, price: 280),
          OrderItem(menuItemId: 'bev-01', name: 'Hot Himalayan Masala Chiya', quantity: 2, price: 90),
        ],
        subtotal: 1100,
        taxAmount: 143,
        totalAmount: 1243,
        status: OrderStatus.preparing,
        timestamp: DateTime.now().subtract(const Duration(minutes: 14)),
        serverName: 'Bikash Shrestha',
        cookName: 'Chef Ram Karki',
        kitchenNote: 'Chiya served hot with momo',
      ),
      OrderModel(
        orderId: 'ORD-1002',
        tableNumber: 6,
        itemsList: [
          OrderItem(menuItemId: 'khaja-01', name: 'Newari Samay Baji Platter', quantity: 3, price: 520),
          OrderItem(menuItemId: 'bev-02', name: 'Fresh Sweet Mango Lassi', quantity: 4, price: 180),
        ],
        subtotal: 2280,
        taxAmount: 296.4,
        totalAmount: 2576.4,
        status: OrderStatus.pending,
        timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
        serverName: 'Pooja Gurung',
        kitchenNote: 'Less oil in baji',
      ),
      OrderModel(
        orderId: 'ORD-1000',
        tableNumber: 1,
        itemsList: [
          OrderItem(menuItemId: 'curry-01', name: 'Himalayan Thakali Mutton Thali', quantity: 2, price: 650),
        ],
        subtotal: 1300,
        taxAmount: 169,
        totalAmount: 1469,
        status: OrderStatus.paid,
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        serverName: 'Aayush Thapa',
        cookName: 'Chef Suman Tamang',
        paymentMethod: 'eSewa',
        transactionRef: 'ESEWA-992384',
        settledAt: DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(),
      ),
    ];

    _suppliers = [
      SupplierModel(id: 'SUP-01', name: 'Kalimati Fresh Veggies', contactPerson: 'Govinda KC', phone: '+977-9841223344', category: 'Vegetables & Spices', totalPurchased: 24500, outstandingBalance: 4500),
      SupplierModel(id: 'SUP-02', name: 'Himalayan Poultry Meat', contactPerson: 'Ram Shrestha', phone: '+977-9851098765', category: 'Chicken & Buffalo Meat', totalPurchased: 48000, outstandingBalance: 8000),
      SupplierModel(id: 'SUP-03', name: 'Dairy Star Milk & Paneer', contactPerson: 'Sita Maharjan', phone: '+977-9801122334', category: 'Dairy & Cheese', totalPurchased: 18000, outstandingBalance: 0),
    ];

    _purchases = [
      PurchaseEntry(id: 'PUR-01', supplierName: 'Kalimati Fresh Veggies', itemName: 'Fresh Onions, Tomatoes & Greens', quantity: 35, unit: 'kg', rate: 120, totalAmount: 4200, invoiceNumber: 'INV-KAL-901', date: DateTime.now()),
      PurchaseEntry(id: 'PUR-02', supplierName: 'Himalayan Poultry Meat', itemName: 'Fresh Boneless Chicken & Mutton', quantity: 20, unit: 'kg', rate: 450, totalAmount: 9000, invoiceNumber: 'INV-HIM-442', date: DateTime.now()),
    ];

    _expenses = [
      ExpenseModel(id: 'EXP-01', title: 'Nepal Gas LPG Cylinder (x2)', category: 'Gas & Kitchen Utilities', amount: 3800, paymentMethod: 'Cash', date: DateTime.now(), note: 'Kitchen replenishment'),
      ExpenseModel(id: 'EXP-02', title: 'Electricity & Internet Bill', category: 'Utilities', amount: 4200, paymentMethod: 'eSewa', date: DateTime.now().subtract(const Duration(days: 1)), note: 'NEA & WorldLink bill'),
    ];
  }

  List<OrderItem> getCartForTable(int tableNumber) => _tableCarts[tableNumber] ?? [];

  double getTableCartSubtotal(int tableNumber) {
    final cart = _tableCarts[tableNumber] ?? [];
    return cart.fold(0.0, (sum, item) => sum + item.lineTotal);
  }

  void addItemToTableCart(int tableNumber, MenuItem item) {
    final cart = _tableCarts.putIfAbsent(tableNumber, () => []);
    final existingIndex = cart.indexWhere((c) => c.menuItemId == item.id);
    if (existingIndex >= 0) {
      cart[existingIndex] = cart[existingIndex].copyWith(quantity: cart[existingIndex].quantity + 1);
    } else {
      cart.add(OrderItem(menuItemId: item.id, name: item.name, quantity: 1, price: item.price));
    }
    notifyListeners();
  }

  void updateCartItemQuantity(int tableNumber, String menuItemId, int newQuantity) {
    final cart = _tableCarts[tableNumber];
    if (cart == null) return;
    if (newQuantity <= 0) {
      cart.removeWhere((c) => c.menuItemId == menuItemId);
    } else {
      final index = cart.indexWhere((c) => c.menuItemId == menuItemId);
      if (index >= 0) {
        cart[index] = cart[index].copyWith(quantity: newQuantity);
      }
    }
    notifyListeners();
  }

  void clearTableCart(int tableNumber) {
    _tableCarts.remove(tableNumber);
    notifyListeners();
  }

  Future<bool> sendKOTToKitchen(int tableNumber, {String? kitchenNote, String? serverName}) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 350));
    createOrderForTable(tableNumber: tableNumber, kitchenNote: kitchenNote, serverName: serverName);

    _isLoading = false;
    notifyListeners();
    return true;
  }

  void createOrderForTable({
    required int tableNumber,
    required String? kitchenNote,
    String? serverName,
  }) {
    final cart = _tableCarts[tableNumber];
    if (cart == null || cart.isEmpty) return;

    final double subtotal = getTableCartSubtotal(tableNumber);
    final double taxAmount = _profile.isPanEnabled ? (subtotal * (_profile.vatRate / 100.0)) : 0.0;
    final double totalAmount = subtotal + taxAmount;

    final newOrder = OrderModel(
      orderId: 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      tableNumber: tableNumber,
      itemsList: List.from(cart),
      subtotal: subtotal,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      status: OrderStatus.pending,
      timestamp: DateTime.now(),
      kitchenNote: kitchenNote,
      serverName: serverName ?? _selectedServer,
    );

    _orders.insert(0, newOrder);
    _tableCarts.remove(tableNumber);

    final tableIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (tableIndex >= 0) {
      _tables[tableIndex] = _tables[tableIndex].copyWith(status: TableStatus.occupied, isAvailable: false);
    }

    notifyListeners();
  }

  void assignCookToOrder(String orderId, String cookName) {
    final index = _orders.indexWhere((o) => o.orderId == orderId);
    if (index >= 0) {
      _orders[index] = _orders[index].copyWith(
        cookName: cookName,
        status: OrderStatus.preparing,
      );
      notifyListeners();
    }
  }

  void updateOrderStatus(String orderId, OrderStatus newStatus) {
    final index = _orders.indexWhere((o) => o.orderId == orderId);
    if (index >= 0) {
      _orders[index] = _orders[index].copyWith(status: newStatus);
      notifyListeners();
    }
  }

  Future<void> completePaymentAndFreeTable({
    required String orderId,
    required int tableNumber,
    required double finalTotal,
    required double discountPercent,
    required String paymentMethod,
    required String transactionRef,
    bool isSplit = false,
    double splitCash = 0.0,
    double splitDigital = 0.0,
    String? splitWallet,
  }) async {
    final orderIndex = _orders.indexWhere((o) => o.orderId == orderId);
    if (orderIndex >= 0) {
      _orders[orderIndex] = _orders[orderIndex].copyWith(
        status: OrderStatus.paid,
        totalAmount: finalTotal,
        discountPercent: discountPercent,
        discountAmount: _orders[orderIndex].subtotal * (discountPercent / 100.0),
        paymentMethod: paymentMethod,
        transactionRef: transactionRef,
        settledAt: DateTime.now().toIso8601String(),
        isSplitPayment: isSplit,
        splitCashAmount: splitCash,
        splitDigitalAmount: splitDigital,
        splitDigitalWallet: splitWallet,
      );
    }

    final tableIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (tableIndex >= 0) {
      _tables[tableIndex] = _tables[tableIndex].copyWith(status: TableStatus.available, isAvailable: true);
    }

    notifyListeners();
  }

  void addPurchase(PurchaseEntry entry) {
    _purchases.insert(0, entry);
    notifyListeners();
  }

  void addSupplier(SupplierModel supplier) {
    _suppliers.insert(0, supplier);
    notifyListeners();
  }

  void addExpense(ExpenseModel expense) {
    _expenses.insert(0, expense);
    notifyListeners();
  }

  void addMenuItem(MenuItem item) {
    _menuItems.insert(0, item);
    notifyListeners();
  }

  void updateMenuItem(MenuItem updated) {
    final index = _menuItems.indexWhere((m) => m.id == updated.id);
    if (index >= 0) {
      _menuItems[index] = updated;
      notifyListeners();
    }
  }

  void deleteMenuItem(String id) {
    _menuItems.removeWhere((m) => m.id == id);
    notifyListeners();
  }

  void toggleItemAvailability(String id, [bool? isAvailable]) {
    final index = _menuItems.indexWhere((m) => m.id == id);
    if (index >= 0) {
      final newStatus = isAvailable ?? !_menuItems[index].isAvailable;
      _menuItems[index] = _menuItems[index].copyWith(isAvailable: newStatus);
      notifyListeners();
    }
  }

  void restockMenuItem(String id, int addedQuantity) {
    final index = _menuItems.indexWhere((m) => m.id == id);
    if (index >= 0) {
      _menuItems[index] = _menuItems[index].copyWith(
        stockQuantity: _menuItems[index].stockQuantity + addedQuantity,
        isAvailable: true,
      );
      notifyListeners();
    }
  }

  void freeTable(int tableNumber) {
    final index = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (index >= 0) {
      _tables[index] = _tables[index].copyWith(status: TableStatus.available, isAvailable: true);
      notifyListeners();
    }
  }

  void addTable(dynamic tableOrNumber, {String? roomSection, int? seatingCapacity, int? tableNumber}) {
    if (tableOrNumber is TableModel) {
      _tables.add(tableOrNumber);
    } else {
      final numVal = (tableOrNumber is int) ? tableOrNumber : (tableNumber ?? (_tables.length + 1));
      _tables.add(TableModel(
        tableNumber: numVal,
        roomSection: roomSection ?? 'Main Hall',
        seatingCapacity: seatingCapacity ?? 4,
        status: TableStatus.available,
      ));
    }
    notifyListeners();
  }

  void deleteTable(int tableNumber) {
    _tables.removeWhere((t) => t.tableNumber == tableNumber);
    notifyListeners();
  }

  void addRoom(String roomName) {
    addRoomSection(roomName);
  }

  void addRoomSection(String roomName) {
    if (!_rooms.contains(roomName)) {
      _rooms.add(roomName);
      notifyListeners();
    }
  }

  void removeRoomSection(String roomName) {
    _rooms.remove(roomName);
    notifyListeners();
  }

  void bookTable(dynamic tableNumber, {String? customerName, String? customerPhone, String? bookingTime}) {
    final int tNum = (tableNumber is int) ? tableNumber : 1;
    final index = _tables.indexWhere((t) => t.tableNumber == tNum);
    if (index >= 0) {
      _tables[index] = _tables[index].copyWith(status: TableStatus.reserved, isAvailable: false);
      notifyListeners();
    }
  }

  Future<void> performDayClose() async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    _isLoading = false;
    notifyListeners();
  }
}
