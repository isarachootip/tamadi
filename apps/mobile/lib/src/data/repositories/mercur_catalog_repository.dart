import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/json_parsers.dart';
import '../../domain/models/category.dart';
import '../../domain/models/product.dart';
import '../../domain/models/seller.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../mappers/offer_mapper.dart';
import '../mappers/product_mapper.dart';
import '../mappers/seller_category_mapper.dart';

class MercurCatalogRepository implements CatalogRepository {
  MercurCatalogRepository({required ApiClient apiClient}) {
    _apiClient = apiClient;
  }

  late final ApiClient _apiClient;
  String? _cachedRegionId;

  @override
  Future<String> getThailandRegionId() async {
    if (_cachedRegionId != null) {
      return _cachedRegionId!;
    }
    final JsonMap response = await _apiClient.get('/store/regions');
    final List<JsonMap> regions =
        JsonParsers.asJsonMapList(response['regions'], context: 'regions');
    for (final JsonMap region in regions) {
      final String currency =
          JsonParsers.readString(region, 'currency_code', fallback: '')
              .toLowerCase();
      if (currency == 'thb') {
        _cachedRegionId = JsonParsers.readString(region, 'id');
        return _cachedRegionId!;
      }
    }
    if (regions.isNotEmpty) {
      _cachedRegionId = JsonParsers.readString(regions.first, 'id');
      return _cachedRegionId!;
    }
    throw const ApiException(message: 'ไม่พบภูมิภาคสกุลเงินบาท (THB) ในระบบ');
  }

  @override
  Future<List<ProductCategory>> listCategories() async {
    final JsonMap response = await _apiClient.get(
      '/store/product-categories',
      queryParameters: <String, Object?>{'limit': 50},
    );
    final List<JsonMap> list = JsonParsers.asJsonMapList(
      response['product_categories'],
      context: 'product_categories',
    );
    final List<ProductCategory> categories = <ProductCategory>[
      for (final JsonMap c in list) SellerCategoryMapper.toCategory(c),
    ]..sort((ProductCategory a, ProductCategory b) => a.rank.compareTo(b.rank));
    return categories;
  }

  @override
  Future<List<ProductSummary>> listProducts({
    ProductQueryFilter filter = const ProductQueryFilter(),
  }) async {
    final String regionId = await getThailandRegionId();
    final Map<String, Object?> params = <String, Object?>{
      'limit': 50,
      'region_id': regionId,
      'fields': '*variants.calculated_price,+variants.offer_id,*categories',
      if (filter.query != null && filter.query!.trim().isNotEmpty)
        'q': filter.query!.trim(),
      if (filter.categoryId != null && filter.categoryId!.isNotEmpty)
        'category_id': filter.categoryId,
    };

    final JsonMap response =
        await _apiClient.get('/store/products', queryParameters: params);
    final List<JsonMap> rawProducts =
        JsonParsers.asJsonMapList(response['products'], context: 'products');
    List<ProductSummary> items = <ProductSummary>[
      for (final JsonMap p in rawProducts) ProductMapper.toSummary(p),
    ];

    if (filter.minPrice != null) {
      items = items
          .where((ProductSummary p) => p.priceAmount >= filter.minPrice!)
          .toList();
    }
    if (filter.maxPrice != null) {
      items = items
          .where((ProductSummary p) => p.priceAmount <= filter.maxPrice!)
          .toList();
    }
    return switch (filter.sort) {
      ProductSortOption.priceAsc =>
        items..sort((ProductSummary a, ProductSummary b) => a.priceAmount.compareTo(b.priceAmount)),
      ProductSortOption.priceDesc =>
        items..sort((ProductSummary a, ProductSummary b) => b.priceAmount.compareTo(a.priceAmount)),
      ProductSortOption.newest || ProductSortOption.recommended => items,
    };
  }

  @override
  Future<ProductDetail> getProductDetail(String productId) async {
    final String regionId = await getThailandRegionId();
    final List<JsonMap> responses = await Future.wait<JsonMap>(<Future<JsonMap>>[
      _apiClient.get(
        '/store/products/$productId',
        queryParameters: <String, Object?>{
          'region_id': regionId,
          'fields': '*variants.calculated_price,+variants.offer_id,*categories',
        },
      ),
      _apiClient.get(
        '/store/offers',
        queryParameters: <String, Object?>{
          'product_id': productId,
          'region_id': regionId,
          'limit': 50,
          'fields':
              '+calculated_price,+effective_leadtime_to_ship,+seller.description,+seller.logo',
        },
      ),
    ]);

    final JsonMap productJson =
        JsonParsers.asJsonMap(responses[0]['product'], context: 'product');
    final List<JsonMap> offersJson =
        JsonParsers.asJsonMapList(responses[1]['offers'], context: 'offers');
    return ProductMapper.toDetail(productJson, offersJson);
  }

  @override
  Future<List<SellerSummary>> listSellers() async {
    final JsonMap res = await _apiClient.get(
      '/store/sellers',
      queryParameters: <String, Object?>{
        'limit': 50,
        'fields': '+default_leadtime_to_ship',
      },
    );
    return <SellerSummary>[
      for (final JsonMap s in JsonParsers.asJsonMapList(res['sellers']))
        SellerCategoryMapper.toSeller(s),
    ];
  }

  @override
  Future<SellerSummary> getSeller(String sellerId) async {
    final JsonMap res = await _apiClient.get(
      '/store/sellers/$sellerId',
      queryParameters: <String, Object?>{
        'fields': '+default_leadtime_to_ship',
      },
    );
    return SellerCategoryMapper.toSeller(
      JsonParsers.asJsonMap(res['seller'], context: 'seller'),
    );
  }

  @override
  Future<List<ProductSummary>> listSellerProducts(String sellerId) async {
    final String regionId = await getThailandRegionId();
    final JsonMap res = await _apiClient.get(
      '/store/offers',
      queryParameters: <String, Object?>{
        'seller_id': sellerId,
        'region_id': regionId,
        'limit': 50,
        'fields':
            '+calculated_price,+product.id,+product.title,+product.subtitle,+product.handle,+product.thumbnail',
      },
    );
    final Map<String, ProductSummary> deduped = <String, ProductSummary>{};
    for (final JsonMap offer in JsonParsers.asJsonMapList(res['offers'])) {
      final ProductSummary? summary = OfferMapper.toProductSummary(offer);
      if (summary != null) {
        deduped.putIfAbsent(summary.id, () => summary);
      }
    }
    return deduped.values.toList(growable: false);
  }
}
