import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../domain/models/category.dart';
import '../../domain/models/seller.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../providers/catalog_providers.dart';
import '../shared/error_retry_view.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  static const List<IconData> _icons = <IconData>[
    Icons.checkroom_rounded,
    Icons.directions_walk_rounded,
    Icons.shopping_bag_outlined,
    Icons.diamond_outlined,
    Icons.handyman_outlined,
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<List<ProductCategory>> categoriesAsync = ref.watch(
      categoriesProvider,
    );
    final AsyncValue<List<SellerSummary>> sellersAsync = ref.watch(
      sellersListProvider,
    );
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: <Widget>[
          const Text(
            'หมวดหมู่สินค้า',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            'เลือกช้อปตามหมวดหมู่และร้านผู้ผลิตงานดีไซน์ไทย',
            style: TextStyle(
              fontSize: 13.5,
              color: isDark
                  ? TamadeeColors.textMutedDark
                  : TamadeeColors.textMutedLight,
            ),
          ),
          const SizedBox(height: 18),
          categoriesAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (Object err, StackTrace _) => ErrorRetryView(
              message: '$err',
              onRetry: () => ref.invalidate(categoriesProvider),
            ),
            data: (List<ProductCategory> cats) => Column(
              children: <Widget>[
                for (int i = 0; i < cats.length; i++) ...<Widget>[
                  InkWell(
                    onTap: () {
                      ref
                          .read(productFilterProvider.notifier)
                          .update(ProductQueryFilter(categoryId: cats[i].id));
                      context.push('/search');
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: <Widget>[
                          Container(
                            width: 44,
                            height: 44,
                            decoration: const BoxDecoration(
                              color: TamadeeColors.lime,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _categoryIcon(i),
                              color: TamadeeColors.ink,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  cats[i].name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                if (cats[i].description != null)
                                  Text(
                                    cats[i].description!,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      color: isDark
                                          ? TamadeeColors.textMutedDark
                                          : TamadeeColors.textMutedLight,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'ร้านผู้ขายแนะนำ',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),
          sellersAsync.maybeWhen(
            data: (List<SellerSummary> sellers) => Column(
              children: <Widget>[
                for (final SellerSummary s in sellers) ...<Widget>[
                  ListTile(
                    onTap: () => context.push('/sellers/${s.id}'),
                    tileColor: cardBg,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                    leading: const CircleAvatar(
                      backgroundColor: TamadeeColors.ink,
                      foregroundColor: TamadeeColors.lime,
                      child: Icon(Icons.storefront_rounded, size: 20),
                    ),
                    title: Text(
                      s.name,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: s.description != null
                        ? Text(
                            s.description!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          )
                        : null,
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 15),
                  ),
                  const SizedBox(height: 10),
                ],
              ],
            ),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  static IconData _categoryIcon(int index) {
    return switch (index) {
      0 => _icons[0],
      1 => _icons[1],
      2 => _icons[2],
      3 => Icons.diamond_outlined,
      _ => _icons[4],
    };
  }
}
