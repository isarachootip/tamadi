import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../domain/models/product.dart';
import '../../domain/models/seller.dart';
import '../providers/catalog_providers.dart';
import '../shared/error_retry_view.dart';
import '../shared/product_card.dart';

class SellerStoreScreen extends ConsumerWidget {
  const SellerStoreScreen({
    super.key,
    required this.sellerId,
  });

  final String sellerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<SellerSummary> sellerAsync = ref.watch(
      sellerDetailProvider(sellerId),
    );
    final AsyncValue<List<ProductSummary>> productsAsync = ref.watch(
      sellerProductsProvider(sellerId),
    );
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
        title: const Text(
          'หน้าร้านผู้ขาย',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
        ),
      ),
      body: CustomScrollView(
        slivers: <Widget>[
          SliverToBoxAdapter(
            child: sellerAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (Object err, StackTrace _) => ErrorRetryView(
                message: '$err',
                onRetry: () => ref.invalidate(sellerDetailProvider(sellerId)),
              ),
              data: (SellerSummary seller) => Container(
                margin: const EdgeInsets.fromLTRB(16, 8, 16, 18),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: TamadeeColors.ink,
                  borderRadius: TamadeeLayout.cardBorderRadius,
                  border: isDark
                      ? Border.all(color: TamadeeColors.borderDark)
                      : null,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Container(
                          width: 54,
                          height: 54,
                          decoration: const BoxDecoration(
                            color: TamadeeColors.lime,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.storefront_rounded,
                            color: TamadeeColors.ink,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                seller.name,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: TamadeeColors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 3,
                                ),
                                decoration: const BoxDecoration(
                                  color: TamadeeColors.lime,
                                  borderRadius: TamadeeLayout.pillBorderRadius,
                                ),
                                child: const Text(
                                  'ร้านค้าไทยผ่านการรับรอง',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: TamadeeColors.ink,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (seller.description != null) ...<Widget>[
                      const SizedBox(height: 14),
                      Text(
                        seller.description!,
                        style: const TextStyle(
                          fontSize: 13.5,
                          color: Color(0xFFD0D0C8),
                          height: 1.45,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
          productsAsync.when(
            loading: () => const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (Object err, StackTrace _) => SliverFillRemaining(
              hasScrollBody: false,
              child: ErrorRetryView(
                message: '$err',
                onRetry: () => ref.invalidate(sellerProductsProvider(sellerId)),
              ),
            ),
            data: (List<ProductSummary> items) => SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 28),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 20,
                  crossAxisSpacing: 14,
                  childAspectRatio: 0.67,
                ),
                delegate: SliverChildBuilderDelegate(
                  (BuildContext context, int index) {
                    final ProductSummary item = items[index];
                    return ProductCard(
                      product: item,
                      onTap: () => context.push('/products/${item.id}'),
                    );
                  },
                  childCount: items.length,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
