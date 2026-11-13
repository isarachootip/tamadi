import 'package:material_ui/material_ui.dart';

import '../../../core/formatters/thb_formatter.dart';
import '../../../domain/models/cart.dart';

class CartTotalsCard extends StatelessWidget {
  const CartTotalsCard({
    super.key,
    required this.cart,
  });

  final CartModel cart;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        _SummaryRow(
          label: 'ค่าสินค้า',
          value: ThbFormatter.format(cart.computedItemSubtotal),
        ),
        const SizedBox(height: 6),
        _SummaryRow(
          label: 'ค่าจัดส่ง (${cart.sellerGroups.length} ร้าน)',
          value: ThbFormatter.format(cart.effectiveShippingTotal),
        ),
        if (cart.discountTotal > 0) ...<Widget>[
          const SizedBox(height: 6),
          _SummaryRow(
            label: 'ส่วนลดโปรโมชัน',
            value: '-${ThbFormatter.format(cart.discountTotal)}',
          ),
        ],
        const Divider(height: 22),
        _SummaryRow(
          label: 'รวมทั้งหมด',
          value: ThbFormatter.format(cart.effectiveGrandTotal),
          bold: true,
        ),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.bold = false,
  });

  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        Text(
          label,
          style: TextStyle(
            fontSize: bold ? 16 : 14,
            fontWeight: bold ? FontWeight.w800 : FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: 'Space Grotesk',
            fontSize: bold ? 19 : 15,
            fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
