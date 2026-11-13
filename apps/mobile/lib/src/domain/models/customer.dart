import 'package:flutter/foundation.dart';

@immutable
class CustomerAddress {
  const CustomerAddress({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.address1,
    required this.city,
    required this.province,
    required this.postalCode,
    required this.phone,
    this.addressName,
    this.isDefaultShipping = false,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String address1;
  final String city;
  final String province;
  final String postalCode;
  final String phone;
  final String? addressName;
  final bool isDefaultShipping;

  String get fullName => '$firstName $lastName'.trim();
}

@immutable
class CustomerProfile {
  const CustomerProfile({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.addresses = const <CustomerAddress>[],
  });

  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final List<CustomerAddress> addresses;

  String get displayName {
    final String full = '${firstName ?? ''} ${lastName ?? ''}'.trim();
    return full.isEmpty ? email : full;
  }
}

@immutable
class OrderGroupSummary {
  const OrderGroupSummary({
    required this.id,
    required this.createdAt,
    required this.orderCount,
    required this.totalAmount,
  });

  final String id;
  final String createdAt;
  final int orderCount;
  final int totalAmount;
}
