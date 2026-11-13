import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/formatters/thb_formatter.dart';
import '../../../domain/models/product.dart';
import 'seller_store_card.dart';
import 'variant_selector_section.dart';

class ProductDetailBody extends StatelessWidget {
  const ProductDetailBody({
    super.key,
    required this.detail,
    required this.price,
    required this.offer,
    required this.selectedOptions,
    required this.onSelectOption,
  });

  final ProductDetail detail;
  final int price;
  final SellerOfferModel? offer;
  final Map<String, String> selectedOptions;
  final void Function(String axis, String val) onSelectOption;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Text(
                  detail.title,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                ThbFormatter.format(price),
                style: const TextStyle(
                  fontFamily: 'Space Grotesk',
                  fontSize: 23,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          if (detail.subtitle != null) ...<Widget>[
            const SizedBox(height: 4),
            Text(
              detail.subtitle!,
              style: TextStyle(
                fontSize: 14,
                color: isDark
                    ? TamadeeColors.textMutedDark
                    : TamadeeColors.textMutedLight,
              ),
            ),
          ],
          const SizedBox(height: 16),
          VariantSelectorSection(
            options: detail.options,
            selectedOptions: selectedOptions,
            onSelectOption: onSelectOption,
          ),
          if (offer != null) ...<Widget>[
            const SizedBox(height: 20),
            SellerStoreCard(
              offer: offer!,
              onTap: () => context.push('/sellers/${offer!.sellerId}'),
            ),
          ],
          if (detail.description != null) ...<Widget>[
            const SizedBox(height: 20),
            const Text(
              'รายละเอียดสินค้า',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(
              detail.description!,
              style: const TextStyle(fontSize: 14, height: 1.5),
            ),
          ],
        ],
      ),
    );
  }
}
