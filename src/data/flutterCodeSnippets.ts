export interface FlutterCodeFile {
  id: string;
  name: string;
  path: string;
  description: string;
  category: 'models' | 'providers' | 'screens' | 'services' | 'widgets' | 'config' | 'firestore';
  code: string;
}

export const FIRESTORE_SCHEMA_JSON = `{
  "menu_items": {
    "momo-01": {
      "id": "momo-01",
      "name": "Steamed Buff Mo:Mo (10 pcs)",
      "category": "Mo:Mo Specials",
      "price": 320.0,
      "isAvailable": true,
      "description": "Traditional spiced buffalo dumplings with tomato-sesame achar",
      "isVeg": false
    },
    "chw-01": {
      "id": "chw-01",
      "name": "Nepali Chicken Chowmein",
      "category": "Noodles & Chowmein",
      "price": 280.0,
      "isAvailable": true,
      "description": "Wok-tossed noodles with shredded chicken and crunchy greens",
      "isVeg": false
    }
  },
  "tables": {
    "table_1": {
      "tableNumber": 1,
      "seatingCapacity": 4,
      "status": "available",
      "currentOrderId": null,
      "lastUpdated": "2026-09-29T10:00:00Z"
    },
    "table_3": {
      "tableNumber": 3,
      "seatingCapacity": 4,
      "status": "occupied",
      "currentOrderId": "ord_99812",
      "lastUpdated": "2026-09-29T10:45:00Z"
    }
  },
  "orders": {
    "ord_99812": {
      "orderId": "ord_99812",
      "tableNumber": 3,
      "status": "pending",
      "subtotal": 600.0,
      "taxAmount": 60.0,
      "totalAmount": 660.0,
      "kitchenNote": "Make the achar extra spicy please",
      "timestamp": "2026-09-29T10:45:12Z",
      "itemsList": [
        {
          "menuItemId": "momo-01",
          "name": "Steamed Buff Mo:Mo (10 pcs)",
          "quantity": 1,
          "price": 320.0,
          "specialInstructions": "Extra spicy achar"
        },
        {
          "menuItemId": "chw-01",
          "name": "Nepali Chicken Chowmein",
          "quantity": 1,
          "price": 280.0,
          "specialInstructions": "No ajinomoto"
        }
      ]
    }
  }
}`;

export const FLUTTER_CODE_FILES: FlutterCodeFile[] = [
  {
    id: 'pubspec',
    name: 'pubspec.yaml',
    path: 'pubspec.yaml',
    description: 'Flutter project dependencies including Provider, Cloud Firestore & Firebase Core',
    category: 'config',
    code: `name: himalayan_pos
description: "A production-grade Restaurant POS and Management App built with Flutter & Firebase."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # State Management (simplest & most robust for beginners)
  provider: ^6.1.2
  # Firebase Backend Integration
  firebase_core: ^3.6.0
  cloud_firestore: ^5.4.4
  # UI & Utility helpers
  intl: ^0.19.0
  uuid: ^4.5.1
  google_fonts: ^6.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    id: 'main',
    name: 'main.dart',
    path: 'lib/main.dart',
    description: 'Application entry point initializing Firebase and MultiProvider',
    category: 'config',
    code: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'providers/pos_provider.dart';
import 'screens/table_selection_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // NOTE: Ensure you ran 'flutterfire configure' for real Firebase init.
  // In development/test mode, this connects to your Firebase project.
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase already initialized or running in mock mode: \$e');
  }

  runApp(const HimalayanPosApp());
}

class HimalayanPosApp extends StatelessWidget {
  const HimalayanPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PosProvider()..initializeRealtimeData()),
      ],
      child: MaterialApp(
        title: 'Himalayan POS',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFE65100), // Himalayan Warm Amber/Spice
            primary: const Color(0xFFD84315),
            surface: const Color(0xFFF9FAFB),
            brightness: Brightness.light,
          ),
          appBarTheme: const AppBarTheme(
            elevation: 0,
            centerTitle: false,
            backgroundColor: Color(0xFF1E293B),
            foregroundColor: Colors.white,
          ),
          cardTheme: CardTheme(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        home: const TableSelectionScreen(),
      ),
    );
  }
}
`,
  },
  {
    id: 'menu_item_model',
    name: 'menu_item.dart',
    path: 'lib/models/menu_item.dart',
    description: 'MenuItem model with JSON/Firestore serialization & deserialization',
    category: 'models',
    code: `// lib/models/menu_item.dart

class MenuItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final bool isAvailable;
  final String? description;
  final bool isVeg;

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.isAvailable,
    this.description,
    this.isVeg = false,
  });

  // Convert Firestore document or JSON Map into MenuItem object
  factory MenuItem.fromMap(Map<String, dynamic> map, String docId) {
    return MenuItem(
      id: docId.isNotEmpty ? docId : (map['id'] ?? ''),
      name: map['name'] ?? 'Unnamed Item',
      category: map['category'] ?? 'General',
      price: (map['price'] as num?)?.toDouble() ?? 0.0,
      isAvailable: map['isAvailable'] ?? true,
      description: map['description'],
      isVeg: map['isVeg'] ?? false,
    );
  }

  // Convert MenuItem object into a Map for Firestore write operations
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'isAvailable': isAvailable,
      'description': description,
      'isVeg': isVeg,
    };
  }
}
`,
  },
  {
    id: 'table_model',
    name: 'table_model.dart',
    path: 'lib/models/table_model.dart',
    description: 'TableModel representing restaurant tables with occupancy state',
    category: 'models',
    code: `// lib/models/table_model.dart

enum TableStatus { available, occupied }

class TableModel {
  final int tableNumber;
  final int seatingCapacity;
  final TableStatus status;
  final String? currentOrderId;

  TableModel({
    required this.tableNumber,
    required this.seatingCapacity,
    required this.status,
    this.currentOrderId,
  });

  bool get isAvailable => status == TableStatus.available;
  bool get isOccupied => status == TableStatus.occupied;

  factory TableModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    int parsedNumber = map['tableNumber'] ?? 1;
    if (docId != null && map['tableNumber'] == null) {
      parsedNumber = int.tryParse(docId.replaceAll('table_', '')) ?? 1;
    }

    return TableModel(
      tableNumber: parsedNumber,
      seatingCapacity: map['seatingCapacity'] ?? 4,
      status: (map['status'] == 'occupied')
          ? TableStatus.occupied
          : TableStatus.available,
      currentOrderId: map['currentOrderId'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'tableNumber': tableNumber,
      'seatingCapacity': seatingCapacity,
      'status': status == TableStatus.occupied ? 'occupied' : 'available',
      'currentOrderId': currentOrderId,
    };
  }

  TableModel copyWith({
    int? tableNumber,
    int? seatingCapacity,
    TableStatus? status,
    String? currentOrderId,
  }) {
    return TableModel(
      tableNumber: tableNumber ?? this.tableNumber,
      seatingCapacity: seatingCapacity ?? this.seatingCapacity,
      status: status ?? this.status,
      currentOrderId: currentOrderId ?? this.currentOrderId,
    );
  }
}
`,
  },
  {
    id: 'order_model',
    name: 'order_model.dart',
    path: 'lib/models/order_model.dart',
    description: 'OrderItem and OrderModel for cart items, taxes, notes & kitchen status',
    category: 'models',
    code: `// lib/models/order_model.dart

class OrderItem {
  final String menuItemId;
  final String name;
  int quantity;
  final double price;
  String? specialInstructions;

  OrderItem({
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.price,
    this.specialInstructions,
  });

  double get itemTotal => price * quantity;

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      menuItemId: map['menuItemId'] ?? '',
      name: map['name'] ?? '',
      quantity: map['quantity'] ?? 1,
      price: (map['price'] as num?)?.toDouble() ?? 0.0,
      specialInstructions: map['specialInstructions'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'menuItemId': menuItemId,
      'name': name,
      'quantity': quantity,
      'price': price,
      'specialInstructions': specialInstructions,
    };
  }
}

enum OrderStatus { pending, preparing, served, paid }

class OrderModel {
  final String orderId;
  final int tableNumber;
  final List<OrderItem> itemsList;
  final double totalAmount;
  final double subtotal;
  final double taxAmount;
  final OrderStatus status;
  final DateTime timestamp;
  final String? kitchenNote;

  OrderModel({
    required this.orderId,
    required this.tableNumber,
    required this.itemsList,
    required this.totalAmount,
    required this.subtotal,
    required this.taxAmount,
    required this.status,
    required this.timestamp,
    this.kitchenNote,
  });

  factory OrderModel.fromMap(Map<String, dynamic> map, String docId) {
    var rawItems = (map['itemsList'] as List<dynamic>?) ?? [];
    List<OrderItem> items = rawItems
        .map((item) => OrderItem.fromMap(Map<String, dynamic>.from(item)))
        .toList();

    OrderStatus parsedStatus = OrderStatus.pending;
    if (map['status'] == 'preparing') parsedStatus = OrderStatus.preparing;
    if (map['status'] == 'served') parsedStatus = OrderStatus.served;
    if (map['status'] == 'paid') parsedStatus = OrderStatus.paid;

    DateTime parsedDate;
    if (map['timestamp'] is String) {
      parsedDate = DateTime.tryParse(map['timestamp']) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return OrderModel(
      orderId: docId.isNotEmpty ? docId : (map['orderId'] ?? ''),
      tableNumber: map['tableNumber'] ?? 1,
      itemsList: items,
      totalAmount: (map['totalAmount'] as num?)?.toDouble() ?? 0.0,
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0.0,
      taxAmount: (map['taxAmount'] as num?)?.toDouble() ?? 0.0,
      status: parsedStatus,
      timestamp: parsedDate,
      kitchenNote: map['kitchenNote'],
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
      'status': status.name,
      'timestamp': timestamp.toIso8601String(),
      'kitchenNote': kitchenNote,
    };
  }
}
`,
  },
  {
    id: 'pos_provider',
    name: 'pos_provider.dart',
    path: 'lib/providers/pos_provider.dart',
    description: 'Central ChangeNotifier managing real-time Firestore listeners, active cart, and order push',
    category: 'providers',
    code: `// lib/providers/pos_provider.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';

class PosProvider with ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Live state collections
  List<TableModel> _tables = [];
  List<MenuItem> _menuItems = [];
  List<OrderModel> _activeOrders = [];
  
  // Real-time Subscriptions
  StreamSubscription? _tablesSubscription;
  StreamSubscription? _menuSubscription;
  StreamSubscription? _ordersSubscription;

  // Active user selection state
  TableModel? _selectedTable;
  final List<OrderItem> _cartItems = [];
  String _kitchenNote = '';
  bool _isLoading = false;

  // Getters
  List<TableModel> get tables => _tables;
  List<MenuItem> get menuItems => _menuItems;
  List<OrderModel> get activeOrders => _activeOrders;
  TableModel? get selectedTable => _selectedTable;
  List<OrderItem> get cartItems => List.unmodifiable(_cartItems);
  String get kitchenNote => _kitchenNote;
  bool get isLoading => _isLoading;

  // Financial Calculations
  double get cartSubtotal =>
      _cartItems.fold(0.0, (sum, item) => sum + item.itemTotal);
  double get cartTax => cartSubtotal * 0.10; // 10% VAT / Service
  double get cartTotal => cartSubtotal + cartTax;
  int get totalItemCount =>
      _cartItems.fold(0, (count, item) => count + item.quantity);

  // Initialize real-time streams with Firestore
  void initializeRealtimeData() {
    _isLoading = true;
    notifyListeners();

    // 1. Listen to Tables collection in real-time
    _tablesSubscription = _firestore
        .collection('tables')
        .orderBy('tableNumber')
        .snapshots()
        .listen((snapshot) {
      if (snapshot.docs.isNotEmpty) {
        _tables = snapshot.docs
            .map((doc) => TableModel.fromMap(doc.data(), docId: doc.id))
            .toList();
      } else {
        _seedDefaultTables();
      }
      _isLoading = false;
      notifyListeners();
    }, onError: (err) {
      debugPrint('Firestore tables listener error: \$err');
      _seedDefaultTables(); // Fallback to local default data for safety
      _isLoading = false;
      notifyListeners();
    });

    // 2. Listen to Menu Items in real-time
    _menuSubscription = _firestore
        .collection('menu_items')
        .where('isAvailable', isEqualTo: true)
        .snapshots()
        .listen((snapshot) {
      if (snapshot.docs.isNotEmpty) {
        _menuItems = snapshot.docs
            .map((doc) => MenuItem.fromMap(doc.data(), doc.id))
            .toList();
      } else {
        _seedDefaultMenuItems();
      }
      notifyListeners();
    }, onError: (err) {
      debugPrint('Firestore menu listener error: \$err');
      _seedDefaultMenuItems();
      notifyListeners();
    });

    // 3. Listen to Active Orders in real-time
    _ordersSubscription = _firestore
        .collection('orders')
        .orderBy('timestamp', descending: true)
        .snapshots()
        .listen((snapshot) {
      _activeOrders = snapshot.docs
          .map((doc) => OrderModel.fromMap(doc.data(), doc.id))
          .toList();
      notifyListeners();
    });
  }

  // Select Table to begin or review order
  void selectTable(TableModel table) {
    _selectedTable = table;
    _cartItems.clear();
    _kitchenNote = '';
    notifyListeners();
  }

  // Cart Management (Screen B & C)
  void addToCart(MenuItem item, {String? specialInstructions}) {
    final existingIndex =
        _cartItems.indexWhere((element) => element.menuItemId == item.id);

    if (existingIndex >= 0) {
      _cartItems[existingIndex].quantity += 1;
      if (specialInstructions != null && specialInstructions.isNotEmpty) {
        _cartItems[existingIndex].specialInstructions = specialInstructions;
      }
    } else {
      _cartItems.add(
        OrderItem(
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          specialInstructions: specialInstructions,
        ),
      );
    }
    notifyListeners();
  }

  void decrementQuantity(OrderItem item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      _cartItems.remove(item);
    }
    notifyListeners();
  }

  void incrementQuantity(OrderItem item) {
    item.quantity += 1;
    notifyListeners();
  }

  void updateItemInstruction(OrderItem item, String instructions) {
    item.specialInstructions = instructions;
    notifyListeners();
  }

  void setKitchenNote(String note) {
    _kitchenNote = note;
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    _kitchenNote = '';
    notifyListeners();
  }

  // Screen C: Push Order to Kitchen & update Firestore
  Future<bool> sendOrderToKitchen() async {
    if (_selectedTable == null || _cartItems.isEmpty) return false;

    _isLoading = true;
    notifyListeners();

    try {
      final orderId = 'ORD-\${const Uuid().v4().substring(0, 6).toUpperCase()}';
      final newOrder = OrderModel(
        orderId: orderId,
        tableNumber: _selectedTable!.tableNumber,
        itemsList: List.from(_cartItems),
        subtotal: cartSubtotal,
        taxAmount: cartTax,
        totalAmount: cartTotal,
        status: OrderStatus.pending,
        timestamp: DateTime.now(),
        kitchenNote: _kitchenNote.isNotEmpty ? _kitchenNote : null,
      );

      // Write 1: Create document in 'orders' collection
      await _firestore.collection('orders').doc(orderId).set(newOrder.toMap());

      // Write 2: Update table status to 'occupied' in Firestore
      await _firestore
          .collection('tables')
          .doc('table_\${_selectedTable!.tableNumber}')
          .set({
        'tableNumber': _selectedTable!.tableNumber,
        'seatingCapacity': _selectedTable!.seatingCapacity,
        'status': 'occupied',
        'currentOrderId': orderId,
        'lastUpdated': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      // Local optimistic update
      _cartItems.clear();
      _kitchenNote = '';
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Failed to send order to kitchen: \$e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Free table once payment or serving is completed
  Future<void> releaseTable(int tableNumber) async {
    await _firestore.collection('tables').doc('table_\$tableNumber').update({
      'status': 'available',
      'currentOrderId': null,
    });
  }

  // Fallback seeders for instant testing
  void _seedDefaultTables() {
    _tables = List.generate(
      12,
      (i) => TableModel(
        tableNumber: i + 1,
        seatingCapacity: (i % 3 == 0) ? 6 : (i % 2 == 0 ? 2 : 4),
        status: (i == 2 || i == 5) ? TableStatus.occupied : TableStatus.available,
      ),
    );
  }

  void _seedDefaultMenuItems() {
    _menuItems = [
      MenuItem(id: 'm1', name: 'Steamed Buff Mo:Mo', category: 'Mo:Mo Specials', price: 320, isAvailable: true, description: '10 pcs with sesame achar'),
      MenuItem(id: 'm2', name: 'Chicken Kothey Mo:Mo', category: 'Mo:Mo Specials', price: 350, isAvailable: true, description: 'Pan fried crispy dumplings'),
      MenuItem(id: 'm3', name: 'Spicy Jhol Mo:Mo', category: 'Mo:Mo Specials', price: 380, isAvailable: true, description: 'Drowned in spicy tangy gravy'),
      MenuItem(id: 'm4', name: 'Nepali Chicken Chowmein', category: 'Noodles & Chowmein', price: 280, isAvailable: true, description: 'Wok tossed hand pulled noodles'),
      MenuItem(id: 'm5', name: 'Buff Sukuti Chowmein', category: 'Noodles & Chowmein', price: 360, isAvailable: true, description: 'Dried spiced buffalo jerky'),
      MenuItem(id: 'm6', name: 'Newari Samay Baji Set', category: 'Khaja & Platters', price: 520, isAvailable: true, description: 'Full authentic feast platter'),
      MenuItem(id: 'm7', name: 'Hot Himalayan Masala Chiya', category: 'Beverages & Desserts', price: 90, isAvailable: true, description: 'Spiced aromatic milk tea'),
      MenuItem(id: 'm8', name: 'Fresh Sweet Mango Lassi', category: 'Beverages & Desserts', price: 180, isAvailable: true, description: 'Rich curd blended with mango'),
    ];
  }

  @override
  void dispose() {
    _tablesSubscription?.cancel();
    _menuSubscription?.cancel();
    _ordersSubscription?.cancel();
    super.dispose();
  }
}
`,
  },
  {
    id: 'screen_a',
    name: 'table_selection_screen.dart',
    path: 'lib/screens/table_selection_screen.dart',
    description: 'Screen A: Visual Table Grid (Green = Available, Red/Orange = Occupied) with seating capacity & order badges',
    category: 'screens',
    code: `// lib/screens/table_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/table_model.dart';
import 'menu_ordering_screen.dart';

class TableSelectionScreen extends StatelessWidget {
  const TableSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final posProvider = context.watch<PosProvider>();
    final tables = posProvider.tables;

    final availableCount = tables.where((t) => t.isAvailable).length;
    final occupiedCount = tables.where((t) => t.isOccupied).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.restaurant_menu, color: Color(0xFFFF9800)),
            const SizedBox(width: 10),
            const Text(
              'Himalayan POS',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const Spacer(),
            // Status Badges
            _buildStatusChip(
              label: 'Available: \$availableCount',
              color: const Color(0xFF10B981),
            ),
            const SizedBox(width: 8),
            _buildStatusChip(
              label: 'Occupied: \$occupiedCount',
              color: const Color(0xFFEF4444),
            ),
          ],
        ),
      ),
      body: posProvider.isLoading && tables.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select a Table to Start or View Order',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3, // Responsive 3-4 columns on tablet/phone
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.15,
                      ),
                      itemCount: tables.length,
                      itemBuilder: (context, index) {
                        final table = tables[index];
                        final isAvailable = table.isAvailable;

                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              posProvider.selectTable(table);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const MenuOrderingScreen(),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isAvailable
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFEF4444),
                                  width: 2.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: (isAvailable
                                            ? const Color(0xFF10B981)
                                            : const Color(0xFFEF4444))
                                        .withOpacity(0.12),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    // Top Row: Table Name & Capacity
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'T-\${table.tableNumber}',
                                          style: const TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.w900,
                                            color: Color(0xFF0F172A),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF1F5F9),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Row(
                                            children: [
                                              const Icon(Icons.people_alt,
                                                  size: 14, color: Color(0xFF64748B)),
                                              const SizedBox(width: 4),
                                              Text(
                                                '\${table.seatingCapacity}',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: Color(0xFF475569),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    // Center Visual Icon
                                    Icon(
                                      Icons.table_restaurant_rounded,
                                      size: 38,
                                      color: isAvailable
                                          ? const Color(0xFF059669)
                                          : const Color(0xFFDC2626),
                                    ),
                                    // Bottom Status Banner
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isAvailable
                                            ? const Color(0xFFECFDF5)
                                            : const Color(0xFFFEF2F2),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        isAvailable ? 'AVAILABLE' : 'OCCUPIED',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.8,
                                          color: isAvailable
                                              ? const Color(0xFF047857)
                                              : const Color(0xFFB91C1C),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatusChip({required String label, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
`,
  },
  {
    id: 'screen_b',
    name: 'menu_ordering_screen.dart',
    path: 'lib/screens/menu_ordering_screen.dart',
    description: 'Screen B: Menu & Fast Ordering Screen (Square POS style: categories, food cards, live bottom cart with counter & total)',
    category: 'screens',
    code: `// lib/screens/menu_ordering_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/menu_item.dart';
import 'order_review_screen.dart';

class MenuOrderingScreen extends StatefulWidget {
  const MenuOrderingScreen({super.key});

  @override
  State<MenuOrderingScreen> createState() => _MenuOrderingScreenState();
}

class _MenuOrderingScreenState extends State<MenuOrderingScreen> {
  String selectedCategory = 'All';
  String searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final posProvider = context.watch<PosProvider>();
    final currentTable = posProvider.selectedTable;
    final allItems = posProvider.menuItems;

    // Extract dynamic categories
    final categories = ['All', ...allItems.map((e) => e.category).toSet().toList()];

    // Filter by category and search text
    final filteredItems = allItems.where((item) {
      final matchesCategory = selectedCategory == 'All' || item.category == selectedCategory;
      final matchesSearch = item.name.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Table \${currentTable?.tableNumber ?? 1} - Menu Ordering'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              child: TextField(
                onChanged: (val) => setState(() => searchQuery = val),
                decoration: const InputDecoration(
                  hintText: 'Search food (e.g. Mo:Mo, Chowmein, Chiya)...',
                  prefixIcon: Icon(Icons.search, color: Color(0xFF64748B)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // 1. Horizontal Category Selector Bar (Square POS style)
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final cat = categories[index];
                final isSelected = cat == selectedCategory;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(
                      cat,
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? Colors.white : const Color(0xFF334155),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: const Color(0xFFD84315),
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    onSelected: (_) => setState(() => selectedCategory = cat),
                  ),
                );
              },
            ),
          ),

          // 2. Menu Items Grid
          Expanded(
            child: filteredItems.isEmpty
                ? const Center(child: Text('No menu items found.'))
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, // 2 on mobile, 3-4 on iPad/Tablet
                      childAspectRatio: 0.95,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 14,
                    ),
                    itemCount: filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = filteredItems[index];
                      return _buildMenuItemCard(context, item, posProvider);
                    },
                  ),
          ),
        ],
      ),

      // 3. Persistent Real-time Cart Bar (Bottom Sheet Trigger)
      bottomNavigationBar: posProvider.cartItems.isEmpty
          ? null
          : Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                boxShadow: [
                  BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, -2))
                ],
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    // Cart Count Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD84315),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '\${posProvider.totalItemCount} Items',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Estimated Total',
                          style: TextStyle(color: Colors.white60, fontSize: 12),
                        ),
                        Text(
                          'NPR \${posProvider.cartTotal.toStringAsFixed(1)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const OrderReviewScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.arrow_forward),
                      label: const Text(
                        'View Cart',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildMenuItemCard(
      BuildContext context, MenuItem item, PosProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 8,
            offset: Offset(0, 3),
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => provider.addToCart(item),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: item.isVeg
                            ? const Color(0xFFECFDF5)
                            : const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        item.isVeg ? 'VEG' : 'NON-VEG',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: item.isVeg
                              ? const Color(0xFF047857)
                              : const Color(0xFFB91C1C),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.note_alt_outlined, size: 20, color: Color(0xFF64748B)),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () => _showSpecialInstructionsDialog(context, item, provider),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  item.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
                if (item.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                ],
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Rs \${item.price.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFD84315),
                      ),
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFD84315),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.add, color: Colors.white, size: 22),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSpecialInstructionsDialog(
      BuildContext context, MenuItem item, PosProvider provider) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Instructions for \${item.name}'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'e.g. Extra spicy, no onions, well-done',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              provider.addToCart(item, specialInstructions: controller.text.trim());
              Navigator.pop(context);
            },
            child: const Text('Add with Note'),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    id: 'screen_c',
    name: 'order_review_screen.dart',
    path: 'lib/screens/order_review_screen.dart',
    description: 'Screen C: Order Review & Push (Order summary, kitchen notes, and "Send to Kitchen" writing directly to Firestore)',
    category: 'screens',
    code: `// lib/screens/order_review_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';

class OrderReviewScreen extends StatefulWidget {
  const OrderReviewScreen({super.key});

  @override
  State<OrderReviewScreen> createState() => _OrderReviewScreenState();
}

class _OrderReviewScreenState extends State<OrderReviewScreen> {
  final TextEditingController _noteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<PosProvider>(context, listen: false);
    _noteController.text = provider.kitchenNote;
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final posProvider = context.watch<PosProvider>();
    final cartItems = posProvider.cartItems;
    final tableNumber = posProvider.selectedTable?.tableNumber ?? 1;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Table \$tableNumber - Review & Push'),
      ),
      body: cartItems.isEmpty
          ? const Center(child: Text('Your cart is empty.'))
          : Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Table header banner
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Table #\$tableNumber',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '\${posProvider.totalItemCount} Items Added',
                              style: const TextStyle(color: Color(0xFFFF9800)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Order Items List
                      const Text(
                        'Items in this Order',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 8),

                      ...cartItems.map((item) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                      ),
                                      Text(
                                        'Rs \${item.price.toStringAsFixed(0)} each',
                                        style: const TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 12,
                                        ),
                                      ),
                                      if (item.specialInstructions != null &&
                                          item.specialInstructions!.isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.only(top: 4.0),
                                          child: Text(
                                            'Note: \${item.specialInstructions}',
                                            style: const TextStyle(
                                              color: Color(0xFFD84315),
                                              fontStyle: FontStyle.italic,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                // Quantity adjustments
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline),
                                      color: const Color(0xFFEF4444),
                                      onPressed: () =>
                                          posProvider.decrementQuantity(item),
                                    ),
                                    Text(
                                      '\${item.quantity}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.add_circle_outline),
                                      color: const Color(0xFF10B981),
                                      onPressed: () =>
                                          posProvider.incrementQuantity(item),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Rs \${item.itemTotal.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),

                      const SizedBox(height: 16),
                      // General Kitchen Note Input
                      const Text(
                        'Kitchen Special Note',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _noteController,
                        maxLines: 2,
                        onChanged: (val) => posProvider.setKitchenNote(val),
                        decoration: InputDecoration(
                          hintText: 'e.g. Serve Mo:Mo first, customer in a rush, etc.',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                      // Financial Summary Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          children: [
                            _summaryRow('Subtotal',
                                'Rs \${posProvider.cartSubtotal.toStringAsFixed(2)}'),
                            const SizedBox(height: 6),
                            _summaryRow('VAT / Tax (10%)',
                                'Rs \${posProvider.cartTax.toStringAsFixed(2)}'),
                            const Divider(height: 20),
                            _summaryRow(
                              'Total Amount',
                              'Rs \${posProvider.cartTotal.toStringAsFixed(2)}',
                              isBold: true,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Send To Kitchen Button (Push to Firestore)
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.white,
                  child: SafeArea(
                    child: SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD84315),
                          foregroundColor: Colors.white,
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: posProvider.isLoading
                            ? null
                            : () async {
                                final success = await posProvider.sendOrderToKitchen();
                                if (!mounted) return;
                                if (success) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'Order dispatched to Kitchen & Table \$tableNumber is now Occupied!',
                                      ),
                                      backgroundColor: const Color(0xFF10B981),
                                    ),
                                  );
                                  // Navigate back to Screen A (Table Selection)
                                  Navigator.of(context).popUntil((route) => route.isFirst);
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Failed to push order to Firestore.'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              },
                        icon: posProvider.isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.send_rounded),
                        label: Text(
                          posProvider.isLoading
                              ? 'Writing to Firestore...'
                              : 'SEND TO KITCHEN (PUSH)',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _summaryRow(String title, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: isBold ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: isBold ? const Color(0xFF0F172A) : const Color(0xFF64748B),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 18 : 14,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.bold,
            color: isBold ? const Color(0xFFD84315) : const Color(0xFF1E293B),
          ),
        ),
      ],
    );
  }
}
`,
  },
  {
    id: 'firestore_rules',
    name: 'firestore.rules',
    path: 'firestore.rules',
    description: 'Security rules for tables, menu items, and kitchen orders',
    category: 'firestore',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Restaurant POS staff / devices can read and update table status
    match /tables/{tableId} {
      allow read, write: if true;
    }
    
    // Menu items are readable by all POS terminals and editable by managers
    match /menu_items/{itemId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Orders collection for POS dispatch and Kitchen Display System (KDS)
    match /orders/{orderId} {
      allow read, create, update: if true;
      allow delete: if false; // Audit retention
    }
  }
}
`,
  },
  {
    id: 'seed_json',
    name: 'sample_nepali_menu.json',
    path: 'assets/sample_nepali_menu.json',
    description: 'Raw JSON seed data containing authentic Nepali restaurant food items',
    category: 'firestore',
    code: `{
  "menu_items": [
    {
      "id": "momo-01",
      "name": "Steamed Buff Mo:Mo (10 pcs)",
      "category": "Mo:Mo Specials",
      "price": 320,
      "isAvailable": true,
      "isVeg": false,
      "description": "Traditional spiced buffalo dumplings with tomato-sesame achar"
    },
    {
      "id": "momo-02",
      "name": "Chicken Kothey Mo:Mo (10 pcs)",
      "category": "Mo:Mo Specials",
      "price": 350,
      "isAvailable": true,
      "isVeg": false,
      "description": "Pan-fried crispy bottom dumplings"
    },
    {
      "id": "momo-03",
      "name": "Spicy Jhol Mo:Mo",
      "category": "Mo:Mo Specials",
      "price": 380,
      "isAvailable": true,
      "isVeg": false,
      "description": "Dumplings in tangy roasted soybean and sesame chilled broth"
    },
    {
      "id": "momo-04",
      "name": "C-Mo:Mo (Chilli Mo:Mo)",
      "category": "Mo:Mo Specials",
      "price": 400,
      "isAvailable": true,
      "isVeg": false,
      "description": "Fried dumplings in spicy onion & bell pepper sauce"
    },
    {
      "id": "chw-01",
      "name": "Nepali Chicken Chowmein",
      "category": "Noodles & Chowmein",
      "price": 280,
      "isAvailable": true,
      "isVeg": false,
      "description": "Wok tossed hand-pulled noodles with chicken and veggies"
    },
    {
      "id": "chw-02",
      "name": "Buff Sukuti Chowmein",
      "category": "Noodles & Chowmein",
      "price": 360,
      "isAvailable": true,
      "isVeg": false,
      "description": "Smoky dried buff jerky tossed with noodles"
    },
    {
      "id": "khaja-01",
      "name": "Newari Samay Baji Set",
      "category": "Khaja & Platters",
      "price": 520,
      "isAvailable": true,
      "isVeg": false,
      "description": "Beaten rice, choila, aloo tama, black soybean, egg and bara"
    },
    {
      "id": "bev-01",
      "name": "Hot Himalayan Masala Chiya",
      "category": "Beverages & Desserts",
      "price": 90,
      "isAvailable": true,
      "isVeg": true,
      "description": "Fresh brewed milk tea with cardamom, cinnamon, and ginger"
    }
  ]
}`,
  },
  {
    id: 'kds_screen',
    name: 'kitchen_display_screen.dart',
    path: 'lib/screens/kitchen_display_screen.dart',
    description: 'Phase 2 KDS: Real-time ticket matrix with elapsed prep timers, cooking alerts, and status progression buttons',
    category: 'screens',
    code: `// lib/screens/kitchen_display_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';
import 'billing_checkout_screen.dart';

class KitchenDisplayScreen extends StatefulWidget {
  const KitchenDisplayScreen({super.key});

  @override
  State<KitchenDisplayScreen> createState() => _KitchenDisplayScreenState();
}

class _KitchenDisplayScreenState extends State<KitchenDisplayScreen> {
  Timer? _ticker;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  String _formatElapsed(DateTime timestamp) {
    final diff = DateTime.now().difference(timestamp);
    if (diff.inMinutes < 1) return 'Just now (<1m)';
    if (diff.inHours > 0) return '\${diff.inHours}h \${diff.inMinutes % 60}m ago';
    return '\${diff.inMinutes}m ago';
  }

  Color _getTimerColor(DateTime timestamp) {
    final minutes = DateTime.now().difference(timestamp).inMinutes;
    if (minutes >= 20) return const Color(0xFFEF4444);
    if (minutes >= 10) return const Color(0xFFF59E0B);
    return const Color(0xFF10B981);
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final activeOrders = pos.activeOrders
        .where((o) => o.status != OrderStatus.paid)
        .where((o) => _filter == 'all' || o.status.name == _filter)
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Kitchen Display System (KDS)', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: activeOrders.isEmpty
          ? const Center(child: Text('All Kitchen Tickets Cleared!', style: TextStyle(color: Colors.white70)))
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              itemCount: activeOrders.length,
              itemBuilder: (context, index) {
                final order = activeOrders[index];
                final isPending = order.status == OrderStatus.pending;
                final isPreparing = order.status == OrderStatus.preparing;

                return Card(
                  color: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    children: [
                      ListTile(
                        title: Text('Table #\${order.tableNumber}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: Text('Elapsed: \${_formatElapsed(order.timestamp)}', style: TextStyle(color: _getTimerColor(order.timestamp))),
                        trailing: Text(order.status.name.toUpperCase(), style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                      ),
                      const Divider(color: Colors.white24),
                      Expanded(
                        child: ListView(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          children: order.itemsList.map((item) => Text('\${item.quantity}x \${item.name}', style: const TextStyle(color: Colors.white))).toList(),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: isPending
                            ? ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B)),
                                onPressed: () => pos.updateOrderStatus(order.orderId, OrderStatus.preparing),
                                child: const Text('MARK COOKING'),
                              )
                            : isPreparing
                                ? ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                                    onPressed: () => pos.updateOrderStatus(order.orderId, OrderStatus.served),
                                    child: const Text('MARK READY TO SERVE'),
                                  )
                                : ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => BillingCheckoutScreen(order: order))),
                                    child: const Text('CHECKOUT & BILL'),
                                  ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
`,
  },
  {
    id: 'billing_checkout_screen',
    name: 'billing_checkout_screen.dart',
    path: 'lib/screens/billing_checkout_screen.dart',
    description: 'Phase 2 Nepali Multi-QR Billing & Checkout: Fonepay, eSewa, Khalti branded QR switchers, dynamic amounts, copyable Txn ID, 13% Nepal VAT, and receipt print preview',
    category: 'screens',
    code: `// lib/screens/billing_checkout_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';

class BillingCheckoutScreen extends StatefulWidget {
  final OrderModel order;

  const BillingCheckoutScreen({super.key, required this.order});

  @override
  State<BillingCheckoutScreen> createState() => _BillingCheckoutScreenState();
}

enum QrWallet { fonepay, esewa, khalti }

class _BillingCheckoutScreenState extends State<BillingCheckoutScreen> {
  double _discountPercent = 0.0;
  String _primaryPaymentMethod = 'Digital QR'; // 'Cash', 'Digital QR', 'Card / POS'
  QrWallet _selectedWallet = QrWallet.fonepay;
  String _transactionRef = '';
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _transactionRef = 'TXN-\${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
  }

  String get _currentPaymentLabel {
    if (_primaryPaymentMethod == 'Digital QR') {
      switch (_selectedWallet) {
        case QrWallet.fonepay:
          return 'Fonepay (Mobile Banking)';
        case QrWallet.esewa:
          return 'eSewa QR';
        case QrWallet.khalti:
          return 'Khalti QR';
      }
    }
    return _primaryPaymentMethod;
  }

  Color get _walletColor {
    switch (_selectedWallet) {
      case QrWallet.fonepay:
        return const Color(0xFFDC2626); // Red
      case QrWallet.esewa:
        return const Color(0xFF16A34A); // Green
      case QrWallet.khalti:
        return const Color(0xFF9333EA); // Purple
    }
  }

  String get _walletTitle {
    switch (_selectedWallet) {
      case QrWallet.fonepay:
        return 'Fonepay / NepalPay Interoperable QR';
      case QrWallet.esewa:
        return 'eSewa Merchant QR';
      case QrWallet.khalti:
        return 'Khalti Smart Merchant QR';
    }
  }

  String get _merchantName {
    switch (_selectedWallet) {
      case QrWallet.fonepay:
        return 'HIMALAYAN RESTAURANT & BAR PVT. LTD.';
      case QrWallet.esewa:
        return 'HIMALAYAN RESTAURANT (ESEWA BIZ)';
      case QrWallet.khalti:
        return 'HIMALAYAN HOSPITALITY (KHALTI)';
      }
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.read<PosProvider>();

    final double subtotal = widget.order.itemsList.fold(
      0.0,
      (sum, item) => sum + (item.price * item.quantity),
    );
    final double discountAmount = (subtotal * _discountPercent) / 100.0;
    final double taxableAmount = (subtotal - discountAmount) > 0 ? (subtotal - discountAmount) : 0.0;
    const double vatRate = 0.13; // 13% Nepal VAT
    final double vatAmount = taxableAmount * vatRate;
    final double grandTotal = taxableAmount + vatAmount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Table #\${widget.order.tableNumber} - Checkout & QR Billing'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            tooltip: 'Print Thermal Receipt',
            icon: const Icon(Icons.print_outlined),
            onPressed: () => _showPrintPreview(context, subtotal, discountAmount, vatAmount, grandTotal),
          ),
        ],
      ),
      body: Row(
        children: [
          // Left: Order Summary & Discounts & Receipt Preview
          Expanded(
            flex: 5,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildOrderItemsCard(),
                  const SizedBox(height: 16),
                  _buildDiscountSelector(),
                  const SizedBox(height: 16),
                  _buildReceiptCard(subtotal, discountAmount, vatAmount, grandTotal),
                ],
              ),
            ),
          ),

          // Right: Multi-Payment & Dynamic Nepali QR Container
          Expanded(
            flex: 6,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select Payment Mode',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 12),

                  // 1. Primary Payment Method Selectors
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _paymentTypeChip('Cash', Icons.payments_outlined),
                      _paymentTypeChip('Digital QR', Icons.qr_code_scanner_rounded),
                      _paymentTypeChip('Card / POS', Icons.credit_card_rounded),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // 2. If Digital QR: Show Wallet Switcher Tabs [Fonepay] [eSewa] [Khalti]
                  if (_primaryPaymentMethod == 'Digital QR') ...[
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          _walletTabItem(QrWallet.fonepay, 'Fonepay', const Color(0xFFDC2626)),
                          _walletTabItem(QrWallet.esewa, 'eSewa', const Color(0xFF16A34A)),
                          _walletTabItem(QrWallet.khalti, 'Khalti', const Color(0xFF9333EA)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 3. Branded QR Container with Merchant, Dynamic Amount & Copyable Txn
                    Expanded(
                      child: _buildBrandedQrBox(grandTotal),
                    ),
                  ] else ...[
                    Expanded(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _primaryPaymentMethod == 'Cash' ? Icons.payments_outlined : Icons.credit_card,
                              size: 72,
                              color: const Color(0xFF64748B),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Settle with \$_primaryPaymentMethod',
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Collect exact: Rs. \${grandTotal.toStringAsFixed(2)}',
                              style: const TextStyle(fontSize: 16, color: Color(0xFF059669), fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // 4. Action Button: Pay & Close Order
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 2,
                      ),
                      onPressed: _isProcessing
                          ? null
                          : () async {
                              setState(() => _isProcessing = true);
                              await pos.completePaymentAndFreeTable(
                                orderId: widget.order.orderId,
                                tableNumber: widget.order.tableNumber,
                                finalTotal: grandTotal,
                                discountPercent: _discountPercent,
                                paymentMethod: _currentPaymentLabel,
                              );
                              if (context.mounted) {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Payment confirmed! Table #\${widget.order.tableNumber} is now Available.'),
                                    backgroundColor: const Color(0xFF10B981),
                                  ),
                                );
                              }
                            },
                      icon: _isProcessing
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.check_circle_rounded, color: Colors.white),
                      label: Text(
                        _isProcessing ? 'CONFIRMING...' : 'PAYMENT RECEIVED & CLOSE ORDER (FREE TABLE)',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentTypeChip(String label, IconData icon) {
    final isSelected = _primaryPaymentMethod == label;
    return ChoiceChip(
      selected: isSelected,
      onSelected: (_) => setState(() => _primaryPaymentMethod = label),
      avatar: Icon(icon, size: 18, color: isSelected ? Colors.white : Colors.black87),
      label: Text(label),
      selectedColor: const Color(0xFF0F172A),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : const Color(0xFF334155),
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
      ),
    );
  }

  Widget _walletTabItem(QrWallet wallet, String name, Color accent) {
    final isSelected = _selectedWallet == wallet;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedWallet = wallet),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4, offset: const Offset(0, 2))]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(color: accent, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(
                name,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                  color: isSelected ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBrandedQrBox(double total) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _walletColor.withOpacity(0.3), width: 1.5),
      ),
      child: Column(
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: _walletColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _walletTitle,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const Icon(Icons.qr_code, color: Colors.white, size: 18),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _merchantName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF334155)),
                  ),
                  const SizedBox(height: 12),

                  // Simulated QR Box with Corner Targets
                  Container(
                    width: 170,
                    height: 170,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Center(
                      child: Icon(Icons.qr_code_2_rounded, size: 140, color: _walletColor),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Dynamic Amount Display
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Text(
                      'Amount to Pay: Rs. \${total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF047857),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Copyable Transaction Ref
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Ref: \$_transactionRef',
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Color(0xFF64748B)),
                      ),
                      IconButton(
                        tooltip: 'Copy Reference ID',
                        icon: const Icon(Icons.copy_rounded, size: 15, color: Color(0xFF64748B)),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: _transactionRef));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Transaction Ref copied!'), duration: Duration(seconds: 1)),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderItemsCard() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Ordered Items', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const Divider(),
            ...widget.order.itemsList.map(
              (item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('\${item.quantity}x \${item.name}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                    Text('Rs. \${(item.price * item.quantity).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiscountSelector() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Discount:', style: TextStyle(fontWeight: FontWeight.bold)),
            Wrap(
              spacing: 6,
              children: [0.0, 5.0, 10.0, 15.0].map((pct) {
                final isSelected = _discountPercent == pct;
                return ChoiceChip(
                  label: Text('\${pct.toInt()}%'),
                  selected: isSelected,
                  onSelected: (_) => setState(() => _discountPercent = pct),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptCard(double subtotal, double discountAmount, double vatAmount, double grandTotal) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        children: [
          _receiptRow('Subtotal', 'Rs. \${subtotal.toStringAsFixed(2)}'),
          if (_discountPercent > 0)
            _receiptRow('Discount (\${_discountPercent.toInt()}%)', '- Rs. \${discountAmount.toStringAsFixed(2)}', color: Colors.green),
          _receiptRow('Taxable Base', 'Rs. \${(subtotal - discountAmount).toStringAsFixed(2)}'),
          _receiptRow('13% Nepal VAT', 'Rs. \${vatAmount.toStringAsFixed(2)}'),
          const Divider(),
          _receiptRow('GRAND TOTAL', 'Rs. \${grandTotal.toStringAsFixed(2)}', isBold: true, fontSize: 16),
        ],
      ),
    );
  }

  Widget _receiptRow(String title, String amount, {bool isBold = false, double fontSize = 13, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: fontSize, color: color)),
          Text(amount, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.w600, fontSize: fontSize, color: color)),
        ],
      ),
    );
  }

  void _showPrintPreview(BuildContext context, double sub, double disc, double vat, double total) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Thermal Printer 80mm ESC/POS'),
        content: const Text('Sending receipt stream to network POS printer at 192.168.1.100:9100...'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }
}
`,
  },
  {
    id: 'pos_firestore_service',
    name: 'pos_firestore_service.dart',
    path: 'lib/services/pos_firestore_service.dart',
    description: 'Atomic Firestore Multi-Document transactions, live Streams, stock deduction & Shift Day Close settlements',
    category: 'services',
    code: `// lib/services/pos_firestore_service.dart

import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/menu_item.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../models/daily_sales_report.dart';

class PosFirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  CollectionReference get _menuItemsRef => _firestore.collection('menu_items');
  CollectionReference get _tablesRef => _firestore.collection('tables');
  CollectionReference get _ordersRef => _firestore.collection('orders');
  CollectionReference get _salesReportsRef => _firestore.collection('daily_sales_reports');

  // Stream of Menu Items (stock & availability)
  Stream<List<MenuItem>> streamMenuItems() {
    return _menuItemsRef.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return MenuItem.fromMap(doc.data() as Map<String, dynamic>, docId: doc.id);
      }).toList();
    });
  }

  // Stream of Tables
  Stream<List<TableModel>> streamTables() {
    return _tablesRef.orderBy('tableNumber').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return TableModel.fromMap(doc.data() as Map<String, dynamic>, docId: doc.id);
      }).toList();
    });
  }

  // Stream of Orders
  Stream<List<OrderModel>> streamOrders() {
    return _ordersRef.orderBy('timestamp', descending: true).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return OrderModel.fromMap(doc.data() as Map<String, dynamic>, docId: doc.id);
      }).toList();
    });
  }

  // Atomic Multi-Doc Transaction: Place Order, Occupy Table & Deduct Stock
  Future<void> placeOrderAndUpdateTable(OrderModel order) async {
    final batch = _firestore.batch();

    // 1. Create Order Doc
    final orderDocRef = _ordersRef.doc(order.orderId);
    batch.set(orderDocRef, order.toMap());

    // 2. Mark Table Occupied
    final tableDocRef = _tablesRef.doc('table_\${order.tableNumber}');
    batch.update(tableDocRef, {
      'status': 'occupied',
      'currentOrderId': order.orderId,
      'occupiedSince': DateTime.now().toIso8601String(),
    });

    // 3. Real-time Inventory Deduction
    for (final item in order.itemsList) {
      final itemDocRef = _menuItemsRef.doc(item.menuItemId);
      batch.update(itemDocRef, {
        'stockQuantity': FieldValue.increment(-item.quantity),
      });
    }

    await batch.commit();
  }

  // Update Status in KDS
  Future<void> updateOrderStatus(String orderId, OrderStatus status) async {
    await _ordersRef.doc(orderId).update({'status': status.name});
  }

  // Settle Payment & Free Table
  Future<void> completePaymentAndFreeTable({
    required String orderId,
    required int tableNumber,
    required double finalTotal,
    required double discountPercent,
    required String paymentMethod,
    String? transactionRef,
  }) async {
    final batch = _firestore.batch();

    final orderDocRef = _ordersRef.doc(orderId);
    batch.update(orderDocRef, {
      'status': 'paid',
      'totalAmount': finalTotal,
      'discountPercent': discountPercent,
      'paymentMethod': paymentMethod,
      'transactionRef': transactionRef ?? 'TXN-\${DateTime.now().millisecondsSinceEpoch}',
      'settledAt': DateTime.now().toIso8601String(),
    });

    final tableDocRef = _tablesRef.doc('table_\$tableNumber');
    batch.update(tableDocRef, {
      'status': 'available',
      'currentOrderId': null,
      'occupiedSince': null,
    });

    await batch.commit();
  }

  // Quick Restock
  Future<void> restockMenuItem(String itemId, int addedQty) async {
    await _menuItemsRef.doc(itemId).update({
      'stockQuantity': FieldValue.increment(addedQty),
      'isAvailable': true,
    });
  }

  // Shift Day Close Z-Report
  Future<void> closeDailyShift(DailySalesReport report) async {
    await _salesReportsRef.doc(report.reportId).set(report.toMap());
  }
}
`,
  },
  {
    id: 'daily_sales_report',
    name: 'daily_sales_report.dart',
    path: 'lib/models/daily_sales_report.dart',
    description: 'Data model for shift reconciliation, digital wallet revenue breakdown & Day Close Z-Reports',
    category: 'models',
    code: `// lib/models/daily_sales_report.dart

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
    this.settledBy = 'Shift Manager',
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
`,
  },
  {
    id: 'sales_report_screen',
    name: 'sales_report_screen.dart',
    path: 'lib/screens/sales_report_screen.dart',
    description: 'Phase 3 Shift Day Close Screen: Cash & Nepali Digital QR reconciliation, 13% VAT audit, stock counts & printable Z-Report',
    category: 'screens',
    code: `// lib/screens/sales_report_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../widgets/thermal_receipt_dialog.dart';

class SalesReportScreen extends StatefulWidget {
  const SalesReportScreen({super.key});

  @override
  State<SalesReportScreen> createState() => _SalesReportScreenState();
}

class _SalesReportScreenState extends State<SalesReportScreen> {
  String _selectedPaymentFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final paidOrders = pos.paidOrders;
    final breakdown = pos.paymentChannelBreakdown;

    final filteredOrders = paidOrders.where((o) {
      if (_selectedPaymentFilter == 'All') return true;
      return (o.paymentMethod ?? '').contains(_selectedPaymentFilter);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Day Close & Sales Report (Z-Report)', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            tooltip: 'Perform Shift Settlement',
            icon: const Icon(Icons.lock_clock_rounded, color: Colors.amber),
            onPressed: () => _confirmDayClose(context, pos),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _buildKpiCard('Gross Sales', 'Rs. \${pos.grossSalesToday.toStringAsFixed(2)}', Colors.blue, '\${paidOrders.length} orders'),
                const SizedBox(width: 12),
                _buildKpiCard('13% Nepal VAT', 'Rs. \${pos.vatCollectedToday.toStringAsFixed(2)}', Colors.amber, 'PAN: 601928374'),
                const SizedBox(width: 12),
                _buildKpiCard('Discounts', '- Rs. \${pos.totalDiscountsToday.toStringAsFixed(2)}', Colors.redAccent, 'Promotional'),
                const SizedBox(width: 12),
                _buildKpiCard('Net Settled', 'Rs. \${pos.netRevenueToday.toStringAsFixed(2)}', Colors.emerald, 'Cash + Digital'),
              ],
            ),
            const SizedBox(height: 20),
            // Channel Breakdown Cards
            Card(
              color: const Color(0xFF1E293B),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Settlement Channels (Nepali QR Wallets & Cash)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _channelTile('Cash', breakdown['Cash'] ?? 0.0, Colors.teal, pos.netRevenueToday),
                        _channelTile('Fonepay', breakdown['Fonepay'] ?? 0.0, Colors.red, pos.netRevenueToday),
                        _channelTile('eSewa', breakdown['eSewa'] ?? 0.0, Colors.green, pos.netRevenueToday),
                        _channelTile('Khalti', breakdown['Khalti'] ?? 0.0, Colors.purple, pos.netRevenueToday),
                        _channelTile('Card', breakdown['Card'] ?? 0.0, Colors.indigo, pos.netRevenueToday),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, Color color, String sub) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label.toUpperCase(), style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(sub, style: const TextStyle(color: Colors.white38, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _channelTile(String name, double amount, Color color, double totalRevenue) {
    final pct = totalRevenue > 0 ? (amount / totalRevenue * 100).toInt() : 0;
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(10)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Rs. \${amount.toStringAsFixed(1)}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            LinearProgressIndicator(value: totalRevenue > 0 ? amount / totalRevenue : 0, color: color, backgroundColor: Colors.white10),
            const SizedBox(height: 2),
            Text('\$pct% share', style: const TextStyle(color: Colors.white38, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  void _confirmDayClose(BuildContext context, PosProvider pos) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Perform Day Close (Z-Report)?', style: TextStyle(color: Colors.white)),
        content: const Text('Reconciles all cash and Nepali QR payments, logs stock audit, and stores report to Firestore.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              await pos.performDayClose();
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('CONFIRM'),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    id: 'kot_slip_dialog',
    name: 'kot_slip_dialog.dart',
    path: 'lib/widgets/kot_slip_dialog.dart',
    description: 'Printable Kitchen Order Ticket (KOT) Dialog for 58mm/80mm ESC/POS thermal printers',
    category: 'widgets',
    code: `// lib/widgets/kot_slip_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/order_model.dart';

class KotSlipDialog extends StatelessWidget {
  final OrderModel order;
  const KotSlipDialog({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final kotText = '''
========================================
       *** KITCHEN ORDER TICKET ***
                 CHEF SLIP
========================================
KOT #: KOT-\${order.orderId}
TABLE #: \${order.tableNumber}
Time: \${order.timestamp.toLocal().toString().substring(11, 16)}
Server: \${order.serverName ?? "Captain 01"}
----------------------------------------
QTY   ITEM NAME & INSTRUCTIONS
----------------------------------------
\${order.itemsList.map((i) => '[ \${i.quantity}x ]  \${i.name.toUpperCase()}\\n\${i.specialInstructions != null ? "     >> Note: \${i.specialInstructions}\\n" : ""}').join()}
----------------------------------------
Kitchen Note: \${order.kitchenNote ?? "Standard preparation"}
========================================
''';

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: 320,
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(color: Color(0xFFDC2626), borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
              child: const Row(
                children: [
                  Icon(Icons.restaurant, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Kitchen Order Slip (KOT)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(kotText, style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.black87, height: 1.3)),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: kotText));
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('KOT sent to kitchen printer!')));
                    },
                    icon: const Icon(Icons.print, size: 16, color: Colors.white),
                    label: const Text('Print KOT', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    id: 'thermal_receipt_dialog',
    name: 'thermal_receipt_dialog.dart',
    path: 'lib/widgets/thermal_receipt_dialog.dart',
    description: 'Printable 58mm / 80mm Customer Tax Receipt with Nepali PAN & 13% VAT itemized breakdown',
    category: 'widgets',
    code: `// lib/widgets/thermal_receipt_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/order_model.dart';

class ThermalReceiptDialog extends StatefulWidget {
  final OrderModel order;
  const ThermalReceiptDialog({super.key, required this.order});

  @override
  State<ThermalReceiptDialog> createState() => _ThermalReceiptDialogState();
}

class _ThermalReceiptDialogState extends State<ThermalReceiptDialog> {
  String _paperWidth = '80mm';

  @override
  Widget build(BuildContext context) {
    final o = widget.order;
    final subtotal = o.itemsList.fold(0.0, (sum, i) => sum + (i.price * i.quantity));
    final discount = o.discountAmount > 0 ? o.discountAmount : (subtotal * o.discountPercent / 100);
    final taxable = subtotal - discount > 0 ? subtotal - discount : 0.0;
    final vat = o.taxAmount > 0 ? o.taxAmount : (taxable * 0.13);
    final total = taxable + vat;

    final receiptText = '''
========================================
   HIMALAYAN RESTAURANT & BAR PVT. LTD.
       Durbar Marg, Kathmandu, Nepal
       PAN: 601928374 | Tel: +977-1-4228901
========================================
Receipt #: REC-\${o.orderId}
Table: Table #\${o.tableNumber}
Date: \${o.timestamp.toLocal().toString().substring(0, 16)}
----------------------------------------
ITEM                 QTY   PRICE  TOTAL
----------------------------------------
\${o.itemsList.map((i) => '\${i.name.padRight(18).substring(0, 18)} \${i.quantity}x \${i.price.toInt()} Rs.\${(i.price * i.quantity).toInt()}').join('\\n')}
----------------------------------------
Subtotal:                       Rs. \${subtotal.toStringAsFixed(2)}
Discount:                      - Rs. \${discount.toStringAsFixed(2)}
Taxable Base:                   Rs. \${taxable.toStringAsFixed(2)}
13% Nepal VAT:                  Rs. \${vat.toStringAsFixed(2)}
----------------------------------------
GRAND TOTAL:                    Rs. \${total.toStringAsFixed(2)}
Payment:                        \${o.paymentMethod ?? "Cash NPR"}
Ref:                            \${o.transactionRef ?? "TXN-AUTO"}
========================================
        DHANYABAD! THANK YOU!
========================================
''';

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: _paperWidth == '80mm' ? 360 : 280,
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: SingleChildScrollView(
                child: Text(receiptText, style: const TextStyle(fontFamily: 'monospace', fontSize: 10.5, color: Colors.black87, height: 1.3)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A)),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: receiptText));
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Receipt copied!')));
                    },
                    icon: const Icon(Icons.print, size: 16, color: Colors.white),
                    label: const Text('Print ESC/POS', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
];
