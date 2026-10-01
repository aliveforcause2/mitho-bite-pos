// lib/screens/menu_management_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/menu_item.dart';

class MenuManagementScreen extends StatefulWidget {
  const MenuManagementScreen({super.key});

  @override
  State<MenuManagementScreen> createState() => _MenuManagementScreenState();
}

class _MenuManagementScreenState extends State<MenuManagementScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'All';

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
    final items = pos.menuItems.where((item) {
      final matchesCat = _selectedCategory == 'All' || item.category == _selectedCategory;
      final matchesSearch = item.name.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Menu & Food Management',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_rounded, color: Color(0xFF10B981), size: 28),
            tooltip: 'Add New Food Item',
            onPressed: () => _showAddEditItemDialog(context, pos),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search food dishes...',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFF59E0B)),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          // Category Filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8, bottom: 10),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: const Color(0xFFF59E0B),
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.black : Colors.white70,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          // Item List
          Expanded(
            child: items.isEmpty
                ? const Center(
                    child: Text('No food items found.', style: TextStyle(color: Colors.white54)),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _buildItemTile(context, pos, item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemTile(BuildContext context, PosProvider pos, MenuItem item) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: item.isAvailable ? Colors.transparent : Colors.red.withOpacity(0.5),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Image Preview / Icon
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: 65,
                height: 65,
                color: const Color(0xFF334155),
                child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                    ? Image.network(
                        item.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.restaurant, color: Color(0xFFF59E0B)),
                      )
                    : const Icon(Icons.restaurant, color: Color(0xFFF59E0B), size: 30),
              ),
            ),
            const SizedBox(width: 12),
            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          border: Border.all(color: item.isVeg ? Colors.green : Colors.red, width: 1.5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Icon(
                          Icons.circle,
                          size: 8,
                          color: item.isVeg ? Colors.green : Colors.red,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          item.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Selling: Rs. ${item.price.toStringAsFixed(0)}  •  Cost: Rs. ${item.costPrice.toStringAsFixed(0)}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFFF59E0B), fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Category: ${item.category}  |  Stock: ${item.stockQuantity}',
                    style: const TextStyle(fontSize: 11, color: Colors.white54),
                  ),
                ],
              ),
            ),
            // Actions
            Column(
              children: [
                Switch(
                  value: item.isAvailable,
                  activeColor: const Color(0xFF10B981),
                  onChanged: (_) => pos.toggleItemAvailability(item.id),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit_rounded, color: Color(0xFF3B82F6), size: 20),
                      tooltip: 'Edit Item & Photo',
                      onPressed: () => _showAddEditItemDialog(context, pos, item: item),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                      tooltip: 'Delete Item',
                      onPressed: () => _confirmDeleteItem(context, pos, item),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddEditItemDialog(BuildContext context, PosProvider pos, {MenuItem? item}) {
    final isEditing = item != null;
    String name = item?.name ?? '';
    String category = item?.category ?? 'Mo:Mo Specials';
    double price = item?.price ?? 150.0;
    double cost = item?.costPrice ?? 60.0;
    int stock = item?.stockQuantity ?? 30;
    String imageUrl = item?.imageUrl ?? '';
    String description = item?.description ?? '';
    bool isVeg = item?.isVeg ?? false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text(isEditing ? 'Edit Food Item' : 'Add New Food Item', style: const TextStyle(color: Colors.white)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  initialValue: name,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Dish Name (Nepali/English)', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => name = val,
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: category,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Category', labelStyle: TextStyle(color: Colors.white70)),
                  items: _categories.where((c) => c != 'All').map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (val) => setState(() => category = val ?? category),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        initialValue: '$price',
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Selling Price (Rs.)', labelStyle: TextStyle(color: Colors.white70)),
                        onChanged: (val) => price = double.tryParse(val) ?? price,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        initialValue: '$cost',
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Cost Price (Rs.)', labelStyle: TextStyle(color: Colors.white70)),
                        onChanged: (val) => cost = double.tryParse(val) ?? cost,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: '$stock',
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Daily Stock Qty', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => stock = int.tryParse(val) ?? stock,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: imageUrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Photo Image URL (HTTPS Link)',
                    labelStyle: TextStyle(color: Colors.white70),
                    hintText: 'https://...',
                    hintStyle: TextStyle(color: Colors.white30),
                  ),
                  onChanged: (val) => imageUrl = val,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: description,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Ingredients / Description', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => description = val,
                ),
                const SizedBox(height: 10),
                CheckboxListTile(
                  title: const Text('Pure Vegetarian (शाकाहारी)', style: TextStyle(color: Colors.white)),
                  value: isVeg,
                  activeColor: Colors.green,
                  onChanged: (val) => setState(() => isVeg = val ?? false),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.backgroundColor(const Color(0xFFF59E0B)),
              onPressed: () {
                if (name.trim().isNotEmpty) {
                  final newItem = MenuItem(
                    id: isEditing ? item.id : 'item-${DateTime.now().millisecondsSinceEpoch}',
                    name: name.trim(),
                    category: category,
                    price: price,
                    costPrice: cost,
                    stockQuantity: stock,
                    imageUrl: imageUrl.trim().isNotEmpty ? imageUrl.trim() : null,
                    description: description.trim().isNotEmpty ? description.trim() : null,
                    isVeg: isVeg,
                  );
                  if (isEditing) {
                    pos.updateMenuItem(newItem);
                  } else {
                    pos.addMenuItem(newItem);
                  }
                  Navigator.pop(ctx);
                }
              },
              child: Text(isEditing ? 'Update Dish' : 'Save Dish', style: const TextStyle(color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteItem(BuildContext context, PosProvider pos, MenuItem item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Delete ${item.name}?', style: const TextStyle(color: Colors.white)),
        content: const Text('Are you sure you want to permanently remove this dish from the menu?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          ElevatedButton(
            style: ElevatedButton.backgroundColor(const Color(0xFFEF4444)),
            onPressed: () {
              pos.deleteMenuItem(item.id);
              Navigator.pop(ctx);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
