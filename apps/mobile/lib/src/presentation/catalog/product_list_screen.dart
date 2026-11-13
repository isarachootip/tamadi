import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../domain/models/category.dart';
import '../../domain/models/product.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../providers/catalog_providers.dart';
import '../shared/error_retry_view.dart';
import '../shared/product_card.dart';
import 'widgets/product_filter_sheet.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  const ProductListScreen({super.key});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  late final TextEditingController _searchCtrl = TextEditingController(
    text: ref.read(productFilterProvider).query ?? '',
  );

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _submitSearch(String value) {
    final ProductQueryFilter current = ref.read(productFilterProvider);
    ref.read(productFilterProvider.notifier).update(
          ProductQueryFilter(
            query: value.trim().isEmpty ? null : value.trim(),
            categoryId: current.categoryId,
            minPrice: current.minPrice,
            maxPrice: current.maxPrice,
            sort: current.sort,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final ProductQueryFilter filter = ref.watch(productFilterProvider);
    final AsyncValue<List<ProductSummary>> productsAsync = ref.watch(
      filteredProductsProvider,
    );
    final List<ProductCategory> categories = ref
        .watch(categoriesProvider)
        .maybeWhen(
          data: (List<ProductCategory> list) => list,
          orElse: () => const <ProductCategory>[],
        );
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color surfaceColor =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
        title: Padding(
          padding: const EdgeInsets.only(right: 12),
          child: Container(
            height: 44,
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: TamadeeLayout.pillBorderRadius,
            ),
            child: TextField(
              controller: _searchCtrl,
              textInputAction: TextInputAction.search,
              onSubmitted: _submitSearch,
              decoration: InputDecoration(
                hintText: 'ค้นหาเสื้อลินิน, กระเป๋า, รองเท้า...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: IconButton(
                  tooltip: 'ตัวกรองสินค้า',
                  icon: const Icon(Icons.tune_rounded, size: 20),
                  onPressed: () {
                    showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      builder: (BuildContext ctx) => ProductFilterSheet(
                        initialFilter: filter,
                        categories: categories,
                        onApply: (ProductQueryFilter next) {
                          ref.read(productFilterProvider.notifier).update(next);
                        },
                      ),
                    );
                  },
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 11),
              ),
            ),
          ),
        ),
      ),
      body: productsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (Object err, StackTrace _) => ErrorRetryView(
          message: '$err',
          onRetry: () => ref.invalidate(filteredProductsProvider),
        ),
        data: (List<ProductSummary> items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  const Text(
                    'ไม่พบสินค้าที่ตรงกับคำค้นหรือตัวกรอง',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {
                      _searchCtrl.clear();
                      ref
                          .read(productFilterProvider.notifier)
                          .update(const ProductQueryFilter());
                    },
                    child: const Text('แสดงสินค้าทั้งหมด'),
                  ),
                ],
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 20,
              crossAxisSpacing: 14,
              childAspectRatio: 0.67,
            ),
            itemCount: items.length,
            itemBuilder: (BuildContext context, int index) {
              final ProductSummary product = items[index];
              return ProductCard(
                product: product,
                onTap: () => context.push('/products/${product.id}'),
              );
            },
          );
        },
      ),
    );
  }
}
