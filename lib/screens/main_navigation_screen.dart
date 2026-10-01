// lib/screens/main_navigation_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import 'table_selection_screen.dart';
import 'menu_ordering_screen.dart';
import 'kitchen_display_screen.dart';
import 'accounting_reports_screen.dart';
import 'room_table_management_screen.dart';
import 'menu_management_screen.dart';
import 'purchase_inventory_screen.dart';
import 'subscription_admin_screen.dart';

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
    final defaultTable = pos.tables.isNotEmpty ? pos.tables.first : null;

    final List<Widget> screens = [
      const TableSelectionScreen(),
      if (defaultTable != null)
        MenuOrderingScreen(table: defaultTable)
      else
        const Center(
          child: Text('No tables available. Please add tables.', style: TextStyle(color: Colors.white)),
        ),
      const KitchenDisplayScreen(),
      const AccountingReportsScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 2,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.restaurant_menu_rounded, color: Color(0xFFF59E0B), size: 20),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'miTHOBITE POS',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
                Text(
                  'Nepali Restaurant Cloud POS',
                  style: TextStyle(fontSize: 10, color: Color(0xFFF59E0B)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Quick Profit Badge
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: pos.netProfitToday >= 0 ? const Color(0xFF065F46) : const Color(0xFF991B1B),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(pos.netProfitToday >= 0 ? Icons.trending_up : Icons.trending_down, size: 14, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  'Rs. ${pos.netProfitToday.toStringAsFixed(0)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0F172A),
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircleAvatar(
                    radius: 26,
                    backgroundColor: Color(0xFFF59E0B),
                    child: Icon(Icons.restaurant_rounded, color: Colors.black, size: 30),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    pos.profile.restaurantName,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Text(
                    'PAN: ${pos.profile.panVatNumber} • ${pos.profile.tier.name.toUpperCase()}',
                    style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 12),
                  ),
                ],
              ),
            ),
            _buildDrawerTile(
              icon: Icons.table_restaurant_rounded,
              title: 'Floor Plan (टेबलहरू)',
              color: const Color(0xFF10B981),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 0);
              },
            ),
            _buildDrawerTile(
              icon: Icons.restaurant_menu_rounded,
              title: 'POS Menu & Order (मेनु र अर्डर)',
              color: const Color(0xFFF59E0B),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 1);
              },
            ),
            _buildDrawerTile(
              icon: Icons.soup_kitchen_rounded,
              title: 'Kitchen KDS (भान्सा अर्डर)',
              color: const Color(0xFFEF4444),
              badgeCount: activeOrdersCount,
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 2);
              },
            ),
            _buildDrawerTile(
              icon: Icons.analytics_rounded,
              title: 'Accounts & Profit/Loss (नाफा/नोक्सान)',
              color: const Color(0xFF3B82F6),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 3);
              },
            ),
            const Divider(color: Colors.white12, height: 24),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text(
                'MANAGEMENT & SETTINGS',
                style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
            _buildDrawerTile(
              icon: Icons.meeting_room_rounded,
              title: 'Room & Table Settings (कोठा/टेबल)',
              color: Colors.amberAccent,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const RoomTableManagementScreen()));
              },
            ),
            _buildDrawerTile(
              icon: Icons.fastfood_rounded,
              title: 'Menu & Food Edit (खाना र फोटो फेर्ने)',
              color: Colors.orangeAccent,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const MenuManagementScreen()));
              },
            ),
            _buildDrawerTile(
              icon: Icons.inventory_2_rounded,
              title: 'Suppliers & Purchases (खरिद हिसाब)',
              color: Colors.tealAccent,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const PurchaseInventoryScreen()));
              },
            ),
            _buildDrawerTile(
              icon: Icons.admin_panel_settings_rounded,
              title: 'Owner & Subscription (सेटिङ र सदस्यता)',
              color: Colors.purpleAccent,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionAdminScreen()));
              },
            ),
          ],
        ),
      ),
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
          onTap: (index) => setState(() => _currentIndex = index),
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
              icon: Icon(Icons.analytics_rounded),
              label: 'Accounts',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerTile({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
    int? badgeCount,
  }) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14)),
      trailing: badgeCount != null && badgeCount > 0
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
              child: Text('$badgeCount', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            )
          : null,
      onTap: onTap,
    );
  }
}
