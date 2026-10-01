// lib/providers/pos_provider.dart
import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/daily_sales_report.dart';
import '../services/pos_firestore_service.dart';

class PosProvider extends ChangeNotifier {
  final PosFirestoreService _service = PosFirestoreService();

  List<TableModel> _tables = List.generate(
    10,
    (i) => TableModel(tableNumber: i + 1, seatingCapacity: 4, status: TableStatus.available),
  );

  List<MenuItem> _menuItems = [
    MenuItem(id: 'item_1', name: 'Chicken MoMo (10pcs)', category: 'MoMo', price: 250.0, isVeg: false, spicyLevel: 2, description: 'Juicy steamed chicken dumplings with spicy achar'),
    MenuItem(id: 'item_2', name: 'Veg MoMo (10pcs)', category: 'MoMo', price: 200.0, isVeg: true, spicyLevel: 1, description: 'Delicious vegetable dumplings'),
    MenuItem(id: 'item_3', name: 'Buff C.MoMo', category: 'MoMo', price: 320.0, isVeg: false, spicyLevel: 3, description: 'Spicy chili buffalo dumplings'),
    MenuItem(id: 'item_4', name: 'Chicken Chowmein', category: 'Noodles', price: 220.0, isVeg: false, spicyLevel: 2, description: 'Stir-fried noodles with chicken & fresh vegetables'),
    MenuItem(id: 'item_5', name: 'Veg Chowmein', category: 'Noodles', price: 170.0, isVeg: true, spicyLevel: 1, description: 'Classic vegetable stir-fried noodles'),
    MenuItem(id: 'item_6', name: 'Thukpa (Chicken)', category: 'Soup', price: 240.0, isVeg: false, spicyLevel: 2, description: 'Himalayan noodle soup with chicken'),
    MenuItem(id: 'item_7', name: 'Chicken Biryani', category: 'Rice', price: 380.0, isVeg: false, spicyLevel: 2, description: 'Fragrant basmati rice cooked with spiced chicken'),
    MenuItem(id: 'item_8', name: 'Cold Drink (Coca-Cola 500ml)', category: 'Beverages', price: 100.0, isVeg: true, spicyLevel: 0, description: 'Chilled soft drink'),
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
  List<OrderModel> get activeOrders => _orders.where((o) => o.status != OrderStatus.paid && o.status != OrderStatus.cancelled).toList();
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

  // Stream Initialization with Robust Fallback
  void initFirestoreStreams() {
    try {
      _service.streamTables().listen((data) {
        if (data.isNotEmpty) {
          _tables = data;
          notifyListeners();
        }
      }, onError: (e) {
        debugPrint('Tables stream error (using local fallback): $e');
      });

      _service.streamMenuItems().listen((data) {
        if (data.isNotEmpty) {
          _menuItems = data;
          notifyListeners();
        }
      }, onError: (e) {
        debugPrint('MenuItems stream error (using local fallback): $e');
      });

      _service.streamOrders().listen((data) {
        _orders = data;
        notifyListeners();
      }, onError: (e) {
        debugPrint('Orders stream error: $e');
      });
    } catch (e) {
      debugPrint('Firestore streams initialization error: $e');
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

  // Dispatch to Kitchen (Firestore batch with offline catch)
  Future<bool> sendOrderToKitchen() async {
    if (_selectedTable == null || _cart.isEmpty) return false;
    _isLoading = true;
    notifyListeners();
    try {
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
      final tIndex = _tables.indexWhere((t) => t.tableNumber == _selectedTable!.tableNumber);
      if (tIndex >= 0) {
        _tables[tIndex] = _tables[tIndex].copyWith(status: TableStatus.occupied, currentOrderId: orderId);
      }

      try {
        await _service.placeOrderAndUpdateTable(newOrder);
      } catch (e) {
        debugPrint('Firestore write offline mode: $e');
      }

      _cart.clear();
      _kitchenNote = '';
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update Status in KDS
  Future<void> updateOrderStatus(String orderId, OrderStatus status) async {
    final idx = _orders.indexWhere((o) => o.orderId == orderId);
    if (idx >= 0) {
      _orders[idx] = _orders[idx].copyWith(status: status);
      notifyListeners();
    }
    try {
      await _service.updateOrderStatus(orderId, status);
    } catch (e) {
      debugPrint('Update order status offline: $e');
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
    final idx = _orders.indexWhere((o) => o.orderId == orderId);
    if (idx >= 0) {
      _orders[idx] = _orders[idx].copyWith(
        status: OrderStatus.paid,
        totalAmount: finalTotal,
        discountPercent: discountPercent,
        paymentMethod: paymentMethod,
        transactionRef: transactionRef ?? 'TXN-${DateTime.now().millisecondsSinceEpoch}',
        settledAt: DateTime.now(),
      );
    }
    final tIndex = _tables.indexWhere((t) => t.tableNumber == tableNumber);
    if (tIndex >= 0) {
      _tables[tIndex] = _tables[tIndex].copyWith(status: TableStatus.available, currentOrderId: null);
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
      debugPrint('Complete payment offline: $e');
    }
  }

  // Restock inventory
  Future<void> restockMenuItem(String itemId, int qty) async {
    final idx = _menuItems.indexWhere((m) => m.id == itemId);
    if (idx >= 0) {
      _menuItems[idx] = _menuItems[idx].copyWith(stockQuantity: _menuItems[idx].stockQuantity + qty, isAvailable: true);
      notifyListeners();
    }
    try {
      await _service.restockMenuItem(itemId, qty);
    } catch (e) {
      debugPrint('Restock offline: $e');
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
      debugPrint('Day close offline: $e');
    }
    notifyListeners();
  }
}
