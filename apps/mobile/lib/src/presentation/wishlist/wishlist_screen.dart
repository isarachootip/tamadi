import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../domain/models/product.dart';
import '../providers/wishlist_controller.dart';
import '../shared/error_retry_view.dart';
import '../shared/product_card.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<List<ProductSummary>> wishlistAsync = ref.watch(
      wishlistProductsProvider,
    );
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'รายการถูกใจ',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  'บันทึกชิ้นโปรดจากหลากหลายร้านไว้เทียบและช้อปภายหลัง',
                  style: TextStyle(
                    fontSize: 13.5,
                    color: isDark
                        ? TamadeeColors.textMutedDark
                        : TamadeeColors.textMutedLight,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: wishlistAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (Object err, StackTrace _) => ErrorRetryView(
                message: '$err',
                onRetry: () => ref.invalidate(wishlistProductsProvider),
              ),
              data: (List<ProductSummary> items) {
                if (items.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          const Icon(Icons.favorite_border_rounded, size: 46),
                          const SizedBox(height: 12),
                          const Text(
                            'ยังไม่มีสินค้าในรายการถูกใจ',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: () => context.go('/'),
                            child: const Text('สำรวจสินค้าแนะนำ'),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 20,
                    crossAxisSpacing: 14,
                    childAspectRatio: 0.67,
                  ),
                  itemCount: items.length,
                  itemBuilder: (BuildContext context, int index) {
                    final ProductSummary item = items[index];
                    return ProductCard(
                      product: item,
                      onTap: () => context.push('/products/${item.id}'),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
