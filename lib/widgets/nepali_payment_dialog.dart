// lib/widgets/nepali_payment_dialog.dart
import 'package:flutter/material.dart';

class NepaliPaymentDialog extends StatefulWidget {
  final double amount;
  final String orderId;
  final int tableNumber;
  final Function(String paymentMethod, String txnRef) onPaymentSuccess;

  const NepaliPaymentDialog({
    super.key,
    required this.amount,
    required this.orderId,
    required this.tableNumber,
    required this.onPaymentSuccess,
  });

  @override
  State<NepaliPaymentDialog> createState() => _NepaliPaymentDialogState();
}

class _NepaliPaymentDialogState extends State<NepaliPaymentDialog> {
  String _selectedWallet = 'eSewa';
  bool _isProcessing = false;

  final Map<String, Color> _walletColors = {
    'eSewa': const Color(0xFF60BB46),
    'Khalti': const Color(0xFF5C2D91),
    'Fonepay': const Color(0xFFE21B22),
    'Cash': const Color(0xFF10B981),
  };

  @override
  Widget build(BuildContext context) {
    final activeColor = _walletColors[_selectedWallet] ?? const Color(0xFFF59E0B);

    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Pay Rs. ${widget.amount.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Wallet Switcher
            Row(
              children: ['eSewa', 'Khalti', 'Fonepay', 'Cash'].map((wallet) {
                final isSel = _selectedWallet == wallet;
                final col = _walletColors[wallet]!;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedWallet = wallet),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSel ? col.withOpacity(0.25) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSel ? col : Colors.white12, width: 1.5),
                      ),
                      child: Text(
                        wallet,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isSel ? col : Colors.white60,
                          fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            // QR Display or Cash Icon
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: activeColor.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: _selectedWallet == 'Cash'
                  ? Column(
                      children: [
                        const Icon(Icons.payments_rounded, size: 80, color: Color(0xFF10B981)),
                        const SizedBox(height: 8),
                        Text(
                          'Collect Rs. ${widget.amount.toStringAsFixed(2)} Cash',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 15),
                        ),
                      ],
                    )
                  : Column(
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            border: Border.all(color: activeColor, width: 3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.qr_code_2_rounded, size: 90, color: activeColor),
                                Text(
                                  _selectedWallet.toUpperCase(),
                                  style: TextStyle(color: activeColor, fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Scan with $_selectedWallet App',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 13),
                        ),
                        Text(
                          'Merchant: miTHOBITE POS',
                          style: TextStyle(color: Colors.grey.shade700, fontSize: 11),
                        ),
                      ],
                    ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: activeColor),
                icon: _isProcessing
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.check_circle_rounded, color: Colors.white),
                label: Text(
                  _isProcessing ? 'Verifying...' : 'Confirm & Print Receipt',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15),
                ),
                onPressed: _isProcessing
                    ? null
                    : () async {
                        setState(() => _isProcessing = true);
                        await Future.delayed(const Duration(milliseconds: 600));
                        final txnRef = '${_selectedWallet.toUpperCase()}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
                        widget.onPaymentSuccess(_selectedWallet, txnRef);
                        if (mounted) Navigator.pop(context);
                      },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
