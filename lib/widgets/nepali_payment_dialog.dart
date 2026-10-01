// lib/widgets/nepali_payment_dialog.dart
import 'package:flutter/material.dart';

class NepaliPaymentDialog extends StatefulWidget {
  final double amount;
  final String orderId;
  final int tableNumber;
  final Function(String paymentMethod, String txnRef) onPaymentSuccess;
  final Function(double cashPart, double digitalPart, String digitalWallet, String txnRef)? onSplitSuccess;

  NepaliPaymentDialog({
    super.key,
    double? amount,
    double? totalAmount,
    required this.orderId,
    required this.tableNumber,
    required this.onPaymentSuccess,
    this.onSplitSuccess,
  }) : amount = amount ?? totalAmount ?? 0.0;

  @override
  State<NepaliPaymentDialog> createState() => _NepaliPaymentDialogState();
}

class _NepaliPaymentDialogState extends State<NepaliPaymentDialog> {
  String _selectedWallet = 'eSewa';
  bool _isProcessing = false;
  bool _isSplitMode = false;

  late TextEditingController _splitCashCtrl;
  late TextEditingController _splitDigitalCtrl;

  final Map<String, Color> _walletColors = {
    'eSewa': const Color(0xFF60BB46),
    'Khalti': const Color(0xFF5C2D91),
    'Fonepay': const Color(0xFFE21B22),
    'Cash': const Color(0xFF10B981),
    'Card': const Color(0xFF3B82F6),
  };

  @override
  void initState() {
    super.initState();
    final half = widget.amount / 2.0;
    _splitCashCtrl = TextEditingController(text: half.toStringAsFixed(0));
    _splitDigitalCtrl = TextEditingController(text: (widget.amount - half).toStringAsFixed(0));
  }

  @override
  void dispose() {
    _splitCashCtrl.dispose();
    _splitDigitalCtrl.dispose();
    super.dispose();
  }

  void _onCashChanged(String val) {
    final cash = double.tryParse(val) ?? 0.0;
    final remaining = (widget.amount - cash).clamp(0.0, widget.amount);
    _splitDigitalCtrl.text = remaining.toStringAsFixed(0);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header with close button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Nepali Payment & Split Bill',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white60, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 6),

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
              const SizedBox(height: 12),

              // Full Payment / Split Bill Toggle Mode
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _isSplitMode = false),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: !_isSplitMode ? const Color(0xFFF59E0B) : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: !_isSplitMode ? const Color(0xFFF59E0B) : const Color(0xFF334155)),
                        ),
                        child: Text(
                          'Full Payment (१००%)',
                          style: TextStyle(
                            color: !_isSplitMode ? Colors.black : Colors.white70,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _isSplitMode = true),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: _isSplitMode ? const Color(0xFF3B82F6) : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _isSplitMode ? const Color(0xFF3B82F6) : const Color(0xFF334155)),
                        ),
                        child: Text(
                          'Split Bill (आधा-आधा)',
                          style: TextStyle(
                            color: _isSplitMode ? Colors.white : Colors.white70,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              if (_isSplitMode) ...[
                // Split Bill Form
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('1. Physical Cash Amount (रु.):', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _splitCashCtrl,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          isDense: true,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        ),
                        onChanged: _onCashChanged,
                      ),
                      const SizedBox(height: 10),
                      const Text('2. Digital QR Wallet Amount (रु.):', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _splitDigitalCtrl,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          isDense: true,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],

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
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 14),

              // QR Code / Cash Info
              if (_selectedWallet == 'Cash')
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: const [
                      Icon(Icons.payments_rounded, color: Color(0xFF10B981), size: 40),
                      SizedBox(height: 6),
                      Text('Accept Physical Cash at Counter', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                )
              else if (_selectedWallet == 'Card')
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: const [
                      Icon(Icons.credit_card_rounded, color: Color(0xFF3B82F6), size: 40),
                      SizedBox(height: 6),
                      Text('POS Swipe Machine / NFC Tap', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: _walletColors[_selectedWallet],
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Scan to Pay with $_selectedWallet',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Icon(Icons.qr_code_2_rounded, size: 120, color: _walletColors[_selectedWallet] ?? Colors.black),
                      Text(
                        'Merchant: Himalayan Restaurant',
                        style: TextStyle(color: Colors.grey.shade800, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),

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
                          if (_isSplitMode && widget.onSplitSuccess != null) {
                            final cashPart = double.tryParse(_splitCashCtrl.text) ?? 0.0;
                            final digPart = double.tryParse(_splitDigitalCtrl.text) ?? 0.0;
                            widget.onSplitSuccess!(cashPart, digPart, _selectedWallet, txnRef);
                          } else {
                            widget.onPaymentSuccess(_selectedWallet, txnRef);
                          }
                        },
                  child: _isProcessing
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(
                          _isSplitMode
                              ? 'CONFIRM SPLIT PAYMENT'
                              : 'CONFIRM RS. ${widget.amount.toStringAsFixed(0)} VIA $_selectedWallet',
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
