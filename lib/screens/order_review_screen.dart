// lib/screens/order_review_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/table_model.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';
import '../widgets/kot_slip_dialog.dart';
import '../widgets/thermal_receipt_dialog.dart';

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

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Table #${widget.table.tableNumber} - Order Review & Push', style: const TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ordered Items Card
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
                    ...pos.cart.map((item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(6)),
                                child: Text('${item.quantity}x', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                    if (item.specialInstructions != null)
                                      Text('Note: ${item.specialInstructions}', style: const TextStyle(color: Colors.amber, fontSize: 11)),
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
                        hintText: 'e.g. Extra spicy momo achar, pack leftovers, serve dessert later...',
                        hintStyle: const TextStyle(color: Colors.white38),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                      onChanged: (v) => pos.setKitchenNote(v),
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
                    _billRow('Subtotal', 'Rs. ${pos.cartSubtotal.toStringAsFixed(2)}'),
                    _billRow('13% Nepal VAT', 'Rs. ${pos.cartVatAmount.toStringAsFixed(2)}'),
                    const Divider(color: Colors.white24),
                    _billRow('TOTAL PAYABLE', 'Rs. ${pos.cartGrandTotal.toStringAsFixed(2)}', isBold: true, color: Colors.amber),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Send to Kitchen Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: pos.isLoading
                    ? null
                    : () async {
                        final success = await pos.sendOrderToKitchen();
                        if (success && context.mounted) {
                          _showSuccessDialog(context);
                        }
                      },
                icon: pos.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white))
                    : const Icon(Icons.send_rounded, color: Colors.white),
                label: Text(
                  pos.isLoading ? 'DISPATCHING TO FIRESTORE...' : 'SEND TO KITCHEN (PUSH ORDER)',
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
            Text('Order Dispatched!', style: TextStyle(color: Colors.white)),
          ],
        ),
        content: Text(
          'Table #${widget.table.tableNumber} is now Occupied. Order has been sent to the Kitchen Display System and inventory counts have been deducted in real-time.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Back to Floor Plan'),
          ),
        ],
      ),
    );
  }
}
