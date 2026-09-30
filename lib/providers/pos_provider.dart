// lib/providers/pos_provider.dart

import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/daily_sales_report.dart';
import '../services/pos_firestore_service.dart';

class PosProvider extends ChangeNotifier {
  final PosFirestoreService _service = PosFirestoreService();

  List<TableModel> _tables = [];
  List<MenuItem> _menuItems = [];
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

  // Stream Initialization
  void initFirestoreStreams() {
    _service.streamTables().listen((data) {
      _tables = data;
      notifyListeners();
    });

    _service.streamMenuItems().listen((data) {
      _menuItems = data;
      notifyListeners();
    });

    _service.streamOrders().listen((data) {
      _orders = data;
      notifyListeners();
    });
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
      if (_cart[index].quantity >= item.stockQuantity) return; // Do not exceed available inventory
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

  // Dispatch to Kitchen (Firestore batch)
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

      await _service.placeOrderAndUpdateTable(newOrder);

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
    await _service.updateOrderStatus(orderId, status);
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
    await _service.completePaymentAndFreeTable(
      orderId: orderId,
      tableNumber: tableNumber,
      finalTotal: finalTotal,
      discountPercent: discountPercent,
      paymentMethod: paymentMethod,
      transactionRef: transactionRef,
    );
  }

  // Restock inventory
  Future<void> restockMenuItem(String itemId, int qty) async {
    await _service.restockMenuItem(itemId, qty);
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

    await _service.closeDailyShift(report);
    notifyListeners();
  }
}
