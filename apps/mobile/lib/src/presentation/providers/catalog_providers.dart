import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/models/category.dart';
import '../../domain/models/product.dart';
import '../../domain/models/seller.dart';
import '../../domain/repositories/catalog_repository.dart';
import 'core_providers.dart';

class SelectedCategoryNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void select(String? categoryId) {
    state = categoryId;
  }
}

final NotifierProvider<SelectedCategoryNotifier, String?>
    selectedHomeCategoryProvider =
    NotifierProvider<SelectedCategoryNotifier, String?>(
      SelectedCategoryNotifier.new,
    );

class ProductFilterNotifier extends Notifier<ProductQueryFilter> {
  @override
  ProductQueryFilter build() => const ProductQueryFilter();

  void update(ProductQueryFilter filter) {
    state = filter;
  }
}

final NotifierProvider<ProductFilterNotifier, ProductQueryFilter>
    productFilterProvider =
    NotifierProvider<ProductFilterNotifier, ProductQueryFilter>(
      ProductFilterNotifier.new,
    );

final FutureProvider<List<ProductCategory>> categoriesProvider =
    FutureProvider<List<ProductCategory>>((Ref ref) {
      return ref.watch(catalogRepositoryProvider).listCategories();
    });

final FutureProvider<List<ProductSummary>> homeProductsProvider =
    FutureProvider<List<ProductSummary>>((Ref ref) {
      final String? categoryId = ref.watch(selectedHomeCategoryProvider);
      return ref.watch(catalogRepositoryProvider).listProducts(
            filter: ProductQueryFilter(categoryId: categoryId),
          );
    });

final FutureProvider<List<ProductSummary>> filteredProductsProvider =
    FutureProvider<List<ProductSummary>>((Ref ref) {
      final ProductQueryFilter filter = ref.watch(productFilterProvider);
      return ref.watch(catalogRepositoryProvider).listProducts(filter: filter);
    });

final productDetailProvider = FutureProvider.family<ProductDetail, String>((
  Ref ref,
  String productId,
) {
  return ref.watch(catalogRepositoryProvider).getProductDetail(productId);
});

final FutureProvider<List<SellerSummary>> sellersListProvider =
    FutureProvider<List<SellerSummary>>((Ref ref) {
      return ref.watch(catalogRepositoryProvider).listSellers();
    });

final sellerDetailProvider = FutureProvider.family<SellerSummary, String>((
  Ref ref,
  String sellerId,
) {
  return ref.watch(catalogRepositoryProvider).getSeller(sellerId);
});

final sellerProductsProvider =
    FutureProvider.family<List<ProductSummary>, String>((
      Ref ref,
      String sellerId,
    ) {
      return ref.watch(catalogRepositoryProvider).listSellerProducts(sellerId);
    });
