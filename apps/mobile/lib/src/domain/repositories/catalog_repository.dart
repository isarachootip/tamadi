import '../models/category.dart';
import '../models/product.dart';
import '../models/seller.dart';

enum ProductSortOption {
  recommended('แนะนำ'),
  priceAsc('ราคาต่ำ → สูง'),
  priceDesc('ราคาสูง → ต่ำ'),
  newest('มาใหม่ล่าสุด');

  const ProductSortOption(this.label);
  final String label;
}

class ProductQueryFilter {
  const ProductQueryFilter({
    this.query,
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.sort = ProductSortOption.recommended,
  });

  final String? query;
  final String? categoryId;
  final int? minPrice;
  final int? maxPrice;
  final ProductSortOption sort;
}

abstract interface class CatalogRepository {
  Future<String> getThailandRegionId();
  Future<List<ProductCategory>> listCategories();
  Future<List<ProductSummary>> listProducts({
    ProductQueryFilter filter = const ProductQueryFilter(),
  });
  Future<ProductDetail> getProductDetail(String productId);
  Future<List<SellerSummary>> listSellers();
  Future<SellerSummary> getSeller(String sellerId);
  Future<List<ProductSummary>> listSellerProducts(String sellerId);
}
