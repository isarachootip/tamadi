import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/formatters/thb_formatter.dart';
import '../../../domain/models/cart.dart';
import '../../shared/product_image_box.dart';

class CartLineItemTile extends StatelessWidget {
  const CartLineItemTile({
    super.key,
    required this.item,
    required this.onUpdateQuantity,
    required this.onRemove,
  });

  final CartLineItem item;
  final void Function(String lineItemId, int nextQty) onUpdateQuantity;
  final ValueChanged<String> onRemove;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 78,
            height: 84,
            child: ProductImageBox(
              imageUrl: item.thumbnail,
              borderRadius: BorderRadius.circular(16),
              iconSize: 26,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'ลบสินค้า',
                      icon: const Icon(Icons.close_rounded, size: 18),
                      onPressed: () => onRemove(item.id),
                    ),
                  ],
                ),
                if (item.variantTitle != null && item.variantTitle!.isNotEmpty)
                  Text(
                    item.variantTitle!,
                    style: TextStyle(
                      fontSize: 12.5,
                      color: isDark
                          ? TamadeeColors.textMutedDark
                          : TamadeeColors.textMutedLight,
                    ),
                  ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Text(
                      ThbFormatter.format(item.unitPrice),
                      style: const TextStyle(
                        fontFamily: 'Space Grotesk',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Row(
                      children: <Widget>[
                        _QtyCircleBtn(
                          icon: Icons.remove_rounded,
                          label: 'ลดจำนวน ${item.title}',
                          onTap: () =>
                              onUpdateQuantity(item.id, item.quantity - 1),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Text(
                            '${item.quantity}',
                            style: const TextStyle(
                              fontFamily: 'Space Grotesk',
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        _QtyCircleBtn(
                          icon: Icons.add_rounded,
                          label: 'เพิ่มจำนวน ${item.title}',
                          onTap: () =>
                              onUpdateQuantity(item.id, item.quantity + 1),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QtyCircleBtn extends StatelessWidget {
  const _QtyCircleBtn({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: isDark
                  ? TamadeeColors.borderDark
                  : TamadeeColors.borderLight,
            ),
          ),
          child: Icon(icon, size: 16),
        ),
      ),
    );
  }
}
