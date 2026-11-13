import 'package:flutter/foundation.dart';

@immutable
class SellerSummary {
  const SellerSummary({
    required this.id,
    required this.name,
    required this.handle,
    this.description,
    this.logo,
    this.banner,
    this.isPremium = false,
    this.leadtimeDays,
  });

  final String id;
  final String name;
  final String handle;
  final String? description;
  final String? logo;
  final String? banner;
  final bool isPremium;
  final int? leadtimeDays;
}
