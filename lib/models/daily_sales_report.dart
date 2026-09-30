// lib/models/daily_sales_report.dart

class DailySalesReport {
  final String reportId;
  final String date;
  final DateTime openedAt;
  final DateTime? closedAt;
  final bool isClosed;
  final int totalOrders;
  final int paidOrders;
  final double grossSales;
  final double totalDiscounts;
  final double totalVat;
  final double netSales;
  final double cashTotal;
  final double fonepayTotal;
  final double esewaTotal;
  final double khaltiTotal;
  final double cardTotal;
  final String settledBy;

  DailySalesReport({
    required this.reportId,
    required this.date,
    required this.openedAt,
    this.closedAt,
    this.isClosed = false,
    required this.totalOrders,
    required this.paidOrders,
    required this.grossSales,
    required this.totalDiscounts,
    required this.totalVat,
    required this.netSales,
    required this.cashTotal,
    required this.fonepayTotal,
    required this.esewaTotal,
    required this.khaltiTotal,
    required this.cardTotal,
    this.settledBy = 'Duty Manager',
  });

  factory DailySalesReport.fromMap(Map<String, dynamic> map, {String? docId}) {
    return DailySalesReport(
      reportId: docId ?? map['reportId'] ?? '',
      date: map['date'] ?? '',
      openedAt: map['openedAt'] != null ? DateTime.parse(map['openedAt']) : DateTime.now(),
      closedAt: map['closedAt'] != null ? DateTime.parse(map['closedAt']) : null,
      isClosed: map['isClosed'] ?? false,
      totalOrders: map['totalOrders'] ?? 0,
      paidOrders: map['paidOrders'] ?? 0,
      grossSales: (map['grossSales'] is num) ? (map['grossSales'] as num).toDouble() : 0.0,
      totalDiscounts: (map['totalDiscounts'] is num) ? (map['totalDiscounts'] as num).toDouble() : 0.0,
      totalVat: (map['totalVat'] is num) ? (map['totalVat'] as num).toDouble() : 0.0,
      netSales: (map['netSales'] is num) ? (map['netSales'] as num).toDouble() : 0.0,
      cashTotal: (map['cashTotal'] is num) ? (map['cashTotal'] as num).toDouble() : 0.0,
      fonepayTotal: (map['fonepayTotal'] is num) ? (map['fonepayTotal'] as num).toDouble() : 0.0,
      esewaTotal: (map['esewaTotal'] is num) ? (map['esewaTotal'] as num).toDouble() : 0.0,
      khaltiTotal: (map['khaltiTotal'] is num) ? (map['khaltiTotal'] as num).toDouble() : 0.0,
      cardTotal: (map['cardTotal'] is num) ? (map['cardTotal'] as num).toDouble() : 0.0,
      settledBy: map['settledBy'] ?? 'Shift Manager',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'reportId': reportId,
      'date': date,
      'openedAt': openedAt.toIso8601String(),
      'closedAt': closedAt?.toIso8601String(),
      'isClosed': isClosed,
      'totalOrders': totalOrders,
      'paidOrders': paidOrders,
      'grossSales': grossSales,
      'totalDiscounts': totalDiscounts,
      'totalVat': totalVat,
      'netSales': netSales,
      'cashTotal': cashTotal,
      'fonepayTotal': fonepayTotal,
      'esewaTotal': esewaTotal,
      'khaltiTotal': khaltiTotal,
      'cardTotal': cardTotal,
      'settledBy': settledBy,
    };
  }
}
