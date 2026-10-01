// lib/models/table_model.dart

enum TableStatus { available, occupied, reserved }

class TableModel {
  final int tableNumber;
  final int seatingCapacity;
  final TableStatus status;
  final String? currentOrderId;
  final String? occupiedSince;

  TableModel({
    required this.tableNumber,
    required this.seatingCapacity,
    required this.status,
    this.currentOrderId,
    this.occupiedSince,
  });

  bool get isAvailable => status == TableStatus.available;
  bool get isOccupied => status == TableStatus.occupied;

  factory TableModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    int parsedNumber = map['tableNumber'] ?? 1;
    if (docId != null && map['tableNumber'] == null) {
      parsedNumber = int.tryParse(docId.replaceAll(RegExp(r'[^0-9]'), '')) ?? 1;
    }

    TableStatus parsedStatus = TableStatus.available;
    final statusStr = (map['status'] ?? '').toString().toLowerCase();
    if (statusStr == 'occupied') {
      parsedStatus = TableStatus.occupied;
    } else if (statusStr == 'reserved') {
      parsedStatus = TableStatus.reserved;
    }

    return TableModel(
      tableNumber: parsedNumber,
      seatingCapacity: map['seatingCapacity'] ?? 4,
      status: parsedStatus,
      currentOrderId: map['currentOrderId'],
      occupiedSince: map['occupiedSince'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'tableNumber': tableNumber,
      'seatingCapacity': seatingCapacity,
      'status': status.name,
      'currentOrderId': currentOrderId,
      'occupiedSince': occupiedSince,
    };
  }

  TableModel copyWith({
    int? tableNumber,
    int? seatingCapacity,
    TableStatus? status,
    String? currentOrderId,
    String? occupiedSince,
  }) {
    return TableModel(
      tableNumber: tableNumber ?? this.tableNumber,
      seatingCapacity: seatingCapacity ?? this.seatingCapacity,
      status: status ?? this.status,
      currentOrderId: currentOrderId ?? this.currentOrderId,
      occupiedSince: occupiedSince ?? this.occupiedSince,
    );
  }
}
