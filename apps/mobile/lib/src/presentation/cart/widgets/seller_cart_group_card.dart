import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/formatters/thb_formatter.dart';
import '../../../domain/models/cart.dart';
import 'cart_line_item_tile.dart';

class SellerCartGroupCard extends StatelessWidget {
  const SellerCartGroupCard({
    super.key,
    required this.group,
    required this.onUpdateQuantity,
    required this.onRemoveItem,
  });

  final SellerCartGroup group;
  final void Function(String lineItemId, int nextQty) onUpdateQuantity;
  final ValueChanged<String> onRemoveItem;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.white;
    final Color borderColor =
        isDark ? TamadeeColors.borderDark : TamadeeColors.borderLight;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          InkWell(
            onTap: () => context.push('/sellers/${group.sellerId}'),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: <Widget>[
                  const Icon(Icons.storefront_rounded, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      group.sellerName,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Text(
                    group.shippingEstimate == 0
                        ? 'ส่งฟรี'
                        : 'ค่าส่ง ${ThbFormatter.format(group.shippingEstimate)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark
                          ? TamadeeColors.textMutedDark
                          : TamadeeColors.textMutedLight,
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, size: 18),
                ],
              ),
            ),
          ),
          const Divider(height: 18),
          for (final CartLineItem item in group.items)
            CartLineItemTile(
              item: item,
              onUpdateQuantity: onUpdateQuantity,
              onRemove: onRemoveItem,
            ),
        ],
      ),
    );
  }
}
