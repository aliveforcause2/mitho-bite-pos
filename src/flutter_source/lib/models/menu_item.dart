// lib/models/menu_item.dart

class MenuItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final bool isAvailable;
  final int stockQuantity;
  final int lowStockThreshold;
  final String? description;
  final bool isVeg;
  final int spicyLevel;

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.isAvailable = true,
    this.stockQuantity = 25,
    this.lowStockThreshold = 5,
    this.description,
    this.isVeg = false,
    this.spicyLevel = 1,
  });

  bool get isLowStock => stockQuantity <= lowStockThreshold && stockQuantity > 0;
  bool get isOutOfStock => stockQuantity <= 0;

  factory MenuItem.fromMap(Map<String, dynamic> map, {String? docId}) {
    return MenuItem(
      id: docId ?? map['id'] ?? '',
      name: map['name'] ?? 'Unnamed Dish',
      category: map['category'] ?? 'General',
      price: (map['price'] is num) ? (map['price'] as num).toDouble() : 0.0,
      isAvailable: map['isAvailable'] ?? true,
      stockQuantity: map['stockQuantity'] is int ? map['stockQuantity'] as int : 25,
      lowStockThreshold: map['lowStockThreshold'] is int ? map['lowStockThreshold'] as int : 5,
      description: map['description'],
      isVeg: map['isVeg'] ?? false,
      spicyLevel: map['spicyLevel'] is int ? map['spicyLevel'] as int : 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'isAvailable': isAvailable,
      'stockQuantity': stockQuantity,
      'lowStockThreshold': lowStockThreshold,
      'description': description,
      'isVeg': isVeg,
      'spicyLevel': spicyLevel,
    };
  }

  MenuItem copyWith({
    String? id,
    String? name,
    String? category,
    double? price,
    bool? isAvailable,
    int? stockQuantity,
    int? lowStockThreshold,
    String? description,
    bool? isVeg,
    int? spicyLevel,
  }) {
    return MenuItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      isAvailable: isAvailable ?? this.isAvailable,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      lowStockThreshold: lowStockThreshold ?? this.lowStockThreshold,
      description: description ?? this.description,
      isVeg: isVeg ?? this.isVeg,
      spicyLevel: spicyLevel ?? this.spicyLevel,
    );
  }
}
