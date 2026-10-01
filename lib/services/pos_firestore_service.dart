// lib/services/pos_firestore_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/daily_sales_report.dart';

class PosFirestoreService {
  // Lazy access to Firestore instance
  FirebaseFirestore? _instance;
  FirebaseFirestore? get _firestore {
    try {
      _instance ??= FirebaseFirestore.instance;
      return _instance;
    } catch (e) {
      debugPrint('Firestore instance not available: $e');
      return null;
    }
  }

  // Collection References
  CollectionReference? get _menuItemsRef => _firestore?.collection('menu_items');
  CollectionReference? get _tablesRef => _firestore?.collection('tables');
  CollectionReference? get _ordersRef => _firestore?.collection('orders');
  CollectionReference? get _salesReportsRef => _firestore?.collection('daily_sales_reports');

  // 1. Stream of Menu Items (real-time stock & availability)
  Stream<List<MenuItem>> streamMenuItems() {
    final ref = _menuItemsRef;
    if (ref == null) return const Stream.empty();
    return ref.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return MenuItem.fromMap(doc.data() as Map<String, dynamic>, docId: doc.id);
      }).toList();
    }).handleError((e) {
      debugPrint('Error streaming menu items: $e');
    });
  }

  // 2. Stream of Tables
  Stream<List<TableModel>> streamTables() {
    final ref = _tablesRef;
    if (ref == null) return const Stream.empty();
    return ref.orderBy('tableNumber').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return TableModel.fromMap(doc.data() as Map<String, dynamic>, docId: doc.id);
      }).toList();
    }).handleError((e) {
      debugPrint('Error streaming tables: $e');
    });
  }

  // 3. Stream of Orders
  Stream<List<OrderModel>> streamOrders() {
    final ref = _ordersRef;
    if (ref == null) return const Stream.empty();
    return ref.orderBy('timestamp', descending: true).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return OrderModel.fromMap(doc.data() as Map<String, dynamic>, docId: doc.id);
      }).toList();
    }).handleError((e) {
      debugPrint('Error streaming orders: $e');
    });
  }

  // 4. Atomic Multi-Document Transaction: Place Order, Occupy Table & Deduct Stock
  Future<void> placeOrderAndUpdateTable(OrderModel order) async {
    final firestore = _firestore;
    final ordersRef = _ordersRef;
    final tablesRef = _tablesRef;
    final menuItemsRef = _menuItemsRef;
    if (firestore == null || ordersRef == null || tablesRef == null || menuItemsRef == null) {
      return;
    }

    final batch = firestore.batch();
    // A. Create Order Document
    final orderDocRef = ordersRef.doc(order.orderId);
    batch.set(orderDocRef, order.toMap());

    // B. Update Table Status to 'occupied'
    final tableDocRef = tablesRef.doc('table_${order.tableNumber}');
    batch.update(tableDocRef, {
      'status': 'occupied',
      'currentOrderId': order.orderId,
      'occupiedSince': DateTime.now().toIso8601String(),
    });

    // C. Deduct Stock Quantities in Real-Time
    for (final item in order.itemsList) {
      final itemDocRef = menuItemsRef.doc(item.menuItemId);
      batch.update(itemDocRef, {
        'stockQuantity': FieldValue.increment(-item.quantity),
      });
    }

    await batch.commit();
  }

  // 5. Update Order Status (KDS: pending -> preparing -> served)
  Future<void> updateOrderStatus(String orderId, OrderStatus status) async {
    final ordersRef = _ordersRef;
    if (ordersRef == null) return;
    await ordersRef.doc(orderId).update({'status': status.name});
  }

  // 6. Complete Payment & Free Table
  Future<void> completePaymentAndFreeTable({
    required String orderId,
    required int tableNumber,
    required double finalTotal,
    required double discountPercent,
    required String paymentMethod,
    String? transactionRef,
  }) async {
    final firestore = _firestore;
    final ordersRef = _ordersRef;
    final tablesRef = _tablesRef;
    if (firestore == null || ordersRef == null || tablesRef == null) return;

    final batch = firestore.batch();
    // A. Mark Order as Paid
    final orderDocRef = ordersRef.doc(orderId);
    batch.update(orderDocRef, {
      'status': 'paid',
      'totalAmount': finalTotal,
      'discountPercent': discountPercent,
      'paymentMethod': paymentMethod,
      'transactionRef': transactionRef ?? 'TXN-${DateTime.now().millisecondsSinceEpoch}',
      'settledAt': DateTime.now().toIso8601String(),
    });

    // B. Set Table Status to 'available'
    final tableDocRef = tablesRef.doc('table_$tableNumber');
    batch.update(tableDocRef, {
      'status': 'available',
      'currentOrderId': null,
      'occupiedSince': null,
    });

    await batch.commit();
  }

  // 7. Quick Restock Inventory
  Future<void> restockMenuItem(String itemId, int addedQty) async {
    final menuItemsRef = _menuItemsRef;
    if (menuItemsRef == null) return;
    await menuItemsRef.doc(itemId).update({
      'stockQuantity': FieldValue.increment(addedQty),
      'isAvailable': true,
    });
  }

  // 8. Shift Settlement / Day Close (Z-Report)
  Future<void> closeDailyShift(DailySalesReport report) async {
    final salesReportsRef = _salesReportsRef;
    if (salesReportsRef == null) return;
    await salesReportsRef.doc(report.reportId).set(report.toMap());
  }
}
