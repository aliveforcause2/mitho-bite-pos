// lib/widgets/thermal_receipt_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/order_model.dart';

class ThermalReceiptDialog extends StatefulWidget {
  final OrderModel order;
  const ThermalReceiptDialog({super.key, required this.order});

  @override
  State<ThermalReceiptDialog> createState() => _ThermalReceiptDialogState();
}

class _ThermalReceiptDialogState extends State<ThermalReceiptDialog> {
  String _paperWidth = '80mm';

  @override
  Widget build(BuildContext context) {
    final o = widget.order;
    final subtotal = o.itemsList.fold(0.0, (sum, i) => sum + (i.price * i.quantity));
    final discount = o.discountAmount > 0 ? o.discountAmount : (subtotal * o.discountPercent / 100);
    final taxable = subtotal - discount > 0 ? subtotal - discount : 0.0;
    final vat = o.taxAmount > 0 ? o.taxAmount : (taxable * 0.13);
    final total = taxable + vat;

    final receiptText = '''
========================================
   HIMALAYAN RESTAURANT & BAR PVT. LTD.
       Durbar Marg, Kathmandu, Nepal
       PAN: 601928374 | Tel: +977-1-4228901
========================================
Receipt #: REC-${o.orderId}
Table: Table #${o.tableNumber}
Date: ${o.timestamp.toLocal().toString().substring(0, 16)}
----------------------------------------
ITEM                 QTY   PRICE  TOTAL
----------------------------------------
${o.itemsList.map((i) => '${i.name.padRight(18).substring(0, 18)} ${i.quantity}x ${i.price.toInt()} Rs.${(i.price * i.quantity).toInt()}').join('\n')}
----------------------------------------
Subtotal:                       Rs. ${subtotal.toStringAsFixed(2)}
Discount:                      - Rs. ${discount.toStringAsFixed(2)}
Taxable Base:                   Rs. ${taxable.toStringAsFixed(2)}
13% Nepal VAT:                  Rs. ${vat.toStringAsFixed(2)}
----------------------------------------
GRAND TOTAL:                    Rs. ${total.toStringAsFixed(2)}
Payment:                        ${o.paymentMethod ?? "Cash NPR"}
Ref:                            ${o.transactionRef ?? "TXN-AUTO"}
========================================
        DHANYABAD! THANK YOU!
========================================
''';

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Container(
        width: _paperWidth == '80mm' ? 360 : 280,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 16, offset: Offset(0, 6))],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Top Controls
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Thermal Tax Receipt', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  Row(
                    children: [
                      ChoiceChip(
                        label: const Text('80mm', style: TextStyle(fontSize: 10)),
                        selected: _paperWidth == '80mm',
                        onSelected: (_) => setState(() => _paperWidth = '80mm'),
                      ),
                      const SizedBox(width: 4),
                      ChoiceChip(
                        label: const Text('58mm', style: TextStyle(fontSize: 10)),
                        selected: _paperWidth == '58mm',
                        onSelected: (_) => setState(() => _paperWidth = '58mm'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Monospaced Receipt Preview
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Text(
                  receiptText,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    color: Color(0xFF0F172A),
                    height: 1.3,
                  ),
                ),
              ),
            ),

            // Bottom Actions
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12))),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: receiptText));
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Receipt copied!')));
                    },
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text('Copy'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A)),
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.print, size: 16, color: Colors.white),
                    label: const Text('Print ESC/POS', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
