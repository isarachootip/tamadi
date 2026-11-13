import 'package:flutter/foundation.dart';

@immutable
class ProductCategory {
  const ProductCategory({
    required this.id,
    required this.name,
    required this.handle,
    this.description,
    this.rank = 0,
  });

  final String id;
  final String name;
  final String handle;
  final String? description;
  final int rank;
}
