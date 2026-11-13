import 'package:flutter/foundation.dart';

@immutable
class ProductSummary {
  const ProductSummary({
    required this.id,
    required this.title,
    required this.handle,
    required this.priceAmount,
    this.subtitle,
    this.thumbnail,
    this.categoryIds = const <String>[],
    this.categoryNames = const <String>[],
    this.primaryOfferId,
    this.sellerId,
    this.sellerName,
  });

  final String id;
  final String title;
  final String handle;
  final int priceAmount;
  final String? subtitle;
  final String? thumbnail;
  final List<String> categoryIds;
  final List<String> categoryNames;
  final String? primaryOfferId;
  final String? sellerId;
  final String? sellerName;
}

@immutable
class ProductOptionAxis {
  const ProductOptionAxis({
    required this.id,
    required this.title,
    required this.values,
  });

  final String id;
  final String title;
  final List<String> values;
}

@immutable
class ProductVariantModel {
  const ProductVariantModel({
    required this.id,
    required this.title,
    required this.priceAmount,
    this.sku,
    this.offerId,
    this.optionValues = const <String, String>{},
  });

  final String id;
  final String title;
  final int priceAmount;
  final String? sku;
  final String? offerId;
  final Map<String, String> optionValues;
}

@immutable
class SellerOfferModel {
  const SellerOfferModel({
    required this.id,
    required this.variantId,
    required this.sellerId,
    required this.sellerName,
    required this.sellerHandle,
    required this.priceAmount,
    required this.inStock,
    this.sellerDescription,
    this.sellerLogo,
    this.leadtimeDays,
  });

  final String id;
  final String variantId;
  final String sellerId;
  final String sellerName;
  final String sellerHandle;
  final int priceAmount;
  final bool inStock;
  final String? sellerDescription;
  final String? sellerLogo;
  final int? leadtimeDays;
}

@immutable
class ProductDetail {
  const ProductDetail({
    required this.id,
    required this.title,
    required this.handle,
    required this.options,
    required this.variants,
    required this.offers,
    this.subtitle,
    this.description,
    this.thumbnail,
    this.images = const <String>[],
    this.categoryNames = const <String>[],
  });

  final String id;
  final String title;
  final String handle;
  final String? subtitle;
  final String? description;
  final String? thumbnail;
  final List<String> images;
  final List<String> categoryNames;
  final List<ProductOptionAxis> options;
  final List<ProductVariantModel> variants;
  final List<SellerOfferModel> offers;

  List<String> get galleryUrls {
    final List<String> urls = <String>[
      if (thumbnail != null && thumbnail!.isNotEmpty) thumbnail!,
      for (final String url in images)
        if (url.isNotEmpty && url != thumbnail) url,
    ];
    return urls;
  }

  ProductVariantModel? findVariant(Map<String, String> selectedOptions) {
    if (variants.isEmpty) {
      return null;
    }
    for (final ProductVariantModel variant in variants) {
      bool matchesAll = true;
      for (final MapEntry<String, String> entry in selectedOptions.entries) {
        if (variant.optionValues[entry.key] != entry.value) {
          matchesAll = false;
          break;
        }
      }
      if (matchesAll) {
        return variant;
      }
    }
    return variants.first;
  }

  SellerOfferModel? findOfferForVariant(String? variantId) {
    if (offers.isEmpty) {
      return null;
    }
    if (variantId != null) {
      for (final SellerOfferModel offer in offers) {
        if (offer.variantId == variantId) {
          return offer;
        }
      }
    }
    return offers.first;
  }
}
