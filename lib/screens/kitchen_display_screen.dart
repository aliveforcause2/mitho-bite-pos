// lib/screens/kitchen_display_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';

class KitchenDisplayScreen extends StatelessWidget {
  const KitchenDisplayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final activeOrders = pos.activeOrders;
    final isWide = MediaQuery.of(context).size.width > 600;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Row(
          children: [
            const Icon(Icons.soup_kitchen_rounded, color: Color(0xFFF59E0B)),
            const SizedBox(width: 8),
            const Text(
              'Kitchen Display (KDS)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${activeOrders.length} LIVE KOT',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
              ),
            ),
          ],
        ),
      ),
      body: activeOrders.isEmpty
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle_outline_rounded, size: 64, color: Color(0xFF10B981)),
                  SizedBox(height: 12),
                  Text('All Kitchen Orders Cleared!', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  Text('New KOT tickets will appear here automatically', style: TextStyle(color: Colors.white54, fontSize: 12)),
                ],
              ),
            )
          : GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: isWide ? 3 : 1,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: isWide ? 0.95 : 1.45,
              ),
              itemCount: activeOrders.length,
              itemBuilder: (context, index) {
                final order = activeOrders[index];
                final elapsedMins = DateTime.now().difference(order.timestamp).inMinutes;

                Color statusColor = const Color(0xFFEF4444);
                String statusLabel = 'NEW / PENDING';
                if (order.status == OrderStatus.preparing) {
                  statusColor = const Color(0xFFF59E0B);
                  statusLabel = 'COOKING NOW';
                } else if (order.status == OrderStatus.served) {
                  statusColor = const Color(0xFF10B981);
                  statusLabel = 'READY TO SERVE';
                }

                return Card(
                  color: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: statusColor, width: 2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // KOT Header: Table, Order ID & Timer
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F172A),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFF334155)),
                                  ),
                                  child: Text(
                                    'TABLE T-${order.tableNumber}',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text('#${order.orderId}', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                              decoration: BoxDecoration(
                                color: elapsedMins > 15 ? Colors.red.shade900 : Colors.black45,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.timer_outlined, size: 12, color: elapsedMins > 15 ? Colors.redAccent : Colors.amber),
                                  const SizedBox(width: 3),
                                  Text(
                                    '${elapsedMins}m ago',
                                    style: TextStyle(
                                      color: elapsedMins > 15 ? Colors.redAccent : Colors.amber,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),

                        // Waiter / Server Name
                        Row(
                          children: [
                            const Icon(Icons.person_pin_rounded, color: Color(0xFFF59E0B), size: 14),
                            const SizedBox(width: 4),
                            Text(
                              'Server: ${order.serverName ?? "Bikash Shrestha"}',
                              style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white12, height: 12),

                        // Order Items List
                        Expanded(
                          child: ListView.builder(
                            itemCount: order.itemsList.length,
                            itemBuilder: (ctx, i) {
                              final item = order.itemsList[i];
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF334155),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        '${item.quantity}x',
                                        style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        item.name,
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),

                        // Kitchen Special Note if any
                        if (order.kitchenNote != null && order.kitchenNote!.isNotEmpty)
                          Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.edit_note_rounded, color: Color(0xFFF59E0B), size: 14),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    'Note: ${order.kitchenNote}',
                                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontStyle: FontStyle.italic),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Cook / Chef Selector
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.soup_kitchen_rounded, color: Color(0xFFF59E0B), size: 14),
                                  SizedBox(width: 4),
                                  Text('Cook / Chef:', style: TextStyle(color: Colors.white70, fontSize: 11)),
                                ],
                              ),
                              DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: order.cookName ?? pos.chefList.first,
                                  dropdownColor: const Color(0xFF1E293B),
                                  icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 16),
                                  items: pos.chefList.map((chef) {
                                    return DropdownMenuItem(
                                      value: chef,
                                      child: Text(chef, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                    );
                                  }).toList(),
                                  onChanged: (newChef) {
                                    if (newChef != null) pos.assignCookToOrder(order.orderId, newChef);
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Status Stepper Buttons
                        Row(
                          children: [
                            if (order.status == OrderStatus.pending)
                              Expanded(
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFF59E0B),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                  icon: const Icon(Icons.local_fire_department_rounded, color: Colors.black, size: 16),
                                  label: const Text('Start Cooking', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                                  onPressed: () => pos.updateOrderStatus(order.orderId, OrderStatus.preparing),
                                ),
                              )
                            else if (order.status == OrderStatus.preparing)
                              Expanded(
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF10B981),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                  icon: const Icon(Icons.check_circle_rounded, color: Colors.white, size: 16),
                                  label: const Text('Mark Food Ready', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                  onPressed: () => pos.updateOrderStatus(order.orderId, OrderStatus.served),
                                ),
                              )
                            else
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFF10B981)),
                                  ),
                                  child: const Text('READY AT PICKUP COUNTER', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11)),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
