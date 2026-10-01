// lib/screens/billing_checkout_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';
import '../widgets/nepali_payment_dialog.dart';
import '../widgets/thermal_receipt_dialog.dart';

class BillingCheckoutScreen extends StatefulWidget {
  final OrderModel order;
  const BillingCheckoutScreen({super.key, required this.order});

  @override
  State<BillingCheckoutScreen> createState() => _BillingCheckoutScreenState();
}

class _BillingCheckoutScreenState extends State<BillingCheckoutScreen> {
  double _discountPercent = 0.0;

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final profile = pos.profile;

    final double subtotal = widget.order.subtotal;
    final double discountAmount = subtotal * (_discountPercent / 100.0);
    final double discountedSubtotal = subtotal - discountAmount;
    final double serviceCharge = discountedSubtotal * (profile.serviceChargeRate / 100.0);
    final double taxableAmount = discountedSubtotal + serviceCharge;
    final double vatAmount = profile.isPanEnabled ? (taxableAmount * (profile.vatRate / 100.0)) : 0.0;
    final double grandTotal = taxableAmount + vatAmount;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 2,
        title: Text(
          'Invoice - Table T-${widget.order.tableNumber}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
        ),
        actions: [
          IconButton(
            tooltip: 'Preview Thermal Receipt',
            icon: const Icon(Icons.receipt_long_rounded, color: Color(0xFFF59E0B)),
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => ThermalReceiptDialog(
                  order: widget.order,
                  profile: profile,
                  grandTotal: grandTotal,
                  discountPercent: _discountPercent,
                  paymentMethod: 'Cash (Unsettled)',
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bill Header Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  Text(
                    profile.restaurantName,
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 2),
                  Text(profile.address, style: const TextStyle(fontSize: 11, color: Colors.white60)),
                  if (profile.isPanEnabled)
                    Text(
                      'PAN/VAT No: ${profile.panVatNumber}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                    ),
                  const Divider(color: Colors.white12, height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Order #${widget.order.orderId}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                      Text('Table T-${widget.order.tableNumber}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Server: ${widget.order.serverName ?? "Bikash"}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.w600)),
                      Text('Cook: ${widget.order.cookName ?? "Chef Ram"}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Order Items Table
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Order Items', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  ...widget.order.itemsList.map((item) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${item.name} x${item.quantity}',
                              style: const TextStyle(color: Colors.white70, fontSize: 12.5),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            'Rs. ${item.lineTotal.toStringAsFixed(2)}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12.5),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Discount Chips
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Apply Discount', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [0.0, 5.0, 10.0, 15.0, 20.0].map((rate) {
                        final isSelected = _discountPercent == rate;
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            label: Text('${rate.toInt()}%'),
                            selected: isSelected,
                            selectedColor: const Color(0xFFF59E0B),
                            backgroundColor: const Color(0xFF0F172A),
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.black : Colors.white70,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 11,
                            ),
                            onSelected: (val) {
                              if (val) setState(() => _discountPercent = rate);
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Financial Breakdown
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  _billRow('Subtotal', 'Rs. ${subtotal.toStringAsFixed(2)}'),
                  if (_discountPercent > 0)
                    _billRow('Discount (${_discountPercent.toInt()}%)', '- Rs. ${discountAmount.toStringAsFixed(2)}', color: const Color(0xFF10B981)),
                  if (profile.serviceChargeRate > 0)
                    _billRow('Service Charge (${profile.serviceChargeRate.toInt()}%)', 'Rs. ${serviceCharge.toStringAsFixed(2)}'),
                  if (profile.isPanEnabled)
                    _billRow('Nepal VAT (${profile.vatRate.toInt()}%)', 'Rs. ${vatAmount.toStringAsFixed(2)}'),
                  const Divider(color: Colors.white24, height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Grand Total:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                      Text(
                        'Rs. ${grandTotal.toStringAsFixed(2)}',
                        style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Settle Payment & Thermal Print Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3B82F6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.print_rounded, color: Colors.white, size: 18),
                    label: const Text('Thermal Print', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => ThermalReceiptDialog(
                          order: widget.order,
                          profile: profile,
                          grandTotal: grandTotal,
                          discountPercent: _discountPercent,
                          paymentMethod: 'Cash',
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.payments_rounded, color: Colors.white, size: 18),
                    label: const Text('PAY & FREE TABLE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => NepaliPaymentDialog(
                          orderId: widget.order.orderId,
                          tableNumber: widget.order.tableNumber,
                          totalAmount: grandTotal,
                          onPaymentSuccess: (method, ref) async {
                            await pos.completePaymentAndFreeTable(
                              orderId: widget.order.orderId,
                              tableNumber: widget.order.tableNumber,
                              finalTotal: grandTotal,
                              discountPercent: _discountPercent,
                              paymentMethod: method,
                              transactionRef: ref,
                            );
                            if (mounted) {
                              Navigator.pop(context); // Close dialog
                              Navigator.pop(context); // Back to floor plan
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Payment Rs. ${grandTotal.toStringAsFixed(2)} via $method recorded! Table T-${widget.order.tableNumber} is now free.'),
                                  backgroundColor: const Color(0xFF10B981),
                                ),
                              );
                            }
                          },
                          onSplitSuccess: (cash, digital, wallet, ref) async {
                            await pos.completePaymentAndFreeTable(
                              orderId: widget.order.orderId,
                              tableNumber: widget.order.tableNumber,
                              finalTotal: grandTotal,
                              discountPercent: _discountPercent,
                              paymentMethod: 'Split (Cash + $wallet)',
                              transactionRef: ref,
                              isSplit: true,
                              splitCash: cash,
                              splitDigital: digital,
                              splitWallet: wallet,
                            );
                            if (mounted) {
                              Navigator.pop(context);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Split payment: Rs. ${cash.toStringAsFixed(0)} Cash + Rs. ${digital.toStringAsFixed(0)} $wallet settled! Table T-${widget.order.tableNumber} is now free.'),
                                  backgroundColor: const Color(0xFF10B981),
                                ),
                              );
                            }
                          },
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _billRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12.5)),
          Text(value, style: TextStyle(color: color ?? Colors.white, fontWeight: FontWeight.w600, fontSize: 12.5)),
        ],
      ),
    );
  }
}
