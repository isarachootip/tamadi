import 'package:flutter/foundation.dart';

@immutable
class CartLineItem {
  const CartLineItem({
    required this.id,
    required this.productId,
    required this.variantId,
    required this.offerId,
    required this.title,
    required this.quantity,
    required this.unitPrice,
    required this.sellerId,
    required this.sellerName,
    this.variantTitle,
    this.thumbnail,
  });

  final String id;
  final String productId;
  final String variantId;
  final String offerId;
  final String title;
  final String? variantTitle;
  final String? thumbnail;
  final int quantity;
  final int unitPrice;
  final String sellerId;
  final String sellerName;

  int get lineTotal => unitPrice * quantity;
}

@immutable
class SellerCartGroup {
  const SellerCartGroup({
    required this.sellerId,
    required this.sellerName,
    required this.items,
  });

  final String sellerId;
  final String sellerName;
  final List<CartLineItem> items;

  int get subtotal => items.fold<int>(0, (int sum, CartLineItem i) => sum + i.lineTotal);
  int get shippingEstimate => subtotal >= 3000 ? 0 : 40;
}

@immutable
class CartModel {
  const CartModel({
    required this.id,
    required this.currencyCode,
    required this.regionId,
    required this.items,
    required this.itemSubtotal,
    required this.shippingTotal,
    required this.discountTotal,
    required this.total,
    this.promoCodes = const <String>[],
  });

  final String id;
  final String currencyCode;
  final String regionId;
  final List<CartLineItem> items;
  final int itemSubtotal;
  final int shippingTotal;
  final int discountTotal;
  final int total;
  final List<String> promoCodes;

  bool get isEmpty => items.isEmpty;

  int get totalQuantity =>
      items.fold<int>(0, (int sum, CartLineItem item) => sum + item.quantity);

  List<SellerCartGroup> get sellerGroups {
    final Map<String, List<CartLineItem>> grouped = <String, List<CartLineItem>>{};
    final Map<String, String> names = <String, String>{};
    for (final CartLineItem item in items) {
      grouped.putIfAbsent(item.sellerId, () => <CartLineItem>[]).add(item);
      names[item.sellerId] = item.sellerName;
    }
    return <SellerCartGroup>[
      for (final MapEntry<String, List<CartLineItem>> entry in grouped.entries)
        SellerCartGroup(
          sellerId: entry.key,
          sellerName: names[entry.key] ?? 'ร้านค้าทำมาดี',
          items: List<CartLineItem>.unmodifiable(entry.value),
        ),
    ];
  }

  int get computedItemSubtotal {
    if (itemSubtotal > 0) {
      return itemSubtotal;
    }
    return items.fold<int>(0, (int sum, CartLineItem item) => sum + item.lineTotal);
  }

  int get effectiveShippingTotal {
    if (items.isEmpty) {
      return 0;
    }
    if (shippingTotal > 0) {
      return shippingTotal;
    }
    return sellerGroups.fold<int>(
      0,
      (int sum, SellerCartGroup g) => sum + g.shippingEstimate,
    );
  }

  int get effectiveGrandTotal =>
      computedItemSubtotal + effectiveShippingTotal - discountTotal;
}
