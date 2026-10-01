// lib/widgets/kot_slip_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/order_model.dart';

class KotSlipDialog extends StatelessWidget {
  final OrderModel order;
  const KotSlipDialog({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final kotText = '''
========================================
       *** KITCHEN ORDER TICKET ***
                 CHEF SLIP
========================================
KOT #: KOT-${order.orderId}
TABLE #: ${order.tableNumber}
Time: ${order.timestamp.toLocal().toString().substring(11, 16)}
Server: ${order.serverName ?? "Captain 01"}
----------------------------------------
QTY   ITEM NAME & INSTRUCTIONS
----------------------------------------
${order.itemsList.map((i) => '[ ${i.quantity}x ]  ${i.name.toUpperCase()}\n${i.specialInstructions != null ? "     >> Note: ${i.specialInstructions}\n" : ""}').join()}
----------------------------------------
Kitchen Note: ${order.kitchenNote ?? "Standard preparation"}
========================================
''';

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: 320,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 20)],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFFDC2626),
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.restaurant, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Kitchen Order Slip (KOT)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                kotText,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.black87, height: 1.3),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: kotText));
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('KOT sent to kitchen printer!')));
                    },
                    icon: const Icon(Icons.print, size: 16, color: Colors.white),
                    label: const Text('Print KOT', style: TextStyle(color: Colors.white)),
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
