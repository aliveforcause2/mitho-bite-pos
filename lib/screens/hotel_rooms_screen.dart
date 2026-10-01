// lib/screens/hotel_rooms_screen.dart
import 'package:flutter/material.dart';
import '../widgets/nepali_payment_dialog.dart';

class RoomBookingModel {
  final String roomNumber;
  final String roomType;
  final double pricePerNight;
  final bool isOccupied;
  final String? guestName;
  final String? guestPhone;
  final int nights;
  final double foodBills;

  RoomBookingModel({
    required this.roomNumber,
    required this.roomType,
    required this.pricePerNight,
    this.isOccupied = false,
    this.guestName,
    this.guestPhone,
    this.nights = 1,
    this.foodBills = 0.0,
  });

  RoomBookingModel copyWith({
    bool? isOccupied,
    String? guestName,
    String? guestPhone,
    int? nights,
    double? foodBills,
  }) {
    return RoomBookingModel(
      roomNumber: roomNumber,
      roomType: roomType,
      pricePerNight: pricePerNight,
      isOccupied: isOccupied ?? this.isOccupied,
      guestName: guestName ?? this.guestName,
      guestPhone: guestPhone ?? this.guestPhone,
      nights: nights ?? this.nights,
      foodBills: foodBills ?? this.foodBills,
    );
  }
}

class HotelRoomsScreen extends StatefulWidget {
  const HotelRoomsScreen({super.key});

  @override
  State<HotelRoomsScreen> createState() => _HotelRoomsScreenState();
}

class _HotelRoomsScreenState extends State<HotelRoomsScreen> {
  final List<RoomBookingModel> _hotelRooms = [
    RoomBookingModel(roomNumber: '101', roomType: 'Deluxe AC Double', pricePerNight: 3500, isOccupied: true, guestName: 'Rohan Gurung', guestPhone: '9841234567', nights: 2, foodBills: 1250),
    RoomBookingModel(roomNumber: '102', roomType: 'Super Deluxe King', pricePerNight: 4500, isOccupied: false),
    RoomBookingModel(roomNumber: '103', roomType: 'Standard Non-AC', pricePerNight: 2000, isOccupied: true, guestName: 'Anita Thapa', guestPhone: '9851098765', nights: 1, foodBills: 640),
    RoomBookingModel(roomNumber: '104', roomType: 'Executive Suite', pricePerNight: 6500, isOccupied: false),
    RoomBookingModel(roomNumber: '105', roomType: 'Family Quad Room', pricePerNight: 5000, isOccupied: false),
    RoomBookingModel(roomNumber: '201', roomType: 'Banquet Party Hall', pricePerNight: 15000, isOccupied: true, guestName: 'Sunil Shrestha (Reception)', guestPhone: '9801234567', nights: 1, foodBills: 18500),
  ];

  @override
  Widget build(BuildContext context) {
    final occupiedCount = _hotelRooms.where((r) => r.isOccupied).length;
    final availableCount = _hotelRooms.length - occupiedCount;
    final isWide = MediaQuery.of(context).size.width > 600;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.hotel_rounded, color: Color(0xFFF59E0B)),
            SizedBox(width: 8),
            Text('Hotel Rooms & Banquet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white)),
          ],
        ),
      ),
      body: Column(
        children: [
          // Stats bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF1E293B),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatPill('Available: $availableCount', const Color(0xFF10B981)),
                _buildStatPill('Occupied: $occupiedCount', const Color(0xFFEF4444)),
                Text(
                  '${_hotelRooms.length} Total Rooms',
                  style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ],
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: isWide ? 3 : 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.88,
              ),
              itemCount: _hotelRooms.length,
              itemBuilder: (context, index) {
                final room = _hotelRooms[index];
                final isOccupied = room.isOccupied;

                return Card(
                  color: isOccupied ? const Color(0xFF3B1822) : const Color(0xFF132E27),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                      color: isOccupied ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                      width: 1.5,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Room ${room.roomNumber}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: isOccupied ? Colors.red.shade900 : Colors.green.shade900,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                isOccupied ? 'OCCUPIED' : 'VACANT',
                                style: TextStyle(
                                  color: isOccupied ? Colors.redAccent : Colors.greenAccent,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          room.roomType,
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          'Rs. ${room.pricePerNight.toStringAsFixed(0)} / night',
                          style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        if (isOccupied)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '👤 ${room.guestName}',
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '🍽️ Food: Rs. ${room.foodBills.toStringAsFixed(0)}',
                                style: const TextStyle(color: Colors.white60, fontSize: 10),
                              ),
                            ],
                          ),
                        SizedBox(
                          width: double.infinity,
                          height: 28,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isOccupied ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              padding: EdgeInsets.zero,
                            ),
                            onPressed: () {
                              if (isOccupied) {
                                _showCheckoutDialog(room, index);
                              } else {
                                _showCheckInDialog(room, index);
                              }
                            },
                            child: Text(
                              isOccupied ? 'Checkout & Bill' : 'Check-In Guest',
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showCheckInDialog(RoomBookingModel room, int index) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    int nights = 1;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text('Check-In: Room ${room.roomNumber}', style: const TextStyle(color: Colors.white, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Guest Name', labelStyle: TextStyle(color: Colors.white70)),
              ),
              TextField(
                controller: phoneCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Phone Number', labelStyle: TextStyle(color: Colors.white70)),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Nights:', style: TextStyle(color: Colors.white70)),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove, color: Colors.white),
                        onPressed: nights > 1 ? () => setDialogState(() => nights--) : null,
                      ),
                      Text('$nights', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.add, color: Colors.white),
                        onPressed: () => setDialogState(() => nights++),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white60))),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
              onPressed: () {
                if (nameCtrl.text.isNotEmpty) {
                  setState(() {
                    _hotelRooms[index] = room.copyWith(
                      isOccupied: true,
                      guestName: nameCtrl.text,
                      guestPhone: phoneCtrl.text,
                      nights: nights,
                    );
                  });
                  Navigator.pop(ctx);
                }
              },
              child: const Text('Confirm Check-In', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showCheckoutDialog(RoomBookingModel room, int index) {
    final roomCharges = room.pricePerNight * room.nights;
    final grandTotal = roomCharges + room.foodBills;

    showDialog(
      context: context,
      builder: (_) => NepaliPaymentDialog(
        orderId: 'ROOM-${room.roomNumber}',
        tableNumber: int.tryParse(room.roomNumber) ?? 0,
        totalAmount: grandTotal,
        onPaymentSuccess: (method, ref) {
          setState(() {
            _hotelRooms[index] = RoomBookingModel(
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerNight: room.pricePerNight,
              isOccupied: false,
            );
          });
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Room ${room.roomNumber} checked out! Total Rs. ${grandTotal.toStringAsFixed(0)} settled via $method.'),
              backgroundColor: const Color(0xFF10B981),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatPill(String text, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 7, height: 7, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 11)),
      ],
    );
  }
}
