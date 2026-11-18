import '../../domain/models/ai_chat.dart';
import '../../domain/models/category.dart';
import '../../domain/models/product.dart';
import '../../domain/models/seller.dart';
import 'app_locale.dart';
import 'catalog_data_en.dart';
import 'catalog_data_zh.dart';

abstract final class CatalogLocalizer {
  static String translateCategoryName(String name, AppLocale locale) {
    if (locale == AppLocale.th) return name;
    final Map<String, String> map =
        locale == AppLocale.en ? categoryNameEnMap : categoryNameZhMap;
    return map[name] ?? name;
  }

  static String translateSellerName(String name, AppLocale locale) {
    if (locale == AppLocale.th) return name;
    final Map<String, CatalogTextPair> map =
        locale == AppLocale.en ? sellerEnByName : sellerZhByName;
    return map[name]?.title ?? name;
  }

  static ProductCategory localizeCategory(
    ProductCategory cat,
    AppLocale locale,
  ) {
    if (locale == AppLocale.th) return cat;
    final Map<String, CatalogTextPair> map =
        locale == AppLocale.en ? categoryEnByHandle : categoryZhByHandle;
    final CatalogTextPair? entry = map[cat.handle];
    return ProductCategory(
      id: cat.id,
      name: entry?.title ?? translateCategoryName(cat.name, locale),
      handle: cat.handle,
      description: entry?.description ?? cat.description,
      rank: cat.rank,
    );
  }

  static SellerSummary localizeSeller(SellerSummary seller, AppLocale locale) {
    if (locale == AppLocale.th) return seller;
    final Map<String, CatalogTextPair> map =
        locale == AppLocale.en ? sellerEnByName : sellerZhByName;
    final CatalogTextPair? entry = map[seller.name];
    if (entry == null) return seller;
    return SellerSummary(
      id: seller.id,
      name: entry.title,
      handle: seller.handle,
      description: entry.description,
      logo: seller.logo,
      banner: seller.banner,
      isPremium: seller.isPremium,
      leadtimeDays: seller.leadtimeDays,
    );
  }

  static ProductSummary localizeProductSummary(
    ProductSummary p,
    AppLocale locale,
  ) {
    if (locale == AppLocale.th) return p;
    final Map<String, CatalogTextPair> map =
        locale == AppLocale.en ? productEnByHandle : productZhByHandle;
    final CatalogTextPair? entry = map[p.handle];
    return ProductSummary(
      id: p.id,
      title: entry?.title ?? p.title,
      subtitle: entry?.description ?? p.subtitle,
      handle: p.handle,
      priceAmount: p.priceAmount,
      thumbnail: p.thumbnail,
      categoryIds: p.categoryIds,
      categoryNames: <String>[
        for (final String n in p.categoryNames) translateCategoryName(n, locale),
      ],
      primaryOfferId: p.primaryOfferId,
      sellerId: p.sellerId,
      sellerName: p.sellerName != null
          ? translateSellerName(p.sellerName!, locale)
          : null,
    );
  }

  static ProductDetail localizeProductDetail(
    ProductDetail d,
    AppLocale locale,
  ) {
    if (locale == AppLocale.th) return d;
    final Map<String, CatalogTextPair> prodMap =
        locale == AppLocale.en ? productEnByHandle : productZhByHandle;
    final Map<String, CatalogTextPair> sellerMap =
        locale == AppLocale.en ? sellerEnByName : sellerZhByName;
    final CatalogTextPair? entry = prodMap[d.handle];

    return ProductDetail(
      id: d.id,
      title: entry?.title ?? d.title,
      subtitle: entry?.description ?? d.subtitle,
      description: entry?.description ?? d.description,
      handle: d.handle,
      thumbnail: d.thumbnail,
      images: d.images,
      categoryNames: <String>[
        for (final String n in d.categoryNames) translateCategoryName(n, locale),
      ],
      options: d.options,
      variants: d.variants,
      offers: <SellerOfferModel>[
        for (final SellerOfferModel o in d.offers)
          SellerOfferModel(
            id: o.id,
            variantId: o.variantId,
            sellerId: o.sellerId,
            sellerName: sellerMap[o.sellerName]?.title ?? o.sellerName,
            sellerHandle: o.sellerHandle,
            priceAmount: o.priceAmount,
            inStock: o.inStock,
            sellerDescription:
                sellerMap[o.sellerName]?.description ?? o.sellerDescription,
            sellerLogo: o.sellerLogo,
            leadtimeDays: o.leadtimeDays,
          ),
      ],
    );
  }

  static AiRecommendedProduct localizeAiProduct(
    AiRecommendedProduct p,
    AppLocale locale,
  ) {
    if (locale == AppLocale.th) return p;
    final Map<String, CatalogTextPair> map =
        locale == AppLocale.en ? productEnByHandle : productZhByHandle;
    final CatalogTextPair? entry = map[p.handle];
    return AiRecommendedProduct(
      id: p.id,
      title: entry?.title ?? p.title,
      handle: p.handle,
      priceAmount: p.priceAmount,
      offerId: p.offerId,
      variantId: p.variantId,
      variantTitle: p.variantTitle,
      sellerId: p.sellerId,
      sellerName: translateSellerName(p.sellerName, locale),
      thumbnail: p.thumbnail,
    );
  }
}
