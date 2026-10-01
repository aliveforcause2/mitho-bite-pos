// lib/screens/main_navigation_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import 'table_selection_screen.dart';
import 'menu_ordering_screen.dart';
import 'kitchen_display_screen.dart';
import 'sales_report_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final activeOrdersCount = pos.activeOrders.length;
    final defaultTable = pos.tables.isNotEmpty
        ? pos.tables.first
        : null;

    final List<Widget> screens = [
      const TableSelectionScreen(),
      if (defaultTable != null)
        MenuOrderingScreen(table: defaultTable)
      else
        const Center(
          child: Text(
            'No tables available',
            style: TextStyle(color: Colors.white),
          ),
        ),
      const KitchenDisplayScreen(),
      const SalesReportScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          border: Border(
            top: BorderSide(color: Color(0xFF334155), width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          backgroundColor: const Color(0xFF1E293B),
          selectedItemColor: const Color(0xFFF59E0B),
          unselectedItemColor: const Color(0xFF94A3B8),
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.table_restaurant_rounded),
              label: 'Floor Plan',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.restaurant_menu_rounded),
              label: 'Menu & Order',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: activeOrdersCount > 0,
                label: Text('$activeOrdersCount'),
                child: const Icon(Icons.soup_kitchen_rounded),
              ),
              label: 'Kitchen (KDS)',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.bar_chart_rounded),
              label: 'Sales Report',
            ),
          ],
        ),
      ),
    );
  }
}
