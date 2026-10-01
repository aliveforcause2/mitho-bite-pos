// lib/screens/sales_report_screen.dart

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
            // Top KPI Cards
            Row(
              children: [
                _buildKpiCard('Gross Sales', 'Rs. ${pos.grossSalesToday.toStringAsFixed(2)}', Colors.blue, '${paidOrders.length} orders'),
                const SizedBox(width: 12),
                _buildKpiCard('13% Nepal VAT', 'Rs. ${pos.vatCollectedToday.toStringAsFixed(2)}', Colors.amber, 'PAN: 601928374'),
                const SizedBox(width: 12),
                _buildKpiCard('Discounts', '- Rs. ${pos.totalDiscountsToday.toStringAsFixed(2)}', Colors.redAccent, 'Promotional'),
                const SizedBox(width: 12),
                _buildKpiCard('Net Total Settled', 'Rs. ${pos.netRevenueToday.toStringAsFixed(2)}', Colors.teal, 'Cash + Digital'),
              ],
            ),
            const SizedBox(height: 20),

            // Payment Channel Breakdown
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
            const SizedBox(height: 20),

            // Settle Orders Ledger & Stock Audit
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Settled Orders Table
                Expanded(
                  flex: 6,
                  child: Card(
                    color: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Paid Orders Ledger (${filteredOrders.length})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                              DropdownButton<String>(
                                value: _selectedPaymentFilter,
                                dropdownColor: const Color(0xFF1E293B),
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                                items: ['All', 'Cash', 'Fonepay', 'eSewa', 'Khalti', 'Card'].map((f) => DropdownMenuItem(value: f, child: Text(f))).toList(),
                                onChanged: (v) => setState(() => _selectedPaymentFilter = v ?? 'All'),
                              ),
                            ],
                          ),
                          const Divider(color: Colors.white24),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: filteredOrders.length,
                            separatorBuilder: (_, __) => const Divider(color: Colors.white12, height: 1),
                            itemBuilder: (context, index) {
                              final o = filteredOrders[index];
                              return ListTile(
                                dense: true,
                                contentPadding: EdgeInsets.zero,
                                title: Text('Table #${o.tableNumber} (${o.orderId})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                subtitle: Text('${o.paymentMethod ?? "Cash"} • Ref: ${o.transactionRef ?? "N/A"}', style: const TextStyle(color: Colors.white60, fontSize: 11)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text('Rs. ${o.totalAmount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 14)),
                                    IconButton(
                                      icon: const Icon(Icons.print_outlined, color: Colors.white70, size: 18),
                                      onPressed: () => showDialog(
                                        context: context,
                                        builder: (_) => ThermalReceiptDialog(order: o),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),

                // Real-time Stock Inventory Audit
                Expanded(
                  flex: 5,
                  child: Card(
                    color: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Live Inventory & Stock Audit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 12),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: pos.menuItems.length,
                            itemBuilder: (context, idx) {
                              final item = pos.menuItems[idx];
                              final isLow = item.isLowStock;
                              final isOut = item.isOutOfStock;

                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(item.name, style: const TextStyle(color: Colors.white, fontSize: 12), overflow: TextOverflow.ellipsis),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isOut ? Colors.red.withOpacity(0.2) : isLow ? Colors.amber.withOpacity(0.2) : Colors.black26,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '${item.stockQuantity} left',
                                        style: TextStyle(
                                          color: isOut ? Colors.red : isLow ? Colors.amber : Colors.white70,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    InkWell(
                                      onTap: () => pos.restockMenuItem(item.id, 10),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                                        child: const Text('+10', style: TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
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
            Text('Rs. ${amount.toStringAsFixed(1)}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            LinearProgressIndicator(value: totalRevenue > 0 ? amount / totalRevenue : 0, color: color, backgroundColor: Colors.white10),
            const SizedBox(height: 2),
            Text('$pct% share', style: const TextStyle(color: Colors.white38, fontSize: 10)),
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
        content: const Text(
          'This will reconcile today\'s cash register, finalize digital wallet collections, audit stock counts, and store the Z-Report to Cloud Firestore.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              await pos.performDayClose();
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Shift Settlement Complete! Z-Report Saved.'), backgroundColor: Color(0xFF10B981)),
                );
              }
            },
            child: const Text('CONFIRM DAY CLOSE', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
