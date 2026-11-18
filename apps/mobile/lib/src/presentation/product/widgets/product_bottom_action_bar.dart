import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/l10n/app_strings.dart';
import '../../providers/locale_controller.dart';

class ProductBottomActionBar extends ConsumerWidget {
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
  Widget build(BuildContext context, WidgetRef ref) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final AppStrings strings = ref.watch(appStringsProvider);

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
                child: Text(strings.addToCart),
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
                child: Text(strings.buyNow),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
