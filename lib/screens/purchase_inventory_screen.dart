// lib/screens/purchase_inventory_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/supplier_model.dart';

class PurchaseInventoryScreen extends StatefulWidget {
  const PurchaseInventoryScreen({super.key});

  @override
  State<PurchaseInventoryScreen> createState() => _PurchaseInventoryScreenState();
}

class _PurchaseInventoryScreenState extends State<PurchaseInventoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Suppliers & Purchases (खरिद हिसाब)',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFF59E0B),
          labelColor: const Color(0xFFF59E0B),
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(icon: Icon(Icons.shopping_bag_rounded), text: 'Purchase Entries'),
            Tab(icon: Icon(Icons.people_alt_rounded), text: 'Suppliers List'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPurchasesTab(context, pos),
          _buildSuppliersTab(context, pos),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFF59E0B),
        icon: const Icon(Icons.add, color: Colors.black),
        label: Text(
          _tabController.index == 0 ? 'New Purchase' : 'Add Supplier',
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        onPressed: () {
          if (_tabController.index == 0) {
            _showAddPurchaseDialog(context, pos);
          } else {
            _showAddSupplierDialog(context, pos);
          }
        },
      ),
    );
  }

  Widget _buildPurchasesTab(BuildContext context, PosProvider pos) {
    final purchases = pos.purchases;
    final totalSpent = pos.totalPurchasesToday;

    return Column(
      children: [
        // Summary Header
        Container(
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF334155)]),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Purchases Today', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(
                    'Rs. ${totalSpent.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: Color(0xFFF59E0B)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black38,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${purchases.length} Invoices',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),
        ),
        // List
        Expanded(
          child: purchases.isEmpty
              ? const Center(child: Text('No purchase records yet.', style: TextStyle(color: Colors.white54)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: purchases.length,
                  itemBuilder: (context, index) {
                    final p = purchases[index];
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.receipt_long_rounded, color: Color(0xFFF59E0B)),
                        ),
                        title: Text(p.itemName, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        subtitle: Text(
                          '${p.supplierName} • ${p.quantity} ${p.unit} @ Rs. ${p.rate}/${p.unit}\nInv: ${p.invoiceNumber}',
                          style: const TextStyle(color: Colors.white60, fontSize: 12),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Rs. ${p.totalAmount.toStringAsFixed(0)}',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981), fontSize: 15),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                p.paymentStatus,
                                style: const TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSuppliersTab(BuildContext context, PosProvider pos) {
    final suppliers = pos.suppliers;
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: suppliers.length,
      itemBuilder: (context, index) {
        final s = suppliers[index];
        return Card(
          color: const Color(0xFF1E293B),
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(s.category, style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text('👤 Contact: ${s.contactPerson}  |  📞 ${s.phone}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                Text('📍 Address: ${s.address}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                const Divider(color: Colors.white12, height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Due / Outstanding:', style: TextStyle(color: Colors.white60, fontSize: 12)),
                    Text(
                      'Rs. ${s.outstandingBalance.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: s.outstandingBalance > 0 ? const Color(0xFFEF4444) : Colors.greenAccent,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showAddPurchaseDialog(BuildContext context, PosProvider pos) {
    String itemName = '';
    String supplier = pos.suppliers.isNotEmpty ? pos.suppliers.first.name : 'Local Market';
    int qty = 10;
    double rate = 250.0;
    String unit = 'kg';
    String invNo = 'INV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Add Purchase Record', style: TextStyle(color: Colors.white)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Item / Material (e.g. Buff Mince, Onions, Oil)', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => itemName = val,
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: supplier,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Supplier', labelStyle: TextStyle(color: Colors.white70)),
                  items: pos.suppliers.map((s) => DropdownMenuItem(value: s.name, child: Text(s.name))).toList(),
                  onChanged: (val) => setState(() => supplier = val ?? supplier),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        initialValue: '$qty',
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Quantity', labelStyle: TextStyle(color: Colors.white70)),
                        onChanged: (val) => qty = int.tryParse(val) ?? qty,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        initialValue: unit,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Unit (kg/ltr/pcs)', labelStyle: TextStyle(color: Colors.white70)),
                        onChanged: (val) => unit = val,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        initialValue: '$rate',
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Rate (Rs.)', labelStyle: TextStyle(color: Colors.white70)),
                        onChanged: (val) => rate = double.tryParse(val) ?? rate,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: invNo,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Bill / Invoice Number', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => invNo = val,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
            ElevatedButton(
              style: ElevatedButton.backgroundColor(const Color(0xFFF59E0B)),
              onPressed: () {
                if (itemName.trim().isNotEmpty) {
                  pos.addPurchase(
                    PurchaseEntry(
                      id: 'pur-${DateTime.now().millisecondsSinceEpoch}',
                      supplierName: supplier,
                      itemName: itemName.trim(),
                      quantity: qty,
                      unit: unit,
                      rate: rate,
                      totalAmount: qty * rate,
                      invoiceNumber: invNo,
                      date: DateTime.now(),
                    ),
                  );
                  Navigator.pop(ctx);
                }
              },
              child: const Text('Save Purchase', style: TextStyle(color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddSupplierDialog(BuildContext context, PosProvider pos) {
    String name = '';
    String contact = '';
    String phone = '';
    String address = 'Kathmandu';
    String category = 'Meat & Poultry';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Add New Supplier', style: TextStyle(color: Colors.white)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Supplier / Business Name', labelStyle: TextStyle(color: Colors.white70)),
                onChanged: (val) => name = val,
              ),
              const SizedBox(height: 8),
              TextField(
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Contact Person Name', labelStyle: TextStyle(color: Colors.white70)),
                onChanged: (val) => contact = val,
              ),
              const SizedBox(height: 8),
              TextField(
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Phone Number', labelStyle: TextStyle(color: Colors.white70)),
                onChanged: (val) => phone = val,
              ),
              const SizedBox(height: 8),
              TextField(
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Category (Dairy, Meat, Veg, Beverage)', labelStyle: TextStyle(color: Colors.white70)),
                onChanged: (val) => category = val,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          ElevatedButton(
            style: ElevatedButton.backgroundColor(const Color(0xFF10B981)),
            onPressed: () {
              if (name.trim().isNotEmpty) {
                pos.addSupplier(
                  SupplierModel(
                    id: 'sup-${DateTime.now().millisecondsSinceEpoch}',
                    name: name.trim(),
                    contactPerson: contact.trim(),
                    phone: phone.trim(),
                    address: address,
                    category: category,
                  ),
                );
                Navigator.pop(ctx);
              }
            },
            child: const Text('Save Supplier', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
