// lib/models/order_model.dart
enum OrderStatus { pending, preparing, served, paid, cancelled }

class OrderItem {
  final String menuItemId;
  final String name;
  final int quantity;
  final double price;
  final String? specialInstructions;

  OrderItem({
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.price,
    this.specialInstructions,
  });

  double get lineTotal => quantity * price;

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      menuItemId: map['menuItemId'] ?? '',
      name: map['name'] ?? '',
      quantity: (map['quantity'] is num) ? (map['quantity'] as num).toInt() : 1,
      price: (map['price'] is num) ? (map['price'] as num).toDouble() : 0.0,
      specialInstructions: map['specialInstructions'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'menuItemId': menuItemId,
      'name': name,
      'quantity': quantity,
      'price': price,
      if (specialInstructions != null) 'specialInstructions': specialInstructions,
    };
  }

  OrderItem copyWith({
    String? menuItemId,
    String? name,
    int? quantity,
    double? price,
    String? specialInstructions,
  }) {
    return OrderItem(
      menuItemId: menuItemId ?? this.menuItemId,
      name: name ?? this.name,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }
}

class OrderModel {
  final String orderId;
  final int tableNumber;
  final List<OrderItem> itemsList;
  final double subtotal;
  final double taxAmount;
  final double totalAmount;
  final double discountPercent;
  final double discountAmount;
  final OrderStatus status;
  final DateTime timestamp;
  final String? kitchenNote;
  final String? serverName;
  final String? paymentMethod;
  final String? transactionRef;
  final String? settledAt;

  OrderModel({
    required this.orderId,
    required this.tableNumber,
    required this.itemsList,
    required this.subtotal,
    required this.taxAmount,
    required this.totalAmount,
    this.discountPercent = 0.0,
    this.discountAmount = 0.0,
    required this.status,
    required this.timestamp,
    this.kitchenNote,
    this.serverName,
    this.paymentMethod,
    this.transactionRef,
    this.settledAt,
  });

  factory OrderModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    final rawItems = map['itemsList'] as List<dynamic>? ?? [];
    final parsedItems = rawItems
        .map((item) => OrderItem.fromMap(Map<String, dynamic>.from(item)))
        .toList();

    DateTime parsedTimestamp = DateTime.now();
    if (map['timestamp'] != null) {
      if (map['timestamp'] is String) {
        parsedTimestamp = DateTime.tryParse(map['timestamp']) ?? DateTime.now();
      }
    }

    OrderStatus parsedStatus = OrderStatus.pending;
    final statusStr = (map['status'] ?? '').toString().toLowerCase();
    switch (statusStr) {
      case 'preparing':
        parsedStatus = OrderStatus.preparing;
        break;
      case 'served':
        parsedStatus = OrderStatus.served;
        break;
      case 'paid':
        parsedStatus = OrderStatus.paid;
        break;
      case 'cancelled':
        parsedStatus = OrderStatus.cancelled;
        break;
      default:
        parsedStatus = OrderStatus.pending;
    }

    return OrderModel(
      orderId: docId ?? map['orderId'] ?? '',
      tableNumber: map['tableNumber'] ?? 1,
      itemsList: parsedItems,
      subtotal: (map['subtotal'] is num) ? (map['subtotal'] as num).toDouble() : 0.0,
      taxAmount: (map['taxAmount'] is num) ? (map['taxAmount'] as num).toDouble() : 0.0,
      totalAmount: (map['totalAmount'] is num) ? (map['totalAmount'] as num).toDouble() : 0.0,
      discountPercent: (map['discountPercent'] is num) ? (map['discountPercent'] as num).toDouble() : 0.0,
      discountAmount: (map['discountAmount'] is num) ? (map['discountAmount'] as num).toDouble() : 0.0,
      status: parsedStatus,
      timestamp: parsedTimestamp,
      kitchenNote: map['kitchenNote'],
      serverName: map['serverName'],
      paymentMethod: map['paymentMethod'],
      transactionRef: map['transactionRef'],
      settledAt: map['settledAt'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'orderId': orderId,
      'tableNumber': tableNumber,
      'itemsList': itemsList.map((i) => i.toMap()).toList(),
      'subtotal': subtotal,
      'taxAmount': taxAmount,
      'totalAmount': totalAmount,
      'discountPercent': discountPercent,
      'discountAmount': discountAmount,
      'status': status.name,
      'timestamp': timestamp.toIso8601String(),
      'kitchenNote': kitchenNote,
      'serverName': serverName,
      'paymentMethod': paymentMethod,
      'transactionRef': transactionRef,
      'settledAt': settledAt,
    };
  }

  OrderModel copyWith({
    String? orderId,
    int? tableNumber,
    List<OrderItem>? itemsList,
    double? subtotal,
    double? taxAmount,
    double? totalAmount,
    double? discountPercent,
    double? discountAmount,
    OrderStatus? status,
    DateTime? timestamp,
    String? kitchenNote,
    String? serverName,
    String? paymentMethod,
    String? transactionRef,
    String? settledAt,
  }) {
    return OrderModel(
      orderId: orderId ?? this.orderId,
      tableNumber: tableNumber ?? this.tableNumber,
      itemsList: itemsList ?? this.itemsList,
      subtotal: subtotal ?? this.subtotal,
      taxAmount: taxAmount ?? this.taxAmount,
      totalAmount: totalAmount ?? this.totalAmount,
      discountPercent: discountPercent ?? this.discountPercent,
      discountAmount: discountAmount ?? this.discountAmount,
      status: status ?? this.status,
      timestamp: timestamp ?? this.timestamp,
      kitchenNote: kitchenNote ?? this.kitchenNote,
      serverName: serverName ?? this.serverName,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      transactionRef: transactionRef ?? this.transactionRef,
      settledAt: settledAt ?? this.settledAt,
    );
  }
}
