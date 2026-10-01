// lib/screens/accounting_reports_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/expense_model.dart';
import '../models/order_model.dart';

class AccountingReportsScreen extends StatefulWidget {
  const AccountingReportsScreen({super.key});

  @override
  State<AccountingReportsScreen> createState() => _AccountingReportsScreenState();
}

class _AccountingReportsScreenState extends State<AccountingReportsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Accounts & Financials (सम्पूर्ण हिसाब-किताब)',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 17),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFF59E0B),
          labelColor: const Color(0xFFF59E0B),
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(icon: Icon(Icons.analytics_rounded), text: 'Profit & Loss'),
            Tab(icon: Icon(Icons.money_off_rounded), text: 'Expenses'),
            Tab(icon: Icon(Icons.receipt_rounded), text: 'Settled Bills'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildProfitLossTab(context, pos),
          _buildExpensesTab(context, pos),
          _buildSettledBillsTab(context, pos),
        ],
      ),
      floatingActionButton: _tabController.index == 1
          ? FloatingActionButton.extended(
              backgroundColor: const Color(0xFFEF4444),
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Add Expense', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              onPressed: () => _showAddExpenseDialog(context, pos),
            )
          : null,
    );
  }

  Widget _buildProfitLossTab(BuildContext context, PosProvider pos) {
    final sales = pos.totalSalesToday;
    final purchases = pos.totalPurchasesToday;
    final expenses = pos.totalExpensesToday;
    final netProfit = pos.netProfitToday;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Net Profit Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: netProfit >= 0
                    ? [const Color(0xFF065F46), const Color(0xFF047857)]
                    : [const Color(0xFF991B1B), const Color(0xFFB91C1C)],
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: (netProfit >= 0 ? Colors.green : Colors.red).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('TODAY NET PROFIT / LOSS (खुद नाफा)', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                    Icon(netProfit >= 0 ? Icons.trending_up : Icons.trending_down, color: Colors.white, size: 24),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  'Rs. ${netProfit.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 32, color: Colors.white),
                ),
                const SizedBox(height: 6),
                Text(
                  'Formula: Total Sales (Rs. ${sales.toStringAsFixed(0)}) - Purchases (Rs. ${purchases.toStringAsFixed(0)}) - Expenses (Rs. ${expenses.toStringAsFixed(0)})',
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // 3 Column Stat Tiles
          Row(
            children: [
              Expanded(
                child: _buildFinancialMetricTile(
                  'Gross Sales',
                  'Rs. ${sales.toStringAsFixed(0)}',
                  const Color(0xFF10B981),
                  Icons.point_of_sale_rounded,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildFinancialMetricTile(
                  'Purchases',
                  'Rs. ${purchases.toStringAsFixed(0)}',
                  const Color(0xFFF59E0B),
                  Icons.shopping_cart_rounded,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildFinancialMetricTile(
                  'Expenses',
                  'Rs. ${expenses.toStringAsFixed(0)}',
                  const Color(0xFFEF4444),
                  Icons.account_balance_wallet_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Payment Breakdown (Cash vs eSewa/Khalti)
          const Text('Payment Mode Split', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.money_rounded, color: Colors.greenAccent, size: 20),
                        SizedBox(width: 8),
                        Text('Cash Payments', style: TextStyle(color: Colors.white)),
                      ],
                    ),
                    Text('Rs. ${pos.cashSales.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(color: Colors.white12, height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.qr_code_2_rounded, color: Color(0xFFF59E0B), size: 20),
                        SizedBox(width: 8),
                        Text('Digital (eSewa / Khalti / Fonepay)', style: TextStyle(color: Colors.white)),
                      ],
                    ),
                    Text('Rs. ${pos.digitalSales.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialMetricTile(String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.white60, fontSize: 11)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildExpensesTab(BuildContext context, PosProvider pos) {
    final expenses = pos.expenses;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('All Operational Expenses', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
                icon: const Icon(Icons.add, size: 18, color: Colors.white),
                label: const Text('Add Expense', style: TextStyle(color: Colors.white)),
                onPressed: () => _showAddExpenseDialog(context, pos),
              ),
            ],
          ),
        ),
        Expanded(
          child: expenses.isEmpty
              ? const Center(child: Text('No expenses recorded.', style: TextStyle(color: Colors.white54)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: expenses.length,
                  itemBuilder: (context, index) {
                    final e = expenses[index];
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.payment_rounded, color: Color(0xFFEF4444)),
                        ),
                        title: Text(e.title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        subtitle: Text('${e.category} • Paid via ${e.paymentMethod}', style: const TextStyle(color: Colors.white60, fontSize: 12)),
                        trailing: Text(
                          '- Rs. ${e.amount.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFEF4444), fontSize: 15),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSettledBillsTab(BuildContext context, PosProvider pos) {
    final paidOrders = pos.orders.where((o) => o.status == OrderStatus.paid).toList();

    return paidOrders.isEmpty
        ? const Center(child: Text('No settled bills yet today.', style: TextStyle(color: Colors.white54)))
        : ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: paidOrders.length,
            itemBuilder: (context, index) {
              final o = paidOrders[index];
              return Card(
                color: const Color(0xFF1E293B),
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF10B981).withOpacity(0.2),
                    child: Text('T${o.tableNumber}', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                  ),
                  title: Text('Bill: ${o.orderId}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: Text(
                    '${o.itemsList.length} items • ${o.paymentMethod ?? "Cash"}\nRef: ${o.transactionRef ?? "N/A"}',
                    style: const TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                  trailing: Text(
                    'Rs. ${o.totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981), fontSize: 15),
                  ),
                ),
              );
            },
          );
  }

  void _showAddExpenseDialog(BuildContext context, PosProvider pos) {
    String title = '';
    String category = 'LPG Gas Cylinder';
    double amount = 1500.0;
    String method = 'Cash';

    final categories = ['Rent', 'Staff Salary', 'Electricity & Water', 'LPG Gas Cylinder', 'Maintenance', 'Marketing', 'Miscellaneous'];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Record Daily Expense', style: TextStyle(color: Colors.white)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Expense Description (खर्चको विवरण)', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => title = val,
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: category,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Category', labelStyle: TextStyle(color: Colors.white70)),
                  items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (val) => setState(() => category = val ?? category),
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: '$amount',
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Amount (Rs.)', labelStyle: TextStyle(color: Colors.white70)),
                  onChanged: (val) => amount = double.tryParse(val) ?? amount,
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: method,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Paid Via', labelStyle: TextStyle(color: Colors.white70)),
                  items: ['Cash', 'eSewa', 'Khalti', 'Bank Transfer'].map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
                  onChanged: (val) => setState(() => method = val ?? method),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
              onPressed: () {
                if (title.trim().isNotEmpty) {
                  pos.addExpense(
                    ExpenseModel(
                      id: 'exp-${DateTime.now().millisecondsSinceEpoch}',
                      title: title.trim(),
                      category: category,
                      amount: amount,
                      paymentMethod: method,
                      date: DateTime.now(),
                    ),
                  );
                  Navigator.pop(ctx);
                }
              },
              child: const Text('Save Expense', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
