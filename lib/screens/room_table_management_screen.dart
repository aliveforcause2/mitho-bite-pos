// lib/screens/room_table_management_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/table_model.dart';

class RoomTableManagementScreen extends StatefulWidget {
  const RoomTableManagementScreen({super.key});

  @override
  State<RoomTableManagementScreen> createState() => _RoomTableManagementScreenState();
}

class _RoomTableManagementScreenState extends State<RoomTableManagementScreen> {
  String _selectedSection = 'All';

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final tables = _selectedSection == 'All'
        ? pos.tables
        : pos.tables.where((t) => t.roomSection == _selectedSection).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Room & Table Management',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_location_alt_rounded, color: Color(0xFFF59E0B)),
            tooltip: 'Add Room/Section',
            onPressed: () => _showAddRoomDialog(context, pos),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_rounded, color: Color(0xFF10B981)),
            tooltip: 'Add Table',
            onPressed: () => _showAddTableDialog(context, pos),
          ),
        ],
      ),
      body: Column(
        children: [
          // Section Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                _buildSectionChip('All'),
                ...pos.rooms.map((r) => _buildSectionChip(r)),
              ],
            ),
          ),
          // Tables Grid
          Expanded(
            child: tables.isEmpty
                ? const Center(
                    child: Text(
                      'No tables in this section.\nTap + to add a table.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white54, fontSize: 16),
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.05,
                    ),
                    itemCount: tables.length,
                    itemBuilder: (context, index) {
                      final table = tables[index];
                      return _buildTableCard(context, pos, table);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionChip(String section) {
    final isSelected = _selectedSection == section;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(section),
        selected: isSelected,
        selectedColor: const Color(0xFFF59E0B),
        backgroundColor: const Color(0xFF1E293B),
        labelStyle: TextStyle(
          color: isSelected ? Colors.black : Colors.white70,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        onSelected: (selected) {
          if (selected) {
            setState(() {
              _selectedSection = section;
            });
          }
        },
      ),
    );
  }

  Widget _buildTableCard(BuildContext context, PosProvider pos, TableModel table) {
    Color statusColor = const Color(0xFF10B981);
    String statusText = 'FREE';

    if (table.isOccupied) {
      statusColor = const Color(0xFFEF4444);
      statusText = 'OCCUPIED';
    } else if (table.isReserved) {
      statusColor = const Color(0xFF3B82F6);
      statusText = 'RESERVED';
    }

    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: statusColor.withOpacity(0.6), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Table ${table.tableNumber}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                  ),
                ),
              ],
            ),
            Text(
              table.roomSection,
              style: const TextStyle(fontSize: 12, color: Color(0xFFF59E0B)),
            ),
            Row(
              children: [
                const Icon(Icons.people_alt_rounded, size: 14, color: Colors.white54),
                const SizedBox(width: 4),
                Text(
                  '${table.seatingCapacity} Seats',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
            if (table.isReserved)
              Text(
                '👤 ${table.reservedForName ?? ""} (${table.reservedTime ?? ""})',
                style: const TextStyle(fontSize: 11, color: Colors.lightBlueAccent),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (table.isAvailable)
                  IconButton(
                    icon: const Icon(Icons.bookmark_add_rounded, size: 20, color: Color(0xFF3B82F6)),
                    tooltip: 'Book/Reserve Table',
                    onPressed: () => _showBookTableDialog(context, pos, table.tableNumber),
                  ),
                if (table.isReserved || table.isOccupied)
                  IconButton(
                    icon: const Icon(Icons.lock_open_rounded, size: 20, color: Color(0xFF10B981)),
                    tooltip: 'Make Table Free',
                    onPressed: () => pos.freeTable(table.tableNumber),
                  ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Color(0xFFEF4444)),
                  tooltip: 'Delete Table',
                  onPressed: () => _confirmDeleteTable(context, pos, table.tableNumber),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddTableDialog(BuildContext context, PosProvider pos) {
    int tableNum = pos.tables.isNotEmpty ? pos.tables.last.tableNumber + 1 : 1;
    int capacity = 4;
    String section = pos.rooms.first;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Add New Table', style: TextStyle(color: Colors.white)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                initialValue: '$tableNum',
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Table Number',
                  labelStyle: TextStyle(color: Colors.white70),
                ),
                onChanged: (val) => tableNum = int.tryParse(val) ?? tableNum,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: section,
                dropdownColor: const Color(0xFF1E293B),
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Room / Section',
                  labelStyle: TextStyle(color: Colors.white70),
                ),
                items: pos.rooms
                    .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                    .toList(),
                onChanged: (val) => setState(() => section = val ?? section),
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: '$capacity',
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Seating Capacity',
                  labelStyle: TextStyle(color: Colors.white70),
                ),
                onChanged: (val) => capacity = int.tryParse(val) ?? capacity,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
              onPressed: () {
                pos.addTable(
                  tableNum,
                  roomSection: section,
                  seatingCapacity: capacity,
                );
                Navigator.pop(ctx);
              },
              child: const Text('Add Table', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddRoomDialog(BuildContext context, PosProvider pos) {
    String roomName = '';
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Add New Room / Section', style: TextStyle(color: Colors.white)),
        content: TextField(
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'e.g. VIP Lounge, Rooftop Terrace',
            hintStyle: TextStyle(color: Colors.white38),
          ),
          onChanged: (val) => roomName = val,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B)),
            onPressed: () {
              if (roomName.trim().isNotEmpty) {
                pos.addRoom(roomName.trim());
                Navigator.pop(ctx);
              }
            },
            child: const Text('Save Room', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  void _showBookTableDialog(BuildContext context, PosProvider pos, int tableNumber) {
    String name = '';
    String phone = '';
    String time = '7:30 PM';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Book Table $tableNumber', style: const TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Customer Name',
                labelStyle: TextStyle(color: Colors.white70),
              ),
              onChanged: (val) => name = val,
            ),
            const SizedBox(height: 10),
            TextField(
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                labelStyle: TextStyle(color: Colors.white70),
              ),
              onChanged: (val) => phone = val,
            ),
            const SizedBox(height: 10),
            TextField(
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Reservation Time',
                labelStyle: TextStyle(color: Colors.white70),
              ),
              onChanged: (val) => time = val,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF3B82F6)),
            onPressed: () {
              if (name.isNotEmpty) {
                pos.bookTable(
                  tableNumber,
                  customerName: name,
                  customerPhone: phone,
                  bookingTime: time,
                );
                Navigator.pop(ctx);
              }
            },
            child: const Text('Confirm Booking', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteTable(BuildContext context, PosProvider pos, int tableNumber) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Delete Table $tableNumber?', style: const TextStyle(color: Colors.white)),
        content: const Text(
          'Are you sure you want to permanently remove this table?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            onPressed: () {
              pos.deleteTable(tableNumber);
              Navigator.pop(ctx);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
