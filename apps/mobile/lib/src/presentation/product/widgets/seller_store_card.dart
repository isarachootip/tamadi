import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../domain/models/product.dart';

class SellerStoreCard extends StatelessWidget {
  const SellerStoreCard({
    super.key,
    required this.offer,
    required this.onTap,
  });

  final SellerOfferModel offer;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;
    final int days = offer.leadtimeDays ?? 2;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: <Widget>[
            Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                color: TamadeeColors.ink,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.storefront_rounded,
                color: TamadeeColors.lime,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    offer.sellerName,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'ผู้ขายรับรองโดย Tamadee · จัดส่งภายใน $days วัน',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark
                          ? TamadeeColors.textMutedDark
                          : TamadeeColors.textMutedLight,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: TamadeeLayout.pillBorderRadius,
                border: Border.all(
                  color: isDark
                      ? TamadeeColors.borderDark
                      : TamadeeColors.ink,
                ),
              ),
              child: const Text(
                'ดูหน้าร้าน',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
