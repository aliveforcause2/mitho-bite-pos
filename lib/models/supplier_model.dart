// lib/models/supplier_model.dart

class SupplierModel {
  final String id;
  final String name;
  final String contactPerson;
  final String phone;
  final String address;
  final String category; // e.g. 'Dairy & Milk', 'Meat & Poultry', 'Vegetables', 'Beverages', 'Grocery'
  final double outstandingBalance;

  SupplierModel({
    required this.id,
    required this.name,
    required this.contactPerson,
    required this.phone,
    required this.address,
    required this.category,
    this.outstandingBalance = 0.0,
  });

  factory SupplierModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    return SupplierModel(
      id: docId ?? map['id'] ?? '',
      name: map['name'] ?? '',
      contactPerson: map['contactPerson'] ?? '',
      phone: map['phone'] ?? '',
      address: map['address'] ?? '',
      category: map['category'] ?? 'Grocery',
      outstandingBalance: (map['outstandingBalance'] is num) ? (map['outstandingBalance'] as num).toDouble() : 0.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'contactPerson': contactPerson,
      'phone': phone,
      'address': address,
      'category': category,
      'outstandingBalance': outstandingBalance,
    };
  }
}

class PurchaseEntry {
  final String id;
  final String supplierName;
  final String itemName;
  final int quantity;
  final String unit; // kg, liter, packets, pcs
  final double rate;
  final double totalAmount;
  final String invoiceNumber;
  final DateTime date;
  final String paymentStatus; // 'Paid', 'Pending', 'Partial'

  PurchaseEntry({
    required this.id,
    required this.supplierName,
    required this.itemName,
    required this.quantity,
    this.unit = 'kg',
    required this.rate,
    required this.totalAmount,
    required this.invoiceNumber,
    required this.date,
    this.paymentStatus = 'Paid',
  });

  factory PurchaseEntry.fromMap(Map<String, dynamic> map, {String? docId}) {
    return PurchaseEntry(
      id: docId ?? map['id'] ?? '',
      supplierName: map['supplierName'] ?? '',
      itemName: map['itemName'] ?? '',
      quantity: (map['quantity'] is num) ? (map['quantity'] as num).toInt() : 1,
      unit: map['unit'] ?? 'kg',
      rate: (map['rate'] is num) ? (map['rate'] as num).toDouble() : 0.0,
      totalAmount: (map['totalAmount'] is num) ? (map['totalAmount'] as num).toDouble() : 0.0,
      invoiceNumber: map['invoiceNumber'] ?? '',
      date: map['date'] != null ? DateTime.tryParse(map['date']) ?? DateTime.now() : DateTime.now(),
      paymentStatus: map['paymentStatus'] ?? 'Paid',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'supplierName': supplierName,
      'itemName': itemName,
      'quantity': quantity,
      'unit': unit,
      'rate': rate,
      'totalAmount': totalAmount,
      'invoiceNumber': invoiceNumber,
      'date': date.toIso8601String(),
      'paymentStatus': paymentStatus,
    };
  }
}
