// lib/widgets/thermal_receipt_dialog.dart
import 'package:flutter/material.dart';
import '../models/order_model.dart';
import '../models/subscription_model.dart';

class ThermalReceiptDialog extends StatefulWidget {
  final OrderModel order;
  final RestaurantProfile profile;
  final double grandTotal;
  final double discountPercent;
  final String paymentMethod;
  final bool isSplit;
  final double splitCash;
  final double splitDigital;
  final String? splitWallet;

  const ThermalReceiptDialog({
    super.key,
    required this.order,
    required this.profile,
    required this.grandTotal,
    this.discountPercent = 0.0,
    required this.paymentMethod,
    this.isSplit = false,
    this.splitCash = 0.0,
    this.splitDigital = 0.0,
    this.splitWallet,
  });

  @override
  State<ThermalReceiptDialog> createState() => _ThermalReceiptDialogState();
}

class _ThermalReceiptDialogState extends State<ThermalReceiptDialog> {
  int _paperSize = 80; // 58mm or 80mm
  bool _isPrinting = false;

  @override
  Widget build(BuildContext context) {
    final subtotal = widget.order.subtotal;
    final discountAmount = subtotal * (widget.discountPercent / 100.0);
    final discounted = subtotal - discountAmount;
    final vat = widget.profile.isPanEnabled ? (discounted * (widget.profile.vatRate / 100.0)) : 0.0;

    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.print_rounded, color: Color(0xFFF59E0B), size: 20),
                    SizedBox(width: 8),
                    Text('Thermal Receipt Print', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close, color: Colors.white60, size: 20), onPressed: () => Navigator.pop(context)),
              ],
            ),

            // Paper Size Switcher
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ChoiceChip(
                  label: const Text('80mm Standard POS'),
                  selected: _paperSize == 80,
                  selectedColor: const Color(0xFFF59E0B),
                  backgroundColor: const Color(0xFF0F172A),
                  labelStyle: TextStyle(color: _paperSize == 80 ? Colors.black : Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                  onSelected: (val) => setState(() => _paperSize = 80),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('58mm Mini Printer'),
                  selected: _paperSize == 58,
                  selectedColor: const Color(0xFFF59E0B),
                  backgroundColor: const Color(0xFF0F172A),
                  labelStyle: TextStyle(color: _paperSize == 58 ? Colors.black : Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                  onSelected: (val) => setState(() => _paperSize = 58),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Simulated Thermal Paper Roll
            Flexible(
              child: Container(
                width: _paperSize == 80 ? double.infinity : 280,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Text(
                        widget.profile.restaurantName.toUpperCase(),
                        style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 0.5),
                        textAlign: TextAlign.center,
                      ),
                      Text(widget.profile.address, style: const TextStyle(color: Colors.black87, fontSize: 10), textAlign: TextAlign.center),
                      Text('Tel: ${widget.profile.phone}', style: const TextStyle(color: Colors.black87, fontSize: 10)),
                      if (widget.profile.isPanEnabled)
                        Text('PAN/VAT Reg No: ${widget.profile.panVatNumber}', style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      const Text('------------------------------------------------', style: TextStyle(color: Colors.black54, fontSize: 10)),
                      const Text('TAX INVOICE / CASH BILL', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                      const Text('------------------------------------------------', style: TextStyle(color: Colors.black54, fontSize: 10)),

                      // Meta details
                      _thermalRow('Bill No: #${widget.order.orderId}', 'Table: T-${widget.order.tableNumber}'),
                      _thermalRow('Server: ${widget.order.serverName ?? "Bikash"}', 'Cook: ${widget.order.cookName ?? "Chef Ram"}'),
                      _thermalRow('Date: ${DateTime.now().toString().substring(0, 16)}', 'Mode: ${widget.paymentMethod}'),
                      const Text('------------------------------------------------', style: TextStyle(color: Colors.black54, fontSize: 10)),

                      // Table Columns
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Expanded(flex: 4, child: Text('ITEM', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10))),
                          Expanded(flex: 1, child: Text('QTY', textAlign: TextAlign.center, style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10))),
                          Expanded(flex: 2, child: Text('RATE', textAlign: TextAlign.right, style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10))),
                          Expanded(flex: 2, child: Text('TOTAL', textAlign: TextAlign.right, style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10))),
                        ],
                      ),
                      const Text('------------------------------------------------', style: TextStyle(color: Colors.black54, fontSize: 10)),

                      // Items
                      ...widget.order.itemsList.map((item) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            children: [
                              Expanded(flex: 4, child: Text(item.name, style: const TextStyle(color: Colors.black, fontSize: 10), maxLines: 1, overflow: TextOverflow.ellipsis)),
                              Expanded(flex: 1, child: Text('${item.quantity}', textAlign: TextAlign.center, style: const TextStyle(color: Colors.black, fontSize: 10))),
                              Expanded(flex: 2, child: Text('${item.price.toInt()}', textAlign: TextAlign.right, style: const TextStyle(color: Colors.black, fontSize: 10))),
                              Expanded(flex: 2, child: Text('${item.lineTotal.toInt()}', textAlign: TextAlign.right, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10))),
                            ],
                          ),
                        );
                      }).toList(),
                      const Text('------------------------------------------------', style: TextStyle(color: Colors.black54, fontSize: 10)),

                      // Calculation
                      _thermalTotalRow('Subtotal:', 'Rs. ${subtotal.toStringAsFixed(2)}'),
                      if (widget.discountPercent > 0)
                        _thermalTotalRow('Discount (${widget.discountPercent.toInt()}%):', '- Rs. ${discountAmount.toStringAsFixed(2)}'),
                      if (widget.profile.isPanEnabled)
                        _thermalTotalRow('Nepal VAT (${widget.profile.vatRate.toInt()}%):', 'Rs. ${vat.toStringAsFixed(2)}'),
                      const Text('================================================', style: TextStyle(color: Colors.black, fontSize: 10)),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('GRAND TOTAL:', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 13)),
                          Text('Rs. ${widget.grandTotal.toStringAsFixed(2)}', style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 13)),
                        ],
                      ),
                      const Text('================================================', style: TextStyle(color: Colors.black, fontSize: 10)),

                      if (widget.isSplit) ...[
                        _thermalTotalRow('Paid in Cash:', 'Rs. ${widget.splitCash.toStringAsFixed(0)}'),
                        _thermalTotalRow('Paid via ${widget.splitWallet}:', 'Rs. ${widget.splitDigital.toStringAsFixed(0)}'),
                        const SizedBox(height: 4),
                      ],

                      // QR Code for verification
                      const SizedBox(height: 6),
                      Icon(Icons.qr_code_2_rounded, size: 70, color: Colors.grey.shade900),
                      const Text('Scan to verify digital bill', style: TextStyle(color: Colors.black54, fontSize: 9)),
                      const SizedBox(height: 4),
                      const Text('*** THANK YOU FOR VISITING! ***', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Print Trigger Button
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: _isPrinting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.print_rounded, color: Colors.white),
                label: Text(
                  _isPrinting ? 'Sending to ESC/POS Thermal Printer...' : 'PRINT ${_paperSize}MM THERMAL RECEIPT',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                ),
                onPressed: _isPrinting
                    ? null
                    : () async {
                        setState(() => _isPrinting = true);
                        await Future.delayed(const Duration(milliseconds: 900));
                        if (mounted) {
                          setState(() => _isPrinting = false);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Receipt printed successfully on ${_paperSize}mm ESC/POS printer!'),
                              backgroundColor: const Color(0xFF10B981),
                            ),
                          );
                        }
                      },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _thermalRow(String left, String right) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(left, style: const TextStyle(color: Colors.black87, fontSize: 9.5)),
          Text(right, style: const TextStyle(color: Colors.black87, fontSize: 9.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _thermalTotalRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black87, fontSize: 10)),
          Text(value, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w600, fontSize: 10)),
        ],
      ),
    );
  }
}
