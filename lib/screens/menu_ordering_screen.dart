// lib/screens/menu_ordering_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/table_model.dart';
import '../models/menu_item.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';
import 'order_review_screen.dart';

class MenuOrderingScreen extends StatefulWidget {
  final TableModel table;
  const MenuOrderingScreen({super.key, required this.table});

  @override
  State<MenuOrderingScreen> createState() => _MenuOrderingScreenState();
}

class _MenuOrderingScreenState extends State<MenuOrderingScreen> {
  String _selectedCategory = 'All';
  String _searchQuery = '';

  final List<String> _categories = [
    'All',
    'Mo:Mo Specials',
    'Noodles & Chowmein',
    'Khaja & Platters',
    'Curry & Rice',
    'Beverages & Desserts',
  ];

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final menuItems = pos.menuItems;
    final tableCart = pos.getCartForTable(widget.table.tableNumber);
    final cartSubtotal = pos.getTableCartSubtotal(widget.table.tableNumber);
    final vat = pos.profile.isPanEnabled ? (cartSubtotal * (pos.profile.vatRate / 100.0)) : 0.0;
    final grandTotal = cartSubtotal + vat;

    final filteredItems = menuItems.where((item) {
      final matchesCategory = _selectedCategory == 'All' || item.category == _selectedCategory;
      final matchesSearch = item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (item.description ?? '').toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    final isWide = MediaQuery.of(context).size.width > 600;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 2,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Table T-${widget.table.tableNumber}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF10B981), width: 0.8),
                  ),
                  child: Text(
                    widget.table.roomSection,
                    style: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Staff / Waiter Selector
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFF59E0B), width: 1),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: pos.selectedServer,
                dropdownColor: const Color(0xFF1E293B),
                icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 18),
                items: pos.staffList.map((server) {
                  return DropdownMenuItem(
                    value: server,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.person_pin_rounded, color: Color(0xFFF59E0B), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          server,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) pos.setSelectedServer(val);
                },
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: TextField(
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search Mo:Mo, Chowmein, Thakali Thali, Lassi...',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFF59E0B), size: 20),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                isDense: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),

          // Category Chips Filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: const Color(0xFFF59E0B),
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.black : Colors.white70,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // World-Class Food Menu Grid
          Expanded(
            child: filteredItems.isEmpty
                ? const Center(child: Text('No dishes found', style: TextStyle(color: Colors.white54)))
                : GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: isWide ? 4 : 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 0.74,
                    ),
                    itemCount: filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = filteredItems[index];
                      final cartItem = tableCart.firstWhere(
                        (c) => c.menuItemId == item.id,
                        orElse: () => OrderItem(menuItemId: '', name: '', quantity: 0, price: 0),
                      );
                      final inCart = cartItem.quantity > 0;

                      return Card(
                        color: const Color(0xFF1E293B),
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: inCart ? const Color(0xFFF59E0B) : const Color(0xFF334155),
                            width: inCart ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // HD Food Image with Bestseller, Veg/Non-Veg & Prep Time badges
                            Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                  child: Container(
                                    height: 96,
                                    width: double.infinity,
                                    color: const Color(0xFF334155),
                                    child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                                        ? Image.network(
                                            item.imageUrl!,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => const Center(
                                              child: Icon(Icons.restaurant, color: Color(0xFFF59E0B), size: 36),
                                            ),
                                          )
                                        : const Center(
                                            child: Icon(Icons.restaurant, color: Color(0xFFF59E0B), size: 36),
                                          ),
                                  ),
                                ),
                                // Veg / Non-Veg badge
                                Positioned(
                                  top: 6,
                                  left: 6,
                                  child: Container(
                                    padding: const EdgeInsets.all(3.5),
                                    decoration: BoxDecoration(
                                      color: Colors.black87,
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                    child: Icon(
                                      Icons.circle,
                                      size: 8,
                                      color: item.isVeg ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                    ),
                                  ),
                                ),
                                // Bestseller badge
                                if (item.isBestseller)
                                  Positioned(
                                    top: 6,
                                    right: 6,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFEA580C)]),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.star_rounded, size: 10, color: Colors.black),
                                          SizedBox(width: 2),
                                          Text('BESTSELLER', style: TextStyle(color: Colors.black, fontSize: 8, fontWeight: FontWeight.w900)),
                                        ],
                                      ),
                                    ),
                                  ),
                                // Prep Time pill
                                Positioned(
                                  bottom: 6,
                                  left: 6,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.75),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.timer_outlined, size: 9, color: Colors.white70),
                                        const SizedBox(width: 2),
                                        Text('${item.prepTimeMinutes}m', style: const TextStyle(color: Colors.white70, fontSize: 9)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            // Item Name & Category
                            Padding(
                              padding: const EdgeInsets.fromLTRB(8, 8, 8, 2),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Rs. ${item.price.toStringAsFixed(0)}',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFFF59E0B)),
                                      ),
                                      if (item.spicyLevel > 0)
                                        Text('🌶️' * item.spicyLevel, style: const TextStyle(fontSize: 8)),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            const Spacer(),

                            // 1-Tap Quick Add / Stepper Button
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: !inCart
                                  ? SizedBox(
                                      width: double.infinity,
                                      height: 30,
                                      child: ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF334155),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          padding: EdgeInsets.zero,
                                        ),
                                        onPressed: !item.isAvailable
                                            ? null
                                            : () => pos.addItemToTableCart(widget.table.tableNumber, item),
                                        child: Text(
                                          !item.isAvailable ? 'Out of Stock' : '+ Add',
                                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    )
                                  : Container(
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF10B981),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.remove, size: 14, color: Colors.white),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            onPressed: () => pos.updateCartItemQuantity(
                                              widget.table.tableNumber,
                                              item.id,
                                              cartItem.quantity - 1,
                                            ),
                                          ),
                                          Text(
                                            '${cartItem.quantity}',
                                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.add, size: 14, color: Colors.white),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            onPressed: () => pos.updateCartItemQuantity(
                                              widget.table.tableNumber,
                                              item.id,
                                              cartItem.quantity + 1,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // Bottom Order Sticky Summary Bar with Waiter info
          if (tableCart.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                border: Border(top: BorderSide(color: Color(0xFF334155))),
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Text('${tableCart.length} items', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                            const SizedBox(width: 6),
                            Text('• Waiter: ${pos.selectedServer}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text(
                          'Rs. ${grandTotal.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Color(0xFFF59E0B)),
                        ),
                      ],
                    ),
                    const Spacer(),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 16),
                      label: const Text('Review & Send KOT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => OrderReviewScreen(table: widget.table)),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
