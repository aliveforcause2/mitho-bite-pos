// lib/models/expense_model.dart

class ExpenseModel {
  final String id;
  final String title;
  final String category; // 'Rent', 'Staff Salary', 'Electricity & Water', 'LPG Gas Cylinder', 'Maintenance', 'Marketing', 'Miscellaneous'
  final double amount;
  final String paymentMethod; // 'Cash', 'Bank Transfer', 'eSewa', 'Khalti'
  final DateTime date;
  final String? note;

  ExpenseModel({
    required this.id,
    required this.title,
    required this.category,
    required this.amount,
    required this.paymentMethod,
    required this.date,
    this.note,
  });

  factory ExpenseModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    return ExpenseModel(
      id: docId ?? map['id'] ?? '',
      title: map['title'] ?? '',
      category: map['category'] ?? 'Miscellaneous',
      amount: (map['amount'] is num) ? (map['amount'] as num).toDouble() : 0.0,
      paymentMethod: map['paymentMethod'] ?? 'Cash',
      date: map['date'] != null ? DateTime.tryParse(map['date']) ?? DateTime.now() : DateTime.now(),
      note: map['note'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'amount': amount,
      'paymentMethod': paymentMethod,
      'date': date.toIso8601String(),
      'note': note,
    };
  }
}
