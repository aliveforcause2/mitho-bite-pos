// lib/providers/pos_provider.dart
import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/daily_sales_report.dart';
import '../services/pos_firestore_service.dart';

class PosProvider extends ChangeNotifier {
  final PosFirestoreService _service = PosFirestoreService();

  // Initial tables seeded by default (never empty)
  List<TableModel> _tables = List.generate(
    12,
    (index) => TableModel(
      id: 'table_${index + 1}',
      tableNumber: index + 1,
      seatingCapacity: index < 4 ? 2 : (index < 8 ? 4 : (index < 10 ? 6 : 8)),
      status: TableStatus.available,
    ),
  );

  // Initial popular Nepali menu items seeded by default
  List<MenuItem> _menuItems = [
    MenuItem(
      id: 'item-1',
      name: 'Buff Steamed Mo:Mo',
      price: 150.0,
      category: 'Mo:Mo',
      stockQuantity: 40,
      lowStockThreshold: 5,
      isAvailable: true,
      description: 'Handcrafted juicy buff dumplings served with spicy tomato-sesame achar.',
      isVeg: false,
      spicyLevel: 2,
    ),
    MenuItem(
      id: 'item-2',
      name: 'Chicken Steamed Mo:Mo',
      price: 180.0,
      category: 'Mo:Mo',
      stockQuantity: 35,
      lowStockThreshold: 5,
      isAvailable: true,
      description: 'Tender minced chicken dumplings seasoned with Himalayan herbs.',
      isVeg: false,
      spicyLevel: 1,
    ),
    MenuItem(
      id: 'item-3',
      name: 'Veg Fried Mo:Mo',
      price: 140.0,
      category: 'Mo:Mo',
      stockQuantity: 30,
      lowStockThreshold: 5,
      isAvailable: true,
      description: 'Crispy deep-fried mixed vegetable dumplings.',
      isVeg: true,
      spicyLevel: 1,
    ),
    MenuItem(
      id: 'item-4',
      name: 'C-Mo:Mo (Chilly Mo:Mo)',
      price: 210.0,
      category: 'Mo:Mo',
      stockQuantity: 25,
      lowStockThreshold: 5,
      isAvailable: true,
      description: 'Buff dumplings tossed in fiery spicy bell pepper and onion gravy.',
      isVeg: false,
      spicyLevel: 3,
    ),
    MenuItem(
      id: 'item-5',
      name: 'Chicken Chowmein',
      price: 180.0,
      category: 'Chowmein',
      stockQuantity: 30,
      lowStockThreshold: 5,
      isAvailable: true,
      description: 'Wok-tossed noodles with chicken strips, cabbage, carrots, and house spices.',
      isVeg: false,
      spicyLevel: 1,
    ),
    MenuItem(
      id: 'item-6',
      name: 'Buff Sukuti Sadheko',
      price: 260.0,
      category: 'Snacks',
      stockQuantity: 20,
      lowStockThreshold: 4,
      isAvailable: true,
      description: 'Dried spicy buff meat tossed with mustard oil, garlic, ginger, and green chilies.',
      isVeg: false,
      spicyLevel: 3,
    ),
    MenuItem(
      id: 'item-7',
      name: 'Nepali Thakali Thali (Mutton)',
      price: 480.0,
      category: 'Main Course',
      stockQuantity: 20,
      lowStockThreshold: 3,
      isAvailable: true,
      description: 'Authentic Thakali platter with Jimbu dal, mutton curry, gundruk achar, and bhat.',
      isVeg: false,
      spicyLevel: 2,
    ),
    MenuItem(
      id: 'item-8',
      name: 'Thakali Veg Thali',
      price: 320.0,
      category: 'Main Course',
      stockQuantity: 25,
      lowStockThreshold: 5,
      isAvailable: true,
      description: 'Organic local rice, black dal, seasonal tarkari, saag, and homemade radish achar.',
      isVeg: true,
      spicyLevel: 1,
    ),
    MenuItem(
      id: 'item-9',
      name: 'Chicken Sekuwa Set',
      price: 320.0,
      category: 'Snacks',
      stockQuantity: 25,
      lowStockThreshold: 4,
      isAvailable: true,
      description: 'Charcoal-grilled marinated chicken skewers served with chiura and bhatmas.',
      isVeg: false,
      spicyLevel: 2,
    ),
    MenuItem(
      id: 'item-10',
      name: 'Sweet Himalayan Lassi',
      price: 120.0,
      category: 'Beverages',
      stockQuantity: 50,
      lowStockThreshold: 10,
      isAvailable: true,
      description: 'Thick creamy churned yogurt sweetened with cardamom and pistachio.',
      isVeg: true,
      spicyLevel: 0,
    ),
    MenuItem(
      id: 'item-11',
      name: 'Masala Milk Tea (Chiya)',
      price: 50.0,
      category: 'Beverages',
      stockQuantity: 100,
      lowStockThreshold: 15,
      isAvailable: true,
      description: 'Fresh cow milk tea brewed with cardamom, clove, cinnamon, and ginger.',
      isVeg: true,
      spicyLevel: 0,
    ),
  ];

  List<OrderModel> _orders = [];
  final List<OrderItem> _cart = [];
  TableModel? _selectedTable;
  String _kitchenNote = '';
  bool _isLoading = false;

  // Getters
  List<TableModel> get tables => _tables;
  List<MenuItem> get menuItems => _menuItems;
  List<OrderModel> get orders => _orders;
  List<OrderItem> get cart => List.unmodifiable(_cart);
  TableModel? get selectedTable => _selectedTable;
  String get kitchenNote => _kitchenNote;
  bool get isLoading => _isLoading;

  // Filtered Orders
  List<OrderModel> get activeOrders => _orders
      .where((o) => o.status != OrderStatus.paid && o.status != OrderStatus.cancelled)
      .toList();
  List<OrderModel> get paidOrders => _orders.where((o) => o.status == OrderStatus.paid).toList();

  // Cart Financials
  int get cartCount => _cart.fold(0, (sum, i) => sum + i.quantity);
  double get cartSubtotal => _cart.fold(0.0, (sum, i) => sum + (i.price * i.quantity));
  double get cartVatAmount => cartSubtotal * 0.13; // 13% Nepal VAT
  double get cartGrandTotal => cartSubtotal + cartVatAmount;

  // Daily Ledger Financials
  double get grossSalesToday => paidOrders.fold(0.0, (sum, o) => sum + o.subtotal);
  double get totalDiscountsToday => paidOrders.fold(0.0, (sum, o) => sum + o.discountAmount);
  double get vatCollectedToday => paidOrders.fold(0.0, (sum, o) => sum + o.taxAmount);
  double get netRevenueToday => paidOrders.fold(0.0, (sum, o) => sum + o.totalAmount);

  Map<String, double> get paymentChannelBreakdown {
    double cash = 0.0;
    double fonepay = 0.0;
    double esewa = 0.0;
    double khalti = 0.0;
    double card = 0.0;
    for (final o in paidOrders) {
      final method = o.paymentMethod ?? 'Cash';
      final amt = o.totalAmount;
      if (method.contains('Fonepay')) {
        fonepay += amt;
      } else if (method.contains('eSewa')) {
        esewa += amt;
      } else if (method.contains('Khalti')) {
        khalti += amt;
      } else if (method.contains('Card')) {
        card += amt;
      } else {
        cash += amt;
      }
    }
    return {'Cash': cash, 'Fonepay': fonepay, 'eSewa': esewa, 'Khalti': khalti, 'Card': card};
  }

  // Stream Initialization with zero-crash guarantee
  void initFirestoreStreams() {
    try {
      _service.streamTables().listen((data) {
        if (data.isNotEmpty) {
          _tables = data;
          notifyListeners();
        }
      }, onError: (e) {
        debugPrint('Firestore tables stream error: $e');
      });

      _service.streamMenuItems().listen((data) {
        if (data.isNotEmpty) {
          _menuItems = data;
          notifyListeners();
        }
      }, onError: (e) {
        debugPrint('Firestore menu stream error: $e');
      });

      _service.streamOrders().listen((data) {
        _orders = data;
        notifyListeners();
      }, onError: (e) {
        debugPrint('Firestore orders stream error: $e');
      });
    } catch (e) {
      debugPrint('Stream initialization handled gracefully: $e');
    }
  }

  // Table Selection & Session
  void selectTable(TableModel table) {
    _selectedTable = table;
    _cart.clear();
    _kitchenNote = '';
    notifyListeners();
  }

  void setKitchenNote(String note) {
    _kitchenNote = note;
    notifyListeners();
  }

  // Cart Operations
  void addToCart(MenuItem item, {String? specialInstructions}) {
    if (item.stockQuantity <= 0) return;
    final index = _cart.indexWhere((i) => i.menuItemId == item.id);
    if (index >= 0) {
      if (_cart[index].quantity >= item.stockQuantity) return;
      _cart[index] = _cart[index].copyWith(
        quantity: _cart[index].quantity + 1,
        specialInstructions: specialInstructions ?? _cart[index].specialInstructions,
      );
    } else {
      _cart.add(OrderItem(
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
        specialInstructions: specialInstructions,
      ));
    }
    notifyListeners();
  }

  void updateCartQuantity(String menuItemId, int delta) {
    final index = _cart.indexWhere((i) => i.menuItemId == menuItemId);
    if (index >= 0) {
      final newQty = _cart[index].quantity + delta;
      if (newQty <= 0) {
        _cart.removeAt(index);
      } else {
        _cart[index] = _cart[index].copyWith(quantity: newQty);
      }
      notifyListeners();
    }
  }

  void removeFromCart(String menuItemId) {
    _cart.removeWhere((i) => i.menuItemId == menuItemId);
    notifyListeners();
  }

  // Dispatch to Kitchen (Firestore batch with offline local state update)
  Future<bool> sendOrderToKitchen() async {
    if (_selectedTable == null || _cart.isEmpty) return false;
    _isLoading = true;
    notifyListeners();

    final orderId = 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final newOrder = OrderModel(
      orderId: orderId,
      tableNumber: _selectedTable!.tableNumber,
      itemsList: List.from(_cart),
      subtotal: cartSubtotal,
      taxAmount: cartVatAmount,
      totalAmount: cartGrandTotal,
      status: OrderStatus.pending,
      timestamp: DateTime.now(),
      kitchenNote: _kitchenNote.isNotEmpty ? _kitchenNote : null,
    );

    // Update local state immediately
    _orders.insert(0, newOrder);
    final tableIndex = _tables.indexWhere((t) => t.tableNumber == _selectedTable!.tableNumber);
    if (tableIndex >= 0) {
      _tables[tableIndex] = _tables[tableIndex].copyWith(
        status: TableStatus.occupied,
        currentOrderId: orderId,
        occupiedSince: DateTime.now().toIso8601String(),
      );
    }

    // Attempt cloud sync
    try {
      await _service.placeOrderAndUpdateTable(newOrder);
    } catch (e) {
      debugPrint('Cloud sync skipped: $e');
    }

    _cart.clear();
    _kitchenNote = '';
    _isLoading = false;
    notifyListeners();
    return true;
  }

  // Update Status in KDS
  Future<void> updateOrderStatus(String orderId, OrderStatus status) async {
    final orderIndex = _orders.indexWhere((o) => o.orderId == orderId);
    if (orderIndex >= 0) {
      _orders[orderIndex] = _orders[orderIndex].copyWith(status: status);
      notifyListeners();
    }
    try {
      await _service.updateOrderStatus(orderId, status);
    } catch (e) {
      debugPrint('Order status cloud update handled: $e');
    }
  }

  // Settle Bill & Free Table
  Future<void> completePaymentAndFreeTable({
    required String orderId,
    required int tableNumber,
    required double finalTotal,
    required double discountPercent,
    required String paymentMethod,
    String? transactionRef,
  }) async {
    // Local state update
    final orderIndex = _orders.indexWhere((o) => o.orderId == orderId);
    if (orderIndex >= 0) {
      _orders[orderIndex] = _orders[orderIndex].copyWith(
        status: OrderStatus.paid,
        totalAmount: finalTotal,
        discountPercent: discountPercent,
        paymentMethod: paymentMethod,
        transactionRef: transactionRef ?? 'TXN-${DateTime.now().millisecondsSinceEpoch}',
        settledAt: DateTime.now().toIso8601String(),
      );
    }

    final tableIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (tableIndex >= 0) {
      _tables[tableIndex] = _tables[tableIndex].copyWith(
        status: TableStatus.available,
        currentOrderId: null,
        occupiedSince: null,
      );
    }
    notifyListeners();

    try {
      await _service.completePaymentAndFreeTable(
        orderId: orderId,
        tableNumber: tableNumber,
        finalTotal: finalTotal,
        discountPercent: discountPercent,
        paymentMethod: paymentMethod,
        transactionRef: transactionRef,
      );
    } catch (e) {
      debugPrint('Payment settlement cloud update handled: $e');
    }
  }

  // Restock inventory
  Future<void> restockMenuItem(String itemId, int qty) async {
    final itemIndex = _menuItems.indexWhere((i) => i.id == itemId);
    if (itemIndex >= 0) {
      _menuItems[itemIndex] = _menuItems[itemIndex].copyWith(
        stockQuantity: _menuItems[itemIndex].stockQuantity + qty,
        isAvailable: true,
      );
      notifyListeners();
    }
    try {
      await _service.restockMenuItem(itemId, qty);
    } catch (e) {
      debugPrint('Restock cloud update handled: $e');
    }
  }

  // Day Close (Z-Report)
  Future<void> performDayClose() async {
    final now = DateTime.now();
    final breakdown = paymentChannelBreakdown;
    final report = DailySalesReport(
      reportId: 'REP-${now.year}${now.month}${now.day}',
      date: '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
      openedAt: now.subtract(const Duration(hours: 12)),
      closedAt: now,
      isClosed: true,
      totalOrders: _orders.length,
      paidOrders: paidOrders.length,
      grossSales: grossSalesToday,
      totalDiscounts: totalDiscountsToday,
      totalVat: vatCollectedToday,
      netSales: netRevenueToday,
      cashTotal: breakdown['Cash'] ?? 0.0,
      fonepayTotal: breakdown['Fonepay'] ?? 0.0,
      esewaTotal: breakdown['eSewa'] ?? 0.0,
      khaltiTotal: breakdown['Khalti'] ?? 0.0,
      cardTotal: breakdown['Card'] ?? 0.0,
    );
    try {
      await _service.closeDailyShift(report);
    } catch (e) {
      debugPrint('Shift close cloud update handled: $e');
    }
    notifyListeners();
  }
}
