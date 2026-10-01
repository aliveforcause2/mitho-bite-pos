// lib/screens/billing_checkout_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/order_model.dart';
import '../providers/pos_provider.dart';

class BillingCheckoutScreen extends StatefulWidget {
  final OrderModel order;

  const BillingCheckoutScreen({super.key, required this.order});

  @override
  State<BillingCheckoutScreen> createState() => _BillingCheckoutScreenState();
}

enum QrWallet { fonepay, esewa, khalti }

class _BillingCheckoutScreenState extends State<BillingCheckoutScreen> {
  double _discountPercent = 0.0;
  String _primaryPaymentMethod = 'Cash'; // 'Cash', 'Digital QR', 'Card / POS'
  QrWallet _selectedWallet = QrWallet.fonepay;
  String _transactionRef = '';
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _transactionRef = 'TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
  }

  String get _currentPaymentLabel {
    if (_primaryPaymentMethod == 'Digital QR') {
      switch (_selectedWallet) {
        case QrWallet.fonepay:
          return 'Fonepay (Mobile Banking)';
        case QrWallet.esewa:
          return 'eSewa QR';
        case QrWallet.khalti:
          return 'Khalti QR';
      }
    }
    return _primaryPaymentMethod;
  }

  Color get _walletColor {
    switch (_selectedWallet) {
      case QrWallet.fonepay:
        return const Color(0xFFDC2626); // Red
      case QrWallet.esewa:
        return const Color(0xFF16A34A); // Green
      case QrWallet.khalti:
        return const Color(0xFF9333EA); // Purple
    }
  }

  String get _walletTitle {
    switch (_selectedWallet) {
      case QrWallet.fonepay:
        return 'Fonepay / NepalPay Interoperable QR';
      case QrWallet.esewa:
        return 'eSewa Merchant QR';
      case QrWallet.khalti:
        return 'Khalti Smart Merchant QR';
    }
  }

  String get _merchantName {
    switch (_selectedWallet) {
      case QrWallet.fonepay:
        return 'HIMALAYAN RESTAURANT & BAR PVT. LTD.';
      case QrWallet.esewa:
        return 'HIMALAYAN RESTAURANT (ESEWA BIZ)';
      case QrWallet.khalti:
        return 'HIMALAYAN HOSPITALITY (KHALTI)';
    }
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.read<PosProvider>();

    // Financial Calculations (Subtotal, Discount, 13% Nepali VAT, Grand Total)
    final double subtotal = widget.order.itemsList.fold(
      0.0,
      (sum, item) => sum + (item.price * item.quantity),
    );
    final double discountAmount = (subtotal * _discountPercent) / 100.0;
    final double taxableAmount = (subtotal - discountAmount) > 0 ? (subtotal - discountAmount) : 0.0;
    const double vatRate = 0.13; // 13% Nepal VAT
    final double vatAmount = taxableAmount * vatRate;
    final double grandTotal = taxableAmount + vatAmount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Table #${widget.order.tableNumber} - Checkout & QR Billing'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            tooltip: 'Print Thermal Receipt',
            icon: const Icon(Icons.print),
            onPressed: () => _showPrintPreview(context, subtotal, discountAmount, vatAmount, grandTotal),
          ),
        ],
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // LEFT PANEL: Billing Options, Multi-Wallet QR Switcher, and Payment Action
          Expanded(
            flex: 5,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // 1. Discount selection
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Special Discount (%)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            if (_discountPercent > 0)
                              Text(
                                '-${_discountPercent.toInt()}% (-Rs. ${discountAmount.toStringAsFixed(2)})',
                                style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          children: [0.0, 5.0, 10.0, 15.0, 20.0].map((rate) {
                            final isSelected = _discountPercent == rate;
                            return ChoiceChip(
                              label: Text(rate == 0 ? 'None' : '${rate.toInt()}%'),
                              selected: isSelected,
                              selectedColor: const Color(0xFFFF9800),
                              onSelected: (_) => setState(() => _discountPercent = rate),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 2. Primary Payment Channel Selector
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Payment Channel',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildPaymentTab('Cash NPR', Icons.money, 'Cash'),
                            const SizedBox(width: 8),
                            _buildPaymentTab('Digital QR', Icons.qr_code_2, 'Digital QR'),
                            const SizedBox(width: 8),
                            _buildPaymentTab('Card / POS', Icons.credit_card, 'Card / POS'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // 3. DYNAMIC NEPALI DIGITAL WALLET QR CONTAINER (When Digital QR selected)
                if (_primaryPaymentMethod == 'Digital QR') ...[
                  const SizedBox(height: 16),
                  Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Switcher Tabs: [Fonepay] [eSewa] [Khalti]
                          const Text(
                            'Select QR Wallet Network',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              _buildWalletChip('Fonepay', QrWallet.fonepay, const Color(0xFFDC2626)),
                              const SizedBox(width: 8),
                              _buildWalletChip('eSewa QR', QrWallet.esewa, const Color(0xFF16A34A)),
                              const SizedBox(width: 8),
                              _buildWalletChip('Khalti QR', QrWallet.khalti, const Color(0xFF9333EA)),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Dynamic Branded QR Display Container
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: _walletColor.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: _walletColor.withOpacity(0.4), width: 1.5),
                            ),
                            child: Row(
                              children: [
                                // Mock QR Code Box with Logo overlay
                                Container(
                                  width: 110,
                                  height: 110,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.grey.shade300),
                                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
                                  ),
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      const Icon(Icons.qr_code, size: 90, color: Color(0xFF0F172A)),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: _walletColor,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          _selectedWallet.name.toUpperCase(),
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 8),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),

                                // Merchant Info & Dynamic Payable Amount
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _walletTitle,
                                        style: TextStyle(color: _walletColor, fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        _merchantName,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                      const SizedBox(height: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: Colors.grey.shade300),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text('Amount to Pay:', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                            Text(
                                              'Rs. ${grandTotal.toStringAsFixed(2)}',
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.w900,
                                                color: Color(0xFFD84315),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Copyable Txn Trace Ref ID
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Ref / Trace ID: $_transactionRef', style: const TextStyle(fontSize: 12, fontFamily: 'monospace')),
                              TextButton.icon(
                                style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: _transactionRef));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Transaction Ref copied!'), duration: Duration(seconds: 1)),
                                  );
                                },
                                icon: const Icon(Icons.copy, size: 14),
                                label: const Text('Copy ID', style: TextStyle(fontSize: 12)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 24),

                // 4. Pay and Close Order CTA / Confirmation Button
                SizedBox(
                  height: 56,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                    ),
                    onPressed: _isProcessing
                        ? null
                        : () async {
                            setState(() => _isProcessing = true);
                            await pos.completePaymentAndFreeTable(
                              orderId: widget.order.orderId,
                              tableNumber: widget.order.tableNumber,
                              finalTotal: grandTotal,
                              discountPercent: _discountPercent,
                              paymentMethod: _currentPaymentLabel,
                              transactionRef: _primaryPaymentMethod == 'Digital QR' ? _transactionRef : null,
                            );
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFF10B981),
                                  content: Text(
                                    'Payment confirmed via $_currentPaymentLabel! Table #${widget.order.tableNumber} is now AVAILABLE.',
                                  ),
                                ),
                              );
                              Navigator.pop(context);
                            }
                          },
                    icon: _isProcessing
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.check_circle_outline, size: 24),
                    label: Text(
                      'CONFIRM PAYMENT & FREE TABLE (Rs. ${grandTotal.toStringAsFixed(2)})',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // RIGHT PANEL: Clean Thermal Printable Receipt Preview
          Expanded(
            flex: 4,
            child: Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10)],
              ),
              child: _buildReceiptContent(subtotal, discountAmount, vatAmount, grandTotal),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentTab(String label, IconData icon, String value) {
    final isSelected = _primaryPaymentMethod == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _primaryPaymentMethod = value),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFFFF9800) : Colors.grey.shade300,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? const Color(0xFFFF9800) : Colors.grey.shade700),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.black87,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWalletChip(String label, QrWallet wallet, Color color) {
    final isSelected = _selectedWallet == wallet;
    return Expanded(
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: isSelected ? color : Colors.grey.shade100,
          foregroundColor: isSelected ? Colors.white : Colors.black87,
          elevation: isSelected ? 2 : 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(vertical: 10),
        ),
        onPressed: () => setState(() => _selectedWallet = wallet),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ),
    );
  }

  Widget _buildReceiptContent(
      double subtotal, double discountAmount, double vatAmount, double grandTotal) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'HIMALAYAN RESTAURANT & BAR',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
          ),
          const Text(
            'Thamel, Kathmandu | PAN: 601928374',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: Colors.grey),
          ),
          const Divider(thickness: 1.5, height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Bill No: ${widget.order.orderId}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              Text('Table #${widget.order.tableNumber}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          Text(
            'Pay Mode: $_currentPaymentLabel',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFFD84315)),
          ),
          if (_primaryPaymentMethod == 'Digital QR')
            Text(
              'Trace Ref: $_transactionRef',
              style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Colors.grey),
            ),
          Text(
            'Date: ${DateTime.now().toLocal().toString().substring(0, 16)}',
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
          const Divider(thickness: 1, height: 20),

          // Items Table
          ...widget.order.itemsList.map((item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
                child: Row(
                  children: [
                    Expanded(child: Text('${item.quantity}x ${item.name}', style: const TextStyle(fontSize: 13))),
                    Text('Rs. ${(item.price * item.quantity).toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  ],
                ),
              )),

          const Divider(thickness: 1.5, height: 24),

          // Subtotal, Discount, 13% VAT, Grand Total
          _receiptRow('Subtotal', 'Rs. ${subtotal.toStringAsFixed(2)}'),
          if (_discountPercent > 0)
            _receiptRow('Discount (${_discountPercent.toInt()}%)', '- Rs. ${discountAmount.toStringAsFixed(2)}',
                color: Colors.green),
          _receiptRow('Taxable Amount', 'Rs. ${(subtotal - discountAmount).toStringAsFixed(2)}'),
          _receiptRow('13% Nepal VAT', 'Rs. ${vatAmount.toStringAsFixed(2)}'),
          const Divider(thickness: 2, height: 20),
          _receiptRow('GRAND TOTAL', 'Rs. ${grandTotal.toStringAsFixed(2)}', isBold: true, fontSize: 16),
          const SizedBox(height: 16),
          const Text(
            'DHANYABAD! THANK YOU FOR DINING WITH US!',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }

  Widget _receiptRow(String title, String amount, {bool isBold = false, double fontSize = 13, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: fontSize, color: color)),
          Text(amount, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.w600, fontSize: fontSize, color: color)),
        ],
      ),
    );
  }

  void _showPrintPreview(BuildContext context, double sub, double disc, double vat, double total) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Sending to Thermal Printer...'),
        content: const Text('Printer connected on 80mm ESC/POS network protocol.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }
}
