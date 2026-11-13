import 'package:tamadee_mobile/src/domain/models/category.dart';
import 'package:tamadee_mobile/src/domain/models/product.dart';
import 'package:tamadee_mobile/src/domain/models/seller.dart';
import 'package:tamadee_mobile/src/domain/repositories/catalog_repository.dart';

class FakeCatalogRepository implements CatalogRepository {
  static const ProductSummary shirtSummary = ProductSummary(
    id: 'prod_shirt',
    title: 'เสื้อเชิ้ตลินิน',
    subtitle: 'ทรงหลวม ผ้าลินินแท้',
    handle: 'linen-relaxed-shirt',
    priceAmount: 890,
    primaryOfferId: 'off_shirt_m',
    categoryIds: <String>['cat_apparel'],
    categoryNames: <String>['เสื้อผ้า'],
    sellerId: 'sel_lamai',
    sellerName: 'ละไม สตูดิโอ',
  );

  static const ProductSummary bagSummary = ProductSummary(
    id: 'prod_bag',
    title: 'กระเป๋าผ้าแคนวาส',
    subtitle: 'ทรงกว้าง จุของได้เยอะ',
    handle: 'canvas-tote-bag',
    priceAmount: 1590,
    primaryOfferId: 'off_bag',
    categoryIds: <String>['cat_bags'],
    categoryNames: <String>['กระเป๋า'],
    sellerId: 'sel_baandin',
    sellerName: 'บ้านดิน คราฟต์',
  );

  @override
  Future<String> getThailandRegionId() async => 'reg_th';

  @override
  Future<List<ProductCategory>> listCategories() async =>
      const <ProductCategory>[
        ProductCategory(id: 'cat_apparel', name: 'เสื้อผ้า', handle: 'apparel'),
        ProductCategory(id: 'cat_bags', name: 'กระเป๋า', handle: 'bags'),
      ];

  @override
  Future<List<ProductSummary>> listProducts({
    ProductQueryFilter filter = const ProductQueryFilter(),
  }) async {
    const List<ProductSummary> all = <ProductSummary>[shirtSummary, bagSummary];
    if (filter.categoryId != null) {
      return all
          .where((ProductSummary p) => p.categoryIds.contains(filter.categoryId))
          .toList();
    }
    return all;
  }

  @override
  Future<ProductDetail> getProductDetail(String productId) async {
    return const ProductDetail(
      id: 'prod_shirt',
      title: 'เสื้อเชิ้ตลินิน',
      subtitle: 'ทรงหลวม ผ้าลินินแท้',
      description: 'ตัดเย็บจากผ้าลินินธรรมชาติ ระบายอากาศดีเยี่ยม',
      handle: 'linen-relaxed-shirt',
      options: <ProductOptionAxis>[
        ProductOptionAxis(
          id: 'opt_size',
          title: 'ไซซ์',
          values: <String>['S', 'M', 'L'],
        ),
        ProductOptionAxis(
          id: 'opt_color',
          title: 'สี',
          values: <String>['ขาวครีม', 'ดำ'],
        ),
      ],
      variants: <ProductVariantModel>[
        ProductVariantModel(
          id: 'var_m',
          title: 'M / ขาวครีม',
          priceAmount: 890,
          offerId: 'off_shirt_m',
          optionValues: <String, String>{'ไซซ์': 'M', 'สี': 'ขาวครีม'},
        ),
      ],
      offers: <SellerOfferModel>[
        SellerOfferModel(
          id: 'off_shirt_m',
          variantId: 'var_m',
          sellerId: 'sel_lamai',
          sellerName: 'ละไม สตูดิโอ',
          sellerHandle: 'lamai-studio',
          priceAmount: 890,
          inStock: true,
          leadtimeDays: 2,
        ),
      ],
    );
  }

  @override
  Future<List<SellerSummary>> listSellers() async => const <SellerSummary>[
        SellerSummary(
          id: 'sel_lamai',
          name: 'ละไม สตูดิโอ',
          handle: 'lamai-studio',
          description: 'เสื้อผ้าลินินธรรมชาติ',
        ),
      ];

  @override
  Future<SellerSummary> getSeller(String sellerId) async =>
      (await listSellers()).first;

  @override
  Future<List<ProductSummary>> listSellerProducts(String sellerId) async =>
      const <ProductSummary>[shirtSummary];
}
