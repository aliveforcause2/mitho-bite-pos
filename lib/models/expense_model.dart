// lib/models/expense_model.dart
class ExpenseModel {
  final String id;
  final String title;
  final String category;
  final double amount;
  final String paymentMethod;
  final DateTime date;
  final String? note;

  ExpenseModel({
    required this.id,
    String? title,
    String? expenseTitle,
    required this.category,
    required this.amount,
    required this.paymentMethod,
    DateTime? date,
    dynamic rawDate,
    this.note,
  })  : title = title ?? expenseTitle ?? 'General Expense',
        date = date ?? DateTime.now();

  String get expenseTitle => title;

  factory ExpenseModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    return ExpenseModel(
      id: docId ?? map['id'] ?? '',
      title: map['title'] ?? map['expenseTitle'] ?? '',
      category: map['category'] ?? 'Miscellaneous',
      amount: (map['amount'] is num) ? (map['amount'] as num).toDouble() : 0.0,
      paymentMethod: map['paymentMethod'] ?? 'Cash',
      date: map['date'] != null ? DateTime.tryParse(map['date'].toString()) ?? DateTime.now() : DateTime.now(),
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
