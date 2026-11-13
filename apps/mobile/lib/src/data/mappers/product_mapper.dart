import '../../core/network/json_parsers.dart';
import '../../domain/models/product.dart';
import 'offer_mapper.dart';

abstract final class ProductMapper {
  static ProductSummary toSummary(JsonMap map) {
    final List<JsonMap> variants =
        JsonParsers.asJsonMapList(map['variants'], context: 'variants');
    final List<JsonMap> categories =
        JsonParsers.asJsonMapList(map['categories'], context: 'categories');

    int cheapestPrice = 0;
    String? primaryOfferId;
    for (final JsonMap v in variants) {
      final int price = OfferMapper.extractCalculatedPrice(v);
      if (price > 0 && (cheapestPrice == 0 || price < cheapestPrice)) {
        cheapestPrice = price;
        primaryOfferId = JsonParsers.readNullableString(v, 'offer_id');
      } else {
        primaryOfferId ??= JsonParsers.readNullableString(v, 'offer_id');
      }
    }

    return ProductSummary(
      id: JsonParsers.readString(map, 'id'),
      title: JsonParsers.readString(map, 'title'),
      handle: JsonParsers.readString(map, 'handle', fallback: ''),
      subtitle: JsonParsers.readNullableString(map, 'subtitle'),
      thumbnail: _resolveThumbnail(map),
      priceAmount: cheapestPrice,
      primaryOfferId: primaryOfferId,
      categoryIds: <String>[
        for (final JsonMap c in categories) JsonParsers.readString(c, 'id'),
      ],
      categoryNames: <String>[
        for (final JsonMap c in categories) JsonParsers.readString(c, 'name'),
      ],
    );
  }

  static ProductDetail toDetail(JsonMap map, List<JsonMap> rawOffers) {
    final List<JsonMap> rawOptions =
        JsonParsers.asJsonMapList(map['options'], context: 'options');
    final Map<String, String> optionIdToTitle = <String, String>{};
    final List<ProductOptionAxis> options = <ProductOptionAxis>[];

    for (final JsonMap opt in rawOptions) {
      final String id = JsonParsers.readString(opt, 'id');
      final String title = JsonParsers.readString(opt, 'title');
      optionIdToTitle[id] = title;
      final List<JsonMap> rawVals =
          JsonParsers.asJsonMapList(opt['values'], context: 'options.values');
      options.add(
        ProductOptionAxis(
          id: id,
          title: title,
          values: <String>[
            for (final JsonMap val in rawVals)
              JsonParsers.readString(val, 'value'),
          ],
        ),
      );
    }

    final List<SellerOfferModel> offers = <SellerOfferModel>[
      for (final JsonMap o in rawOffers) OfferMapper.toOffer(o),
    ];

    final List<JsonMap> rawVariants =
        JsonParsers.asJsonMapList(map['variants'], context: 'variants');
    final List<ProductVariantModel> variants = <ProductVariantModel>[];
    for (final JsonMap v in rawVariants) {
      final String variantId = JsonParsers.readString(v, 'id');
      final Map<String, String> selectedMap = <String, String>{};
      for (final JsonMap vo in JsonParsers.asJsonMapList(v['options'])) {
        final String? optId = JsonParsers.readNullableString(vo, 'option_id');
        final String? val = JsonParsers.readNullableString(vo, 'value');
        final String? axisTitle = optId != null ? optionIdToTitle[optId] : null;
        if (axisTitle != null && val != null) {
          selectedMap[axisTitle] = val;
        }
      }
      int price = OfferMapper.extractCalculatedPrice(v);
      String? offerId = JsonParsers.readNullableString(v, 'offer_id');
      for (final SellerOfferModel offer in offers) {
        if (offer.variantId == variantId) {
          if (price == 0) {
            price = offer.priceAmount;
          }
          offerId ??= offer.id;
          break;
        }
      }
      variants.add(
        ProductVariantModel(
          id: variantId,
          title: JsonParsers.readString(v, 'title', fallback: ''),
          sku: JsonParsers.readNullableString(v, 'sku'),
          priceAmount: price,
          offerId: offerId,
          optionValues: selectedMap,
        ),
      );
    }

    final List<JsonMap> rawImages = JsonParsers.asJsonMapList(map['images']);
    final List<JsonMap> rawCats = JsonParsers.asJsonMapList(map['categories']);

    return ProductDetail(
      id: JsonParsers.readString(map, 'id'),
      title: JsonParsers.readString(map, 'title'),
      handle: JsonParsers.readString(map, 'handle', fallback: ''),
      subtitle: JsonParsers.readNullableString(map, 'subtitle'),
      description: JsonParsers.readNullableString(map, 'description'),
      thumbnail: _resolveThumbnail(map),
      images: <String>[
        for (final JsonMap img in rawImages)
          if (JsonParsers.readNullableString(img, 'url') != null)
            JsonParsers.readString(img, 'url'),
      ],
      categoryNames: <String>[
        for (final JsonMap c in rawCats) JsonParsers.readString(c, 'name'),
      ],
      options: options,
      variants: variants,
      offers: offers,
    );
  }

  static String? _resolveThumbnail(JsonMap map) {
    final String? thumb = JsonParsers.readNullableString(map, 'thumbnail');
    if (thumb != null) {
      return thumb;
    }
    final List<JsonMap> imgs = JsonParsers.asJsonMapList(map['images']);
    return imgs.isNotEmpty
        ? JsonParsers.readNullableString(imgs.first, 'url')
        : null;
  }
}
