// lib/screens/table_selection_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/table_model.dart';
import 'menu_ordering_screen.dart';
import 'kitchen_display_screen.dart';
import 'sales_report_screen.dart';
import 'billing_checkout_screen.dart';

class TableSelectionScreen extends StatelessWidget {
  const TableSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final tables = pos.tables;

    final int occupiedCount = tables.where((t) => t.isOccupied).length;
    final int availableCount = tables.where((t) => t.isAvailable).length;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.restaurant_menu, color: Colors.amber),
            SizedBox(width: 8),
            Text('Himalayan POS - Floor Plan', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Kitchen Display (KDS)',
            icon: Badge(
              label: Text('${pos.activeOrders.length}'),
              child: const Icon(Icons.soup_kitchen_rounded),
            ),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const KitchenDisplayScreen())),
          ),
          IconButton(
            tooltip: 'Day Close & Reports',
            icon: const Icon(Icons.bar_chart_rounded),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SalesReportScreen())),
          ),
        ],
      ),
      body: Column(
        children: [
          // Floor Status Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: const Color(0xFF1E293B),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    _legendBadge('Available: $availableCount', const Color(0xFF10B981)),
                    const SizedBox(width: 12),
                    _legendBadge('Occupied: $occupiedCount', const Color(0xFFEF4444)),
                  ],
                ),
                Text('Total: ${tables.length} Tables', style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

          // Table Grid
          Expanded(
            child: tables.isEmpty
                ? const Center(child: CircularProgressIndicator(color: Colors.amber))
                : GridView.builder(
                    padding: const EdgeInsets.all(20),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.1,
                    ),
                    itemCount: tables.length,
                    itemBuilder: (context, index) {
                      final table = tables[index];
                      final isOccupied = table.isOccupied;

                      return GestureDetector(
                        onTap: () {
                          pos.selectTable(table);
                          Navigator.push(context, MaterialPageRoute(builder: (_) => MenuOrderingScreen(table: table)));
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          decoration: BoxDecoration(
                            color: isOccupied ? const Color(0xFF3B1822) : const Color(0xFF132E27),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isOccupied ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                              width: 2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isOccupied ? Colors.red.withOpacity(0.15) : Colors.green.withOpacity(0.15),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Table ${table.tableNumber}',
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isOccupied ? Colors.red.shade900 : Colors.green.shade900,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        isOccupied ? 'BUSY' : 'FREE',
                                        style: TextStyle(
                                          color: isOccupied ? Colors.redAccent : Colors.greenAccent,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Icon(
                                  Icons.table_restaurant_rounded,
                                  size: 40,
                                  color: isOccupied ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('${table.seatingCapacity} Seats', style: const TextStyle(color: Colors.white60, fontSize: 12)),
                                    if (isOccupied)
                                      InkWell(
                                        onTap: () {
                                          final targetOrder = pos.orders.firstWhere(
                                            (o) => o.tableNumber == table.tableNumber && o.status != OrderStatus.paid,
                                          );
                                          Navigator.push(context, MaterialPageRoute(builder: (_) => BillingCheckoutScreen(order: targetOrder)));
                                        },
                                        child: const Text('Checkout >', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _legendBadge(String text, Color color) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
      ],
    );
  }
}
