import '../../core/network/json_parsers.dart';
import '../../domain/models/cart.dart';

abstract final class CartMapper {
  static CartModel fromJson(JsonMap map) {
    final List<JsonMap> rawItems =
        JsonParsers.asJsonMapList(map['items'], context: 'cart.items');
    final List<JsonMap> rawPromos =
        JsonParsers.asJsonMapList(map['promotions'], context: 'cart.promotions');

    return CartModel(
      id: JsonParsers.readString(map, 'id'),
      currencyCode: JsonParsers.readString(map, 'currency_code', fallback: 'thb'),
      regionId: JsonParsers.readString(map, 'region_id', fallback: ''),
      itemSubtotal: JsonParsers.readInt(map, 'item_subtotal', fallback: 0),
      shippingTotal: JsonParsers.readInt(map, 'shipping_total', fallback: 0),
      discountTotal: JsonParsers.readInt(map, 'discount_total', fallback: 0),
      total: JsonParsers.readInt(map, 'total', fallback: 0),
      promoCodes: <String>[
        for (final JsonMap promo in rawPromos)
          if (JsonParsers.readNullableString(promo, 'code') != null)
            JsonParsers.readString(promo, 'code'),
      ],
      items: <CartLineItem>[
        for (final JsonMap item in rawItems) _mapLineItem(item),
      ],
    );
  }

  static CartLineItem _mapLineItem(JsonMap map) {
    final JsonMap? metadata = JsonParsers.readNullableMap(map, 'metadata');
    final JsonMap? offer = JsonParsers.readNullableMap(map, 'offer');
    final JsonMap? seller =
        offer != null ? JsonParsers.readNullableMap(offer, 'seller') : null;

    final String offerId = (offer != null
            ? JsonParsers.readNullableString(offer, 'id')
            : null) ??
        (metadata != null
            ? JsonParsers.readNullableString(metadata, 'offer_id')
            : null) ??
        '';

    final String sellerId = (seller != null
            ? JsonParsers.readNullableString(seller, 'id')
            : null) ??
        (metadata != null
            ? JsonParsers.readNullableString(metadata, 'seller_id')
            : null) ??
        'seller_tamadee';

    final String sellerName = (seller != null
            ? JsonParsers.readNullableString(seller, 'name')
            : null) ??
        (metadata != null
            ? JsonParsers.readNullableString(metadata, 'seller_name')
            : null) ??
        'ร้านค้าทำมาดี';

    final String title =
        JsonParsers.readNullableString(map, 'product_title') ??
            JsonParsers.readString(map, 'title', fallback: 'สินค้าทำมาดี');

    return CartLineItem(
      id: JsonParsers.readString(map, 'id'),
      productId: JsonParsers.readString(map, 'product_id', fallback: ''),
      variantId: JsonParsers.readString(map, 'variant_id', fallback: ''),
      offerId: offerId,
      title: title,
      variantTitle: JsonParsers.readNullableString(map, 'variant_title'),
      thumbnail: JsonParsers.readNullableString(map, 'thumbnail'),
      quantity: JsonParsers.readInt(map, 'quantity', fallback: 1),
      unitPrice: JsonParsers.readInt(map, 'unit_price', fallback: 0),
      sellerId: sellerId,
      sellerName: sellerName,
    );
  }
}
