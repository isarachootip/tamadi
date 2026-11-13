import '../../core/network/json_parsers.dart';
import '../../domain/models/product.dart';

abstract final class OfferMapper {
  static SellerOfferModel toOffer(JsonMap map) {
    final JsonMap? seller = JsonParsers.readNullableMap(map, 'seller');
    final String sellerId = seller != null
        ? JsonParsers.readString(seller, 'id', fallback: 'seller_default')
        : JsonParsers.readString(map, 'seller_id', fallback: 'seller_default');
    return SellerOfferModel(
      id: JsonParsers.readString(map, 'id'),
      variantId: JsonParsers.readString(map, 'variant_id', fallback: ''),
      sellerId: sellerId,
      sellerName: seller != null
          ? JsonParsers.readString(seller, 'name', fallback: 'ร้านค้าทำมาดี')
          : 'ร้านค้าทำมาดี',
      sellerHandle: seller != null
          ? JsonParsers.readString(seller, 'handle', fallback: '')
          : '',
      sellerDescription: seller != null
          ? JsonParsers.readNullableString(seller, 'description')
          : null,
      sellerLogo: seller != null
          ? JsonParsers.readNullableString(seller, 'logo')
          : null,
      priceAmount: extractOfferPrice(map),
      inStock: map['in_stock'] is bool
          ? JsonParsers.readBool(map, 'in_stock', fallback: true)
          : true,
      leadtimeDays: map['effective_leadtime_to_ship'] == null
          ? null
          : JsonParsers.readInt(map, 'effective_leadtime_to_ship'),
    );
  }

  static ProductSummary? toProductSummary(JsonMap offerMap) {
    final JsonMap? product = JsonParsers.readNullableMap(offerMap, 'product');
    if (product == null) {
      return null;
    }
    final JsonMap? seller = JsonParsers.readNullableMap(offerMap, 'seller');
    return ProductSummary(
      id: JsonParsers.readString(product, 'id'),
      title: JsonParsers.readString(product, 'title'),
      handle: JsonParsers.readString(product, 'handle', fallback: ''),
      subtitle: JsonParsers.readNullableString(product, 'subtitle'),
      thumbnail: JsonParsers.readNullableString(product, 'thumbnail'),
      priceAmount: extractOfferPrice(offerMap),
      primaryOfferId: JsonParsers.readString(offerMap, 'id'),
      sellerId: seller != null
          ? JsonParsers.readNullableString(seller, 'id')
          : JsonParsers.readNullableString(offerMap, 'seller_id'),
      sellerName: seller != null
          ? JsonParsers.readNullableString(seller, 'name')
          : null,
    );
  }

  static int extractCalculatedPrice(JsonMap map) {
    final JsonMap? calc = JsonParsers.readNullableMap(map, 'calculated_price');
    if (calc == null) {
      return 0;
    }
    return JsonParsers.readInt(calc, 'calculated_amount', fallback: 0);
  }

  static int extractOfferPrice(JsonMap offerMap) {
    final int calc = extractCalculatedPrice(offerMap);
    if (calc > 0) {
      return calc;
    }
    final List<JsonMap> prices = JsonParsers.asJsonMapList(offerMap['prices']);
    for (final JsonMap p in prices) {
      final String? curr = JsonParsers.readNullableString(p, 'currency_code');
      if (curr == null || curr.toLowerCase() == 'thb') {
        return JsonParsers.readInt(p, 'amount', fallback: 0);
      }
    }
    return 0;
  }
}
