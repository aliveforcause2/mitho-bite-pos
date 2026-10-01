// lib/models/table_model.dart
enum TableStatus { available, occupied, reserved }

class TableModel {
  final String? id;
  final int tableNumber;
  final String roomSection;
  final int seatingCapacity;
  final TableStatus status;
  final String? currentOrderId;
  final String? occupiedSince;
  final String? reservedForName;
  final String? reservedForPhone;
  final String? reservedTime;

  TableModel({
    this.id,
    required this.tableNumber,
    this.roomSection = 'Main Hall',
    required this.seatingCapacity,
    required this.status,
    this.currentOrderId,
    this.occupiedSince,
    this.reservedForName,
    this.reservedForPhone,
    this.reservedTime,
  });

  bool get isAvailable => status == TableStatus.available;
  bool get isOccupied => status == TableStatus.occupied;
  bool get isReserved => status == TableStatus.reserved;

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
      id: docId ?? map['id'],
      tableNumber: parsedNumber,
      roomSection: map['roomSection'] ?? 'Main Hall',
      seatingCapacity: map['seatingCapacity'] ?? 4,
      status: parsedStatus,
      currentOrderId: map['currentOrderId'],
      occupiedSince: map['occupiedSince'],
      reservedForName: map['reservedForName'],
      reservedForPhone: map['reservedForPhone'],
      reservedTime: map['reservedTime'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'tableNumber': tableNumber,
      'roomSection': roomSection,
      'seatingCapacity': seatingCapacity,
      'status': status.name,
      'currentOrderId': currentOrderId,
      'occupiedSince': occupiedSince,
      'reservedForName': reservedForName,
      'reservedForPhone': reservedForPhone,
      'reservedTime': reservedTime,
    };
  }

  TableModel copyWith({
    String? id,
    int? tableNumber,
    String? roomSection,
    int? seatingCapacity,
    TableStatus? status,
    String? currentOrderId,
    String? occupiedSince,
    String? reservedForName,
    String? reservedForPhone,
    String? reservedTime,
  }) {
    return TableModel(
      id: id ?? this.id,
      tableNumber: tableNumber ?? this.tableNumber,
      roomSection: roomSection ?? this.roomSection,
      seatingCapacity: seatingCapacity ?? this.seatingCapacity,
      status: status ?? this.status,
      currentOrderId: currentOrderId ?? this.currentOrderId,
      occupiedSince: occupiedSince ?? this.occupiedSince,
      reservedForName: reservedForName ?? this.reservedForName,
      reservedForPhone: reservedForPhone ?? this.reservedForPhone,
      reservedTime: reservedTime ?? this.reservedTime,
    );
  }
}
