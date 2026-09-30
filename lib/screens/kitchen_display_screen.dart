// lib/screens/kitchen_display_screen.dart

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
  String _filter = 'all'; // 'all', 'pending', 'preparing', 'served'

  @override
  void initState() {
    super.initState();
    // Update elapsed minutes counter every 30 seconds
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
    if (diff.inHours > 0) return '${diff.inHours}h ${diff.inMinutes % 60}m ago';
    return '${diff.inMinutes}m ago';
  }

  Color _getTimerColor(DateTime timestamp) {
    final minutes = DateTime.now().difference(timestamp).inMinutes;
    if (minutes >= 20) return const Color(0xFFEF4444); // Urgent red
    if (minutes >= 10) return const Color(0xFFF59E0B); // Amber warning
    return const Color(0xFF10B981); // Normal green
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    // Exclude paid orders from active kitchen queue
    final activeOrders = pos.activeOrders
        .where((o) => o.status != OrderStatus.paid)
        .where((o) => _filter == 'all' || o.status.name == _filter)
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Dark Kitchen Terminal Slate
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Row(
          children: [
            const Icon(Icons.soup_kitchen_rounded, color: Color(0xFFFF9800)),
            const SizedBox(width: 10),
            const Text(
              'Kitchen Display System (KDS)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const Spacer(),
            // Filter Chips
            _buildFilterChip('All', 'all'),
            const SizedBox(width: 6),
            _buildFilterChip('Pending', 'pending', badgeColor: const Color(0xFFEF4444)),
            const SizedBox(width: 6),
            _buildFilterChip('Cooking', 'preparing', badgeColor: const Color(0xFFF59E0B)),
            const SizedBox(width: 6),
            _buildFilterChip('Ready', 'served', badgeColor: const Color(0xFF10B981)),
          ],
        ),
      ),
      body: activeOrders.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline, size: 64, color: Colors.white.withOpacity(0.3)),
                  const SizedBox(height: 12),
                  const Text(
                    'All Kitchen Tickets Cleared!',
                    style: TextStyle(color: Colors.white70, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Incoming orders from waiters will appear here in real-time.',
                    style: TextStyle(color: Colors.white38, fontSize: 13),
                  ),
                ],
              ),
            )
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3, // 3 columns for tablet/kitchen screen, 1-2 on mobile
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              itemCount: activeOrders.length,
              itemBuilder: (context, index) {
                final order = activeOrders[index];
                return _buildOrderTicket(context, order, pos);
              },
            ),
    );
  }

  Widget _buildFilterChip(String label, String value, {Color? badgeColor}) {
    final isSelected = _filter == value;
    return InkWell(
      onTap: () => setState(() => _filter = value),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFF9800) : const Color(0xFF334155),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.black : Colors.white70,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildOrderTicket(BuildContext context, OrderModel order, PosProvider pos) {
    final isPending = order.status == OrderStatus.pending;
    final isPreparing = order.status == OrderStatus.preparing;
    final isServed = order.status == OrderStatus.served;

    Color borderColor;
    if (isPending) {
      borderColor = const Color(0xFFEF4444);
    } else if (isPreparing) {
      borderColor = const Color(0xFFF59E0B);
    } else {
      borderColor = const Color(0xFF10B981);
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 2),
        boxShadow: [
          BoxShadow(
            color: borderColor.withOpacity(0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header: Table Number & Elapsed Timer
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: borderColor.withOpacity(0.12),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.black45,
                      child: Text(
                        'T${order.tableNumber}',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Table #${order.tableNumber}',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
                // Elapsed Timer Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black45,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _getTimerColor(order.timestamp), width: 1),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.timer_outlined, size: 13, color: _getTimerColor(order.timestamp)),
                      const SizedBox(width: 4),
                      Text(
                        _formatElapsed(order.timestamp),
                        style: TextStyle(
                          color: _getTimerColor(order.timestamp),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Items List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: order.itemsList.length,
              separatorBuilder: (_, __) => const Divider(color: Colors.white10, height: 12),
              itemBuilder: (context, idx) {
                final item = order.itemsList[idx];
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFF9800).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            '${item.quantity}x',
                            style: const TextStyle(color: Color(0xFFFF9800), fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.name,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                    if (item.specialInstructions != null && item.specialInstructions!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(left: 32, top: 4),
                        child: Text(
                          'Note: "${item.specialInstructions}"',
                          style: const TextStyle(color: Color(0xFFFBBF24), fontStyle: FontStyle.italic, fontSize: 12),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),

          // Kitchen Note
          if (order.kitchenNote != null && order.kitchenNote!.isNotEmpty)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
              ),
              child: Text(
                'Note: ${order.kitchenNote}',
                style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),

          // Action Status Button
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: isPending
                ? ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () => pos.updateOrderStatus(order.orderId, OrderStatus.preparing),
                    icon: const Icon(Icons.whatshot, size: 18),
                    label: const Text('MARK COOKING', style: TextStyle(fontWeight: FontWeight.bold)),
                  )
                : isPreparing
                    ? ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => pos.updateOrderStatus(order.orderId, OrderStatus.served),
                        icon: const Icon(Icons.done_all, size: 18),
                        label: const Text('MARK READY TO SERVE', style: TextStyle(fontWeight: FontWeight.bold)),
                      )
                    : ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BillingCheckoutScreen(order: order),
                            ),
                          );
                        },
                        icon: const Icon(Icons.receipt_long, size: 18),
                        label: const Text('CHECKOUT & BILL', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
          ),
        ],
      ),
    );
  }
}
