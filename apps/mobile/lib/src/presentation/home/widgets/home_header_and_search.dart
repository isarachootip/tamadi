import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../providers/cart_controller.dart';

class HomeHeaderAndSearch extends ConsumerWidget {
  const HomeHeaderAndSearch({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final int badgeCount = ref.watch(cartBadgeCountProvider);
    final Color surfaceColor =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;
    final Color mutedColor =
        isDark ? TamadeeColors.textMutedDark : TamadeeColors.textMutedLight;

    return Column(
      children: <Widget>[
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            const TamadeeLogoWidget(height: 34),
            Semantics(
              button: true,
              label: 'ตะกร้าสินค้า $badgeCount ชิ้น',
              child: InkWell(
                onTap: () => context.push('/cart'),
                customBorder: const CircleBorder(),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: <Widget>[
                    Container(
                      width: TamadeeLayout.minTouchTarget,
                      height: TamadeeLayout.minTouchTarget,
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shopping_bag_outlined, size: 21),
                    ),
                    if (badgeCount > 0)
                      Positioned(
                        top: -2,
                        right: -2,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? TamadeeColors.lime
                                : TamadeeColors.ink,
                            borderRadius: TamadeeLayout.pillBorderRadius,
                          ),
                          child: Text(
                            '$badgeCount',
                            style: TextStyle(
                              fontFamily: 'Space Grotesk',
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? TamadeeColors.ink
                                  : TamadeeColors.white,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        InkWell(
          onTap: () => context.push('/search'),
          borderRadius: TamadeeLayout.pillBorderRadius,
          child: Container(
            height: 50,
            padding: const EdgeInsets.only(left: 16, right: 6),
            decoration: BoxDecoration(
              color: surfaceColor,
              borderRadius: TamadeeLayout.pillBorderRadius,
            ),
            child: Row(
              children: <Widget>[
                Icon(Icons.search_rounded, size: 20, color: mutedColor),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'ค้นหา หรือถ่ายรูปสินค้า',
                    style: TextStyle(
                      fontSize: 14.5,
                      color: mutedColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Semantics(
                  button: true,
                  label: 'ถ่ายรูปหรือถามผู้ช่วยช้อป AI',
                  child: InkWell(
                    onTap: () => context.push('/ai-assistant'),
                    customBorder: const CircleBorder(),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isDark ? TamadeeColors.lime : TamadeeColors.ink,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.camera_alt_outlined,
                        size: 18,
                        color: isDark
                            ? TamadeeColors.ink
                            : TamadeeColors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
