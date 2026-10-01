// lib/screens/main_navigation_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import 'table_selection_screen.dart';
import 'hotel_rooms_screen.dart';
import 'kitchen_display_screen.dart';
import 'purchase_inventory_screen.dart';
import 'accounting_reports_screen.dart';
import 'menu_management_screen.dart';
import 'room_table_management_screen.dart';
import 'sales_report_screen.dart';
import 'subscription_admin_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    TableSelectionScreen(),
    HotelRoomsScreen(),
    KitchenDisplayScreen(),
    PurchaseInventoryScreen(),
    AccountingReportsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final profile = pos.profile;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 3,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Color(0xFFF59E0B)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'miTHOBITE',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white, letterSpacing: 0.5),
                ),
                const SizedBox(width: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'POS',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ),
              ],
            ),
            Text(
              profile.restaurantName,
              style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w500),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          // Subscription / Trial Pill Button
          InkWell(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SubscriptionAdminScreen()),
            ),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF59E0B), Color(0xFFEA580C)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.workspace_premium_rounded, color: Colors.black, size: 14),
                  SizedBox(width: 3),
                  Text(
                    '१५ दिने ट्रायल',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ],
              ),
            ),
          ),

          // Admin Profile Avatar Button
          IconButton(
            icon: const CircleAvatar(
              radius: 14,
              backgroundColor: Color(0xFF334155),
              child: Icon(Icons.person, color: Color(0xFFF59E0B), size: 16),
            ),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SubscriptionAdminScreen()),
            ),
          ),
        ],
      ),

      // Side Navigation Drawer (Enterprise Navigation Drawer)
      drawer: Drawer(
        backgroundColor: const Color(0xFF0F172A),
        child: SafeArea(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              // Drawer Header
              Container(
                padding: const EdgeInsets.all(16),
                color: const Color(0xFF1E293B),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.restaurant_rounded, color: Color(0xFFF59E0B), size: 28),
                        SizedBox(width: 10),
                        Text('miTHOBITE Enterprise', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(profile.restaurantName, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    if (profile.isPanEnabled)
                      Text('PAN: ${profile.panVatNumber}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),

              const SizedBox(height: 8),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Text('RESTAURANT MANAGEMENT', style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),

              _drawerTile(
                icon: Icons.table_restaurant_rounded,
                title: 'Floor Plan & Tables (T-1, T-2)',
                color: const Color(0xFF10B981),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 0);
                },
              ),

              _drawerTile(
                icon: Icons.hotel_rounded,
                title: 'Hotel Rooms & Banquet Booking',
                color: const Color(0xFF3B82F6),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 1);
                },
              ),

              _drawerTile(
                icon: Icons.restaurant_menu_rounded,
                title: 'Dish & Photo Manager (Image URL)',
                color: const Color(0xFFF59E0B),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const MenuManagementScreen()));
                },
              ),

              _drawerTile(
                icon: Icons.meeting_room_rounded,
                title: 'Rooms & Sections Management',
                color: const Color(0xFF8B5CF6),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const RoomTableManagementScreen()));
                },
              ),

              const Divider(color: Colors.white12, height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Text('FINANCIALS & LEDGERS', style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),

              _drawerTile(
                icon: Icons.soup_kitchen_rounded,
                title: 'Kitchen KDS Display',
                color: const Color(0xFFEF4444),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 2);
                },
              ),

              _drawerTile(
                icon: Icons.inventory_2_rounded,
                title: 'Suppliers & Raw Material Purchases',
                color: const Color(0xFFF97316),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 3);
                },
              ),

              _drawerTile(
                icon: Icons.calculate_rounded,
                title: 'Owner P&L (Net Profit & Expenses)',
                color: const Color(0xFF10B981),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _currentIndex = 4);
                },
              ),

              _drawerTile(
                icon: Icons.receipt_long_rounded,
                title: 'Day Close & Sales Report (Z-Report)',
                color: const Color(0xFF06B6D4),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SalesReportScreen()));
                },
              ),

              const Divider(color: Colors.white12, height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Text('SETTINGS & LICENSE', style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),

              _drawerTile(
                icon: Icons.workspace_premium_rounded,
                title: 'Lifetime Pro Subscription & QR',
                color: const Color(0xFFF59E0B),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionAdminScreen()));
                },
              ),
            ],
          ),
        ),
      ),

      // Screen Body
      body: _screens[_currentIndex],

      // Bottom Navigation Bar
      bottomNavigationBar: NavigationBar(
        backgroundColor: const Color(0xFF1E293B),
        indicatorColor: const Color(0xFFF59E0B),
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.table_restaurant_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.table_restaurant_rounded, color: Colors.black),
            label: 'Tables',
          ),
          NavigationDestination(
            icon: Icon(Icons.hotel_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.hotel_rounded, color: Colors.black),
            label: 'Rooms',
          ),
          NavigationDestination(
            icon: Icon(Icons.soup_kitchen_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.soup_kitchen_rounded, color: Colors.black),
            label: 'Kitchen',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.inventory_2_rounded, color: Colors.black),
            label: 'Purchases',
          ),
          NavigationDestination(
            icon: Icon(Icons.calculate_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.calculate_rounded, color: Colors.black),
            label: 'Accounts',
          ),
        ],
      ),
    );
  }

  Widget _drawerTile({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      dense: true,
      onTap: onTap,
    );
  }
}
