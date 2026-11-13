import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class ProductBottomActionBar extends StatelessWidget {
  const ProductBottomActionBar({
    super.key,
    required this.submitting,
    required this.onAddToCart,
    required this.onBuyNow,
  });

  final bool submitting;
  final VoidCallback onAddToCart;
  final VoidCallback onBuyNow;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          border: Border(
            top: BorderSide(
              color: isDark
                  ? TamadeeColors.borderDark
                  : TamadeeColors.borderLight,
            ),
          ),
        ),
        child: Row(
          children: <Widget>[
            Expanded(
              child: OutlinedButton(
                onPressed: submitting ? null : onAddToCart,
                child: const Text('ใส่ตะกร้า'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: submitting ? null : onBuyNow,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark
                      ? TamadeeColors.lime
                      : TamadeeColors.ink,
                  foregroundColor: isDark
                      ? TamadeeColors.ink
                      : TamadeeColors.white,
                ),
                child: const Text('ซื้อเลย'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
