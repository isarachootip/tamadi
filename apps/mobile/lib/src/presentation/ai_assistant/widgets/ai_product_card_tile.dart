import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/formatters/thb_formatter.dart';
import '../../../core/l10n/app_locale.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../domain/models/ai_chat.dart';
import '../../providers/cart_controller.dart';
import '../../providers/locale_controller.dart';
import '../../shared/product_image_box.dart';

class AiProductCardTile extends ConsumerStatefulWidget {
  const AiProductCardTile({
    super.key,
    required this.product,
  });

  final AiRecommendedProduct product;

  @override
  ConsumerState<AiProductCardTile> createState() => _AiProductCardTileState();
}

class _AiProductCardTileState extends ConsumerState<AiProductCardTile> {
  bool _loading = false;
  bool _added = false;

  Future<void> _addToCart() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      await ref.read(cartControllerProvider.notifier).addOffer(
            offerId: widget.product.offerId,
            sellerId: widget.product.sellerId,
            sellerName: widget.product.sellerName,
          );
      if (mounted) {
        setState(() => _added = true);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not add item right now')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final AiRecommendedProduct p = widget.product;
    final AppLocale locale = ref.watch(localeControllerProvider);
    final AppStrings strings = ref.watch(appStringsProvider);

    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF151513),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: TamadeeColors.borderDark),
      ),
      child: Row(
        children: <Widget>[
          GestureDetector(
            onTap: () => context.push('/products/${p.id}'),
            child: SizedBox(
              width: 68,
              height: 68,
              child: ProductImageBox(
                imageUrl: p.thumbnail,
                borderRadius: const BorderRadius.all(Radius.circular(14)),
                iconSize: 24,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/products/${p.id}'),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    p.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: TamadeeColors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 13.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${p.sellerName} • ${p.variantTitle}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: TamadeeColors.textMutedDark,
                      fontSize: 11.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    ThbFormatter.formatByLocale(p.priceAmount, locale),
                    style: const TextStyle(
                      color: TamadeeColors.lime,
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            height: 44,
            child: ElevatedButton(
              onPressed: _loading ? null : _addToCart,
              style: ElevatedButton.styleFrom(
                backgroundColor: TamadeeColors.lime,
                foregroundColor: TamadeeColors.ink,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(
                _added
                    ? strings.addedShort
                    : (_loading ? '...' : strings.addToCart),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
