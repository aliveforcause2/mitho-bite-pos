// lib/screens/subscription_admin_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/pos_provider.dart';
import '../models/subscription_model.dart';

class SubscriptionAdminScreen extends StatelessWidget {
  const SubscriptionAdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final pos = context.watch<PosProvider>();
    final profile = pos.profile;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Admin & Restaurant Settings',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Subscription Plan Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF4C1D95)],
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: Colors.purple.withOpacity(0.3),
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
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.amber,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'ENTERPRISE LIFETIME PRO',
                          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                      const Icon(Icons.verified, color: Colors.amber, size: 24),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    profile.restaurantName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Owner: ${profile.ownerName}  •  ${profile.phone}',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  const Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.greenAccent, size: 16),
                      SizedBox(width: 6),
                      Text('Unlimited Tables & Rooms', style: TextStyle(color: Colors.white, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.greenAccent, size: 16),
                      SizedBox(width: 6),
                      Text('Live Kitchen KDS & Cloud Sync', style: TextStyle(color: Colors.white, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.greenAccent, size: 16),
                      SizedBox(width: 6),
                      Text('PAN/VAT Nepali Billing & QR Integration', style: TextStyle(color: Colors.white, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Tax & Billing Settings
            const Text('Tax & PAN/VAT Configuration', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  ListTile(
                    title: const Text('Restaurant PAN / VAT Number', style: TextStyle(color: Colors.white)),
                    subtitle: Text(profile.panVatNumber, style: const TextStyle(color: Color(0xFFF59E0B))),
                    trailing: IconButton(
                      icon: const Icon(Icons.edit, color: Color(0xFF3B82F6)),
                      onPressed: () => _editPanDialog(context, pos),
                    ),
                  ),
                  const Divider(color: Colors.white12, height: 1),
                  ListTile(
                    title: const Text('VAT Rate', style: TextStyle(color: Colors.white)),
                    subtitle: Text('${profile.vatRate}% Government VAT', style: const TextStyle(color: Colors.white60)),
                    trailing: Text('${profile.vatRate}%', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                  const Divider(color: Colors.white12, height: 1),
                  ListTile(
                    title: const Text('Service Charge Rate', style: TextStyle(color: Colors.white)),
                    subtitle: Text('${profile.serviceChargeRate}% Service Fee', style: const TextStyle(color: Colors.white60)),
                    trailing: Text('${profile.serviceChargeRate}%', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Contact & Location
            const Text('Business Location & Contact', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.location_on, color: Color(0xFFF59E0B)),
                    title: const Text('Address', style: TextStyle(color: Colors.white)),
                    subtitle: Text(profile.address, style: const TextStyle(color: Colors.white60)),
                  ),
                  const Divider(color: Colors.white12, height: 1),
                  ListTile(
                    leading: const Icon(Icons.phone, color: Color(0xFF10B981)),
                    title: const Text('Phone Number', style: TextStyle(color: Colors.white)),
                    subtitle: Text(profile.phone, style: const TextStyle(color: Colors.white60)),
                  ),
                  const Divider(color: Colors.white12, height: 1),
                  ListTile(
                    leading: const Icon(Icons.email, color: Color(0xFF3B82F6)),
                    title: const Text('Official Email', style: TextStyle(color: Colors.white)),
                    subtitle: Text(profile.email, style: const TextStyle(color: Colors.white60)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _editPanDialog(BuildContext context, PosProvider pos) {
    String name = pos.profile.restaurantName;
    String pan = pos.profile.panVatNumber;
    String address = pos.profile.address;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Edit Business Details', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: TextEditingController(text: name),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(labelText: 'Restaurant Name', labelStyle: TextStyle(color: Colors.white70)),
              onChanged: (val) => name = val,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: TextEditingController(text: pan),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(labelText: 'PAN / VAT Number', labelStyle: TextStyle(color: Colors.white70)),
              onChanged: (val) => pan = val,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: TextEditingController(text: address),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(labelText: 'Location / City', labelStyle: TextStyle(color: Colors.white70)),
              onChanged: (val) => address = val,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          ElevatedButton(
            style: ElevatedButton.backgroundColor(const Color(0xFFF59E0B)),
            onPressed: () {
              pos.updateProfile(
                RestaurantProfile(
                  restaurantName: name,
                  panVatNumber: pan,
                  address: address,
                  phone: pos.profile.phone,
                  ownerName: pos.profile.ownerName,
                  email: pos.profile.email,
                  tier: pos.profile.tier,
                ),
              );
              Navigator.pop(ctx);
            },
            child: const Text('Save Profile', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }
}
