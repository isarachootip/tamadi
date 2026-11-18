import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/l10n/app_locale.dart';
import '../../core/l10n/catalog_localizer.dart';
import '../../domain/models/category.dart';
import '../../domain/models/product.dart';
import '../../domain/models/seller.dart';
import '../../domain/repositories/catalog_repository.dart';
import 'core_providers.dart';
import 'locale_controller.dart';

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
    FutureProvider<List<ProductCategory>>((Ref ref) async {
      final AppLocale locale = ref.watch(localeControllerProvider);
      final List<ProductCategory> raw = await ref
          .watch(catalogRepositoryProvider)
          .listCategories();
      return <ProductCategory>[
        for (final ProductCategory c in raw)
          CatalogLocalizer.localizeCategory(c, locale),
      ];
    });

final FutureProvider<List<ProductSummary>> homeProductsProvider =
    FutureProvider<List<ProductSummary>>((Ref ref) async {
      final AppLocale locale = ref.watch(localeControllerProvider);
      final String? categoryId = ref.watch(selectedHomeCategoryProvider);
      final List<ProductSummary> raw = await ref
          .watch(catalogRepositoryProvider)
          .listProducts(filter: ProductQueryFilter(categoryId: categoryId));
      return <ProductSummary>[
        for (final ProductSummary p in raw)
          CatalogLocalizer.localizeProductSummary(p, locale),
      ];
    });

final FutureProvider<List<ProductSummary>> filteredProductsProvider =
    FutureProvider<List<ProductSummary>>((Ref ref) async {
      final AppLocale locale = ref.watch(localeControllerProvider);
      final ProductQueryFilter filter = ref.watch(productFilterProvider);
      final List<ProductSummary> raw = await ref
          .watch(catalogRepositoryProvider)
          .listProducts(filter: filter);
      return <ProductSummary>[
        for (final ProductSummary p in raw)
          CatalogLocalizer.localizeProductSummary(p, locale),
      ];
    });

final productDetailProvider = FutureProvider.family<ProductDetail, String>((
  Ref ref,
  String productId,
) async {
  final AppLocale locale = ref.watch(localeControllerProvider);
  final ProductDetail raw = await ref
      .watch(catalogRepositoryProvider)
      .getProductDetail(productId);
  return CatalogLocalizer.localizeProductDetail(raw, locale);
});

final FutureProvider<List<SellerSummary>> sellersListProvider =
    FutureProvider<List<SellerSummary>>((Ref ref) async {
      final AppLocale locale = ref.watch(localeControllerProvider);
      final List<SellerSummary> raw = await ref
          .watch(catalogRepositoryProvider)
          .listSellers();
      return <SellerSummary>[
        for (final SellerSummary s in raw)
          CatalogLocalizer.localizeSeller(s, locale),
      ];
    });

final sellerDetailProvider = FutureProvider.family<SellerSummary, String>((
  Ref ref,
  String sellerId,
) async {
  final AppLocale locale = ref.watch(localeControllerProvider);
  final SellerSummary raw = await ref
      .watch(catalogRepositoryProvider)
      .getSeller(sellerId);
  return CatalogLocalizer.localizeSeller(raw, locale);
});

final sellerProductsProvider =
    FutureProvider.family<List<ProductSummary>, String>((
      Ref ref,
      String sellerId,
    ) async {
      final AppLocale locale = ref.watch(localeControllerProvider);
      final List<ProductSummary> raw = await ref
          .watch(catalogRepositoryProvider)
          .listSellerProducts(sellerId);
      return <ProductSummary>[
        for (final ProductSummary p in raw)
          CatalogLocalizer.localizeProductSummary(p, locale),
      ];
    });
