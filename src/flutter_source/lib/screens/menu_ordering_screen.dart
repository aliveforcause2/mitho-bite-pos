// lib/screens/menu_ordering_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/table_model.dart';
import '../models/menu_item.dart';
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

    final filteredItems = menuItems.where((item) {
      final matchesCategory = _selectedCategory == 'All' || item.category == _selectedCategory;
      final matchesSearch = item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (item.description ?? '').toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Table #${widget.table.tableNumber} - Menu & Ordering', style: const TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Row(
        children: [
          // Left Area: Category Selector & Item Grid
          Expanded(
            flex: 7,
            child: Column(
              children: [
                // Search & Category Chips
                Container(
                  padding: const EdgeInsets.all(12),
                  color: const Color(0xFF1E293B),
                  child: Column(
                    children: [
                      TextField(
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Search Mo:Mo, Chowmein, Chiya...',
                          hintStyle: const TextStyle(color: Colors.white38),
                          prefixIcon: const Icon(Icons.search, color: Colors.white38),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                        onChanged: (v) => setState(() => _searchQuery = v),
                      ),
                      const SizedBox(height: 8),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _categories.map((cat) {
                            final isSel = _selectedCategory == cat;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ChoiceChip(
                                label: Text(cat),
                                selected: isSel,
                                onSelected: (_) => setState(() => _selectedCategory = cat),
                                selectedColor: Colors.amber,
                                labelStyle: TextStyle(
                                  color: isSel ? Colors.black : Colors.white70,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),

                // Dishes Grid with Real-time Stock Badges
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.1,
                    ),
                    itemCount: filteredItems.length,
                    itemBuilder: (context, idx) {
                      final item = filteredItems[idx];
                      final isLow = item.isLowStock;
                      final isOut = item.isOutOfStock;

                      return Card(
                        color: const Color(0xFF1E293B),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        item.isVeg ? '🟢 Veg' : '🔴 Non-Veg',
                                        style: const TextStyle(fontSize: 10, color: Colors.white70),
                                      ),
                                      // Stock Badge
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: isOut ? Colors.red.withOpacity(0.2) : isLow ? Colors.amber.withOpacity(0.2) : Colors.black26,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          isOut ? 'OUT' : isLow ? 'Only ${item.stockQuantity}!' : '${item.stockQuantity} left',
                                          style: TextStyle(
                                            color: isOut ? Colors.red : isLow ? Colors.amber : Colors.white54,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    item.name,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('Rs. ${item.price.toInt()}', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                                  IconButton.filled(
                                    style: IconButton.styleFrom(backgroundColor: isOut ? Colors.grey : Colors.amber),
                                    icon: const Icon(Icons.add, color: Colors.black, size: 18),
                                    onPressed: isOut ? null : () => pos.addToCart(item),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Right Area: Active Cart Sidebar (Square POS style)
          Expanded(
            flex: 4,
            child: Container(
              color: const Color(0xFF1E293B),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: const Color(0xFF0F172A),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Order Cart (${pos.cartCount})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                        const Icon(Icons.shopping_bag, color: Colors.amber),
                      ],
                    ),
                  ),

                  // Cart Items
                  Expanded(
                    child: pos.cart.isEmpty
                        ? const Center(child: Text('No items in cart yet', style: TextStyle(color: Colors.white54)))
                        : ListView.separated(
                            padding: const EdgeInsets.all(12),
                            itemCount: pos.cart.length,
                            separatorBuilder: (_, __) => const Divider(color: Colors.white12),
                            itemBuilder: (context, idx) {
                              final item = pos.cart[idx];
                              return Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                        Text('Rs. ${item.price.toInt()} each', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove_circle_outline, color: Colors.white70, size: 20),
                                        onPressed: () => pos.updateCartQuantity(item.menuItemId, -1),
                                      ),
                                      Text('${item.quantity}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                      IconButton(
                                        icon: const Icon(Icons.add_circle_outline, color: Colors.white70, size: 20),
                                        onPressed: () => pos.updateCartQuantity(item.menuItemId, 1),
                                      ),
                                    ],
                                  ),
                                ],
                              );
                            },
                          ),
                  ),

                  // Cart Subtotal & Review Button
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(color: Color(0xFF0F172A), border: Border(top: BorderSide(color: Colors.white12))),
                    child: Column(
                      children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          const Text('Subtotal:', style: TextStyle(color: Colors.white70)),
                          Text('Rs. ${pos.cartSubtotal.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ]),
                        const SizedBox(height: 4),
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          const Text('13% Nepal VAT:', style: TextStyle(color: Colors.white70)),
                          Text('Rs. ${pos.cartVatAmount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ]),
                        const Divider(color: Colors.white24, height: 16),
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          const Text('Total:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          Text('Rs. ${pos.cartGrandTotal.toStringAsFixed(2)}', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
                        ]),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
                            onPressed: pos.cart.isEmpty
                                ? null
                                : () => Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => OrderReviewScreen(table: widget.table)),
                                    ),
                            icon: const Icon(Icons.arrow_forward, color: Colors.black),
                            label: const Text('PROCEED TO REVIEW', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
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
}
