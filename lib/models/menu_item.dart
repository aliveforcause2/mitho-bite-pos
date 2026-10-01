// lib/models/menu_item.dart
class MenuItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final double costPrice;
  final String? description;
  final String? imageUrl;
  final bool isAvailable;
  final bool isVeg;
  final bool isVegan;
  final bool isBestseller;
  final int spicyLevel; // 0: None, 1: Mild, 2: Medium, 3: Hot
  final int prepTimeMinutes;
  final double rating;

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.costPrice = 0.0,
    this.description,
    this.imageUrl,
    this.isAvailable = true,
    this.isVeg = false,
    this.isVegan = false,
    this.isBestseller = false,
    this.spicyLevel = 0,
    this.prepTimeMinutes = 12,
    this.rating = 4.8,
  });

  factory MenuItem.fromMap(Map<String, dynamic> map, {String? docId}) {
    return MenuItem(
      id: docId ?? map['id'] ?? '',
      name: map['name'] ?? '',
      category: map['category'] ?? 'General',
      price: (map['price'] is num) ? (map['price'] as num).toDouble() : 0.0,
      costPrice: (map['costPrice'] is num) ? (map['costPrice'] as num).toDouble() : 0.0,
      description: map['description'],
      imageUrl: map['imageUrl'],
      isAvailable: map['isAvailable'] ?? true,
      isVeg: map['isVeg'] ?? false,
      isVegan: map['isVegan'] ?? false,
      isBestseller: map['isBestseller'] ?? false,
      spicyLevel: (map['spicyLevel'] is num) ? (map['spicyLevel'] as num).toInt() : 0,
      prepTimeMinutes: (map['prepTimeMinutes'] is num) ? (map['prepTimeMinutes'] as num).toInt() : 12,
      rating: (map['rating'] is num) ? (map['rating'] as num).toDouble() : 4.8,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'costPrice': costPrice,
      'description': description,
      'imageUrl': imageUrl,
      'isAvailable': isAvailable,
      'isVeg': isVeg,
      'isVegan': isVegan,
      'isBestseller': isBestseller,
      'spicyLevel': spicyLevel,
      'prepTimeMinutes': prepTimeMinutes,
      'rating': rating,
    };
  }

  MenuItem copyWith({
    String? id,
    String? name,
    String? category,
    double? price,
    double? costPrice,
    String? description,
    String? imageUrl,
    bool? isAvailable,
    bool? isVeg,
    bool? isVegan,
    bool? isBestseller,
    int? spicyLevel,
    int? prepTimeMinutes,
    double? rating,
  }) {
    return MenuItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      costPrice: costPrice ?? this.costPrice,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      isAvailable: isAvailable ?? this.isAvailable,
      isVeg: isVeg ?? this.isVeg,
      isVegan: isVegan ?? this.isVegan,
      isBestseller: isBestseller ?? this.isBestseller,
      spicyLevel: spicyLevel ?? this.spicyLevel,
      prepTimeMinutes: prepTimeMinutes ?? this.prepTimeMinutes,
      rating: rating ?? this.rating,
    );
  }
}
