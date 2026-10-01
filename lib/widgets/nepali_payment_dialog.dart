// lib/widgets/nepali_payment_dialog.dart
import 'package:flutter/material.dart';

class NepaliPaymentDialog extends StatefulWidget {
  final double amount;
  final String orderId;
  final int tableNumber;
  final Function(String paymentMethod, String txnRef) onPaymentSuccess;

  NepaliPaymentDialog({
    super.key,
    double? amount,
    double? totalAmount,
    required this.orderId,
    required this.tableNumber,
    required this.onPaymentSuccess,
  }) : amount = amount ?? totalAmount ?? 0.0;

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
    'Card': const Color(0xFF3B82F6),
  };

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Nepali QR & Payment',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white60, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Total Amount Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  children: [
                    const Text('Total Bill to Settle', style: TextStyle(color: Colors.white60, fontSize: 11)),
                    const SizedBox(height: 2),
                    Text(
                      'Rs. ${widget.amount.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: Color(0xFFF59E0B)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Payment Method Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['eSewa', 'Khalti', 'Fonepay', 'Cash', 'Card'].map((method) {
                    final isSelected = _selectedWallet == method;
                    final color = _walletColors[method] ?? const Color(0xFFF59E0B);
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: InkWell(
                        onTap: () => setState(() => _selectedWallet = method),
                        borderRadius: BorderRadius.circular(10),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? color : const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? color : const Color(0xFF334155),
                              width: 1.5,
                            ),
                          ),
                          child: Text(
                            method,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.white70,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),

              // QR Code Display / Cash Input
              if (_selectedWallet == 'Cash')
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: const [
                      Icon(Icons.payments_rounded, color: Color(0xFF10B981), size: 48),
                      SizedBox(height: 8),
                      Text('Accept Physical Cash at Counter', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      Text('Hand change and click confirm payment', style: TextStyle(color: Colors.white54, fontSize: 11)),
                    ],
                  ),
                )
              else if (_selectedWallet == 'Card')
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: const [
                      Icon(Icons.credit_card_rounded, color: Color(0xFF3B82F6), size: 48),
                      SizedBox(height: 8),
                      Text('POS Swipe Machine / NFC Tap', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      Text('Accept Visa / Mastercard / SCT', style: TextStyle(color: Colors.white54, fontSize: 11)),
                    ],
                  ),
                )
              else
                // Dynamic QR Simulation
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: _walletColors[_selectedWallet],
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Scan to Pay with $_selectedWallet',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Icon(Icons.qr_code_2_rounded, size: 140, color: _walletColors[_selectedWallet] ?? Colors.black),
                      const SizedBox(height: 4),
                      Text(
                        'Merchant: Himalayan Restaurant',
                        style: TextStyle(color: Colors.grey.shade800, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 20),

              // Confirm Button
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _walletColors[_selectedWallet] ?? const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: _isProcessing
                      ? null
                      : () {
                          setState(() => _isProcessing = true);
                          final txnRef = '${_selectedWallet.toUpperCase()}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
                          widget.onPaymentSuccess(_selectedWallet, txnRef);
                        },
                  child: _isProcessing
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(
                          'CONFIRM RS. ${widget.amount.toStringAsFixed(0)} VIA $_selectedWallet',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
