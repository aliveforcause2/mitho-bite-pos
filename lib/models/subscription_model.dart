// lib/models/subscription_model.dart

enum SubscriptionTier { basic, pro, enterprise }

class RestaurantProfile {
  final String restaurantName;
  final String panVatNumber;
  final String address;
  final String phone;
  final String ownerName;
  final String email;
  final SubscriptionTier tier;
  final DateTime subscriptionExpiry;
  final bool isPanEnabled;
  final double vatRate; // default 13%
  final double serviceChargeRate; // default 10%
  final String currency; // 'Rs.' or 'NPR'

  RestaurantProfile({
    this.restaurantName = 'miTHOBITE Restaurant & Bar',
    this.panVatNumber = '609823412',
    this.address = 'Thamel / Jhamsikhel, Kathmandu',
    this.phone = '+977-9800000000',
    this.ownerName = 'Restaurant Owner / Admin',
    this.email = 'owner@mithobite.com',
    this.tier = SubscriptionTier.enterprise,
    DateTime? subscriptionExpiry,
    this.isPanEnabled = true,
    this.vatRate = 13.0,
    this.serviceChargeRate = 10.0,
    this.currency = 'Rs.',
  }) : subscriptionExpiry = subscriptionExpiry ?? DateTime.now().add(const Duration(days: 365));

  factory RestaurantProfile.fromMap(Map<String, dynamic> map) {
    SubscriptionTier tier = SubscriptionTier.enterprise;
    final tierStr = (map['tier'] ?? '').toString().toLowerCase();
    if (tierStr == 'basic') tier = SubscriptionTier.basic;
    if (tierStr == 'pro') tier = SubscriptionTier.pro;

    return RestaurantProfile(
      restaurantName: map['restaurantName'] ?? 'miTHOBITE Restaurant & Bar',
      panVatNumber: map['panVatNumber'] ?? '609823412',
      address: map['address'] ?? 'Kathmandu, Nepal',
      phone: map['phone'] ?? '+977-9800000000',
      ownerName: map['ownerName'] ?? 'Admin Owner',
      email: map['email'] ?? 'admin@mithobite.com',
      tier: tier,
      subscriptionExpiry: map['subscriptionExpiry'] != null
          ? DateTime.tryParse(map['subscriptionExpiry']) ?? DateTime.now().add(const Duration(days: 365))
          : DateTime.now().add(const Duration(days: 365)),
      isPanEnabled: map['isPanEnabled'] ?? true,
      vatRate: (map['vatRate'] is num) ? (map['vatRate'] as num).toDouble() : 13.0,
      serviceChargeRate: (map['serviceChargeRate'] is num) ? (map['serviceChargeRate'] as num).toDouble() : 10.0,
      currency: map['currency'] ?? 'Rs.',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'restaurantName': restaurantName,
      'panVatNumber': panVatNumber,
      'address': address,
      'phone': phone,
      'ownerName': ownerName,
      'email': email,
      'tier': tier.name,
      'subscriptionExpiry': subscriptionExpiry.toIso8601String(),
      'isPanEnabled': isPanEnabled,
      'vatRate': vatRate,
      'serviceChargeRate': serviceChargeRate,
      'currency': currency,
    };
  }
}
