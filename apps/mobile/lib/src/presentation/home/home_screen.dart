import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/l10n/app_strings.dart';
import '../../domain/models/category.dart';
import '../../domain/models/product.dart';
import '../providers/catalog_providers.dart';
import '../providers/locale_controller.dart';
import '../shared/error_retry_view.dart';
import '../shared/product_card.dart';
import 'widgets/category_pills_bar.dart';
import 'widgets/home_header_and_search.dart';
import 'widgets/new_drop_banner.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<List<ProductCategory>> categoriesAsync = ref.watch(
      categoriesProvider,
    );
    final String? selectedCatId = ref.watch(selectedHomeCategoryProvider);
    final AsyncValue<List<ProductSummary>> productsAsync = ref.watch(
      homeProductsProvider,
    );
    final AppStrings strings = ref.watch(appStringsProvider);
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(homeProductsProvider);
        },
        child: CustomScrollView(
          slivers: <Widget>[
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const HomeHeaderAndSearch(),
                    const SizedBox(height: 16),
                    const NewDropBanner(),
                    const SizedBox(height: 16),
                    CategoryPillsBar(
                      categories: categoriesAsync.maybeWhen(
                        data: (List<ProductCategory> list) => list,
                        orElse: () => const <ProductCategory>[],
                      ),
                      selectedCategoryId: selectedCatId,
                      onSelect: (String? id) {
                        ref
                            .read(selectedHomeCategoryProvider.notifier)
                            .select(id);
                      },
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            strings.aiPicks,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push('/search'),
                          style: TextButton.styleFrom(
                            minimumSize: const Size(
                              TamadeeLayout.minTouchTarget,
                              TamadeeLayout.minTouchTarget,
                            ),
                          ),
                          child: Text(
                            strings.viewAll,
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? TamadeeColors.textMutedDark
                                  : TamadeeColors.textMutedLight,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            productsAsync.when(
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (Object error, StackTrace _) => SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorRetryView(
                  message: '$error',
                  onRetry: () => ref.invalidate(homeProductsProvider),
                ),
              ),
              data: (List<ProductSummary> products) {
                if (products.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(child: Text(strings.emptyCategory)),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 20,
                          crossAxisSpacing: 14,
                          childAspectRatio: 0.67,
                        ),
                    delegate: SliverChildBuilderDelegate(
                      (BuildContext context, int index) {
                        final ProductSummary item = products[index];
                        return ProductCard(
                          product: item,
                          onTap: () => context.push('/products/${item.id}'),
                        );
                      },
                      childCount: products.length,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
