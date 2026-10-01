// lib/screens/order_review_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/table_model.dart';
import '../providers/pos_provider.dart';

class OrderReviewScreen extends StatefulWidget {
  final TableModel table;
  const OrderReviewScreen({super.key, required this.table});

  @override
  State<OrderReviewScreen> createState() => _OrderReviewScreenState();
}

class _OrderReviewScreenState extends State<OrderReviewScreen> {
  final TextEditingController _noteController = TextEditingController();

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final cartItems = pos.getCartForTable(widget.table.tableNumber);
    final subtotal = pos.getTableCartSubtotal(widget.table.tableNumber);
    final vat = pos.profile.isPanEnabled ? (subtotal * (pos.profile.vatRate / 100.0)) : 0.0;
    final grandTotal = subtotal + vat;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Table #${widget.table.tableNumber} - Order Review', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Items Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Order Items Summary', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    const Divider(color: Colors.white24),
                    if (cartItems.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(12),
                        child: Text('No items in cart for this table.', style: TextStyle(color: Colors.white54)),
                      )
                    else
                      ...cartItems.map((item) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: const Color(0xFFF59E0B), borderRadius: BorderRadius.circular(6)),
                                  child: Text('${item.quantity}x', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                      if (item.specialInstructions != null && item.specialInstructions!.isNotEmpty)
                                        Text('Note: ${item.specialInstructions}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11)),
                                    ],
                                  ),
                                ),
                                Text('Rs. ${(item.price * item.quantity).toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          )),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Chef Special Instructions Box
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Kitchen Instructions & Notes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _noteController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'e.g. Extra spicy momo achar, serve fast...',
                        hintStyle: const TextStyle(color: Colors.white38),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Bill Breakdown
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _billRow('Subtotal', 'Rs. ${subtotal.toStringAsFixed(2)}'),
                    _billRow('${pos.profile.vatRate.toStringAsFixed(0)}% Nepal VAT', 'Rs. ${vat.toStringAsFixed(2)}'),
                    const Divider(color: Colors.white24),
                    _billRow('TOTAL ESTIMATE', 'Rs. ${grandTotal.toStringAsFixed(2)}', isBold: true, color: const Color(0xFFF59E0B)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Send to Kitchen Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: pos.isLoading || cartItems.isEmpty
                    ? null
                    : () async {
                        final success = await pos.sendKOTToKitchen(
                          widget.table.tableNumber,
                          kitchenNote: _noteController.text.trim().isNotEmpty ? _noteController.text.trim() : null,
                        );
                        if (success && context.mounted) {
                          _showSuccessDialog(context);
                        }
                      },
                icon: pos.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send_rounded, color: Colors.white),
                label: Text(
                  pos.isLoading ? 'SENDING ORDER...' : 'SEND TO KITCHEN (PUSH KOT)',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _billRow(String label, String value, {bool isBold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.white70, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(value, style: TextStyle(color: color ?? Colors.white, fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: isBold ? 16 : 14)),
        ],
      ),
    );
  }

  void _showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Color(0xFF10B981)),
            SizedBox(width: 8),
            Text('Order Sent to Kitchen!', style: TextStyle(color: Colors.white)),
          ],
        ),
        content: Text(
          'Table #${widget.table.tableNumber} order has been sent to the Kitchen Display System (KDS).',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.pop(context); // close review
              Navigator.pop(context); // back to floor plan
            },
            child: const Text('Back to Floor Plan', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
