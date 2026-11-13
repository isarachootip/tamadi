import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/formatters/thb_formatter.dart';
import '../../domain/models/product.dart';
import '../providers/wishlist_controller.dart';
import 'product_image_box.dart';

class ProductCard extends ConsumerWidget {
  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  final ProductSummary product;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Set<String> wishlist = ref.watch(wishlistControllerProvider);
    final bool isLiked = wishlist.contains(product.id);
    final Color mutedColor =
        isDark ? TamadeeColors.textMutedDark : TamadeeColors.textMutedLight;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Stack(
              children: <Widget>[
                Positioned.fill(
                  child: ProductImageBox(imageUrl: product.thumbnail),
                ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: Semantics(
                    button: true,
                    label: isLiked
                        ? 'ลบ ${product.title} จากรายการถูกใจ'
                        : 'เพิ่ม ${product.title} ในรายการถูกใจ',
                    child: InkWell(
                      onTap: () => ref
                          .read(wishlistControllerProvider.notifier)
                          .toggle(product.id),
                      customBorder: const CircleBorder(),
                      child: Container(
                        width: TamadeeLayout.minTouchTarget,
                        height: TamadeeLayout.minTouchTarget,
                        alignment: Alignment.center,
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: isDark
                                ? TamadeeColors.ink.withValues(alpha: 0.85)
                                : TamadeeColors.white.withValues(alpha: 0.92),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isLiked ? Icons.favorite : Icons.favorite_border,
                            size: 18,
                            color: isLiked
                                ? TamadeeColors.error
                                : (isDark
                                      ? TamadeeColors.white
                                      : TamadeeColors.ink),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            product.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          ),
          if (product.subtitle != null && product.subtitle!.isNotEmpty) ...<Widget>[
            const SizedBox(height: 2),
            Text(
              product.subtitle!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12.5, color: mutedColor),
            ),
          ],
          const SizedBox(height: 4),
          Text(
            ThbFormatter.format(product.priceAmount),
            style: const TextStyle(
              fontFamily: 'Space Grotesk',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
          ),
        ],
      ),
    );
  }
}
