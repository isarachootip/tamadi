import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/formatters/thb_formatter.dart';
import '../../../domain/models/cart.dart';

class CartCheckoutBar extends StatelessWidget {
  const CartCheckoutBar({
    super.key,
    required this.cart,
    required this.onPressed,
  });

  final CartModel cart;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
        child: SizedBox(
          height: 54,
          child: ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? TamadeeColors.lime : TamadeeColors.ink,
              foregroundColor: isDark
                  ? TamadeeColors.ink
                  : TamadeeColors.white,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Text(
                  'ชำระเงิน ${ThbFormatter.format(cart.effectiveGrandTotal)}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isDark ? TamadeeColors.ink : TamadeeColors.lime,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_forward_rounded,
                    size: 18,
                    color: isDark ? TamadeeColors.lime : TamadeeColors.ink,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static void showPhase3Sheet(BuildContext context, CartModel cart) {
    showModalBottomSheet<void>(
      context: context,
      builder: (BuildContext ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text(
                'พร้อมเชื่อมต่อระบบชำระเงิน (ระยะ 3)',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                'ตะกร้าของคุณแยกตามร้านผู้ขาย ${cart.sellerGroups.length} ร้าน '
                'ยอดรวมสุทธิ ${ThbFormatter.format(cart.effectiveGrandTotal)} '
                'ระบบชำระเงินจริง (พร้อมเพย์ QR / บัตร / เก็บเงินปลายทาง) จะเปิดใช้งานในระยะที่ 3',
                style: const TextStyle(fontSize: 14, height: 1.45),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('รับทราบ'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
