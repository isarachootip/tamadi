import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../domain/models/cart.dart';
import 'cart_totals_card.dart';

class CartPromoAndPaymentSection extends StatelessWidget {
  const CartPromoAndPaymentSection({
    super.key,
    required this.cart,
    required this.promoController,
    required this.selectedPaymentMethod,
    required this.onSelectPayment,
    required this.onApplyPromo,
  });

  final CartModel cart;
  final TextEditingController promoController;
  final String selectedPaymentMethod;
  final ValueChanged<String> onSelectPayment;
  final VoidCallback onApplyPromo;

  static const List<(String id, String title, String subtitle, IconData icon)>
      paymentOptions = <(String, String, String, IconData)>[
    (
      'promptpay',
      'พร้อมเพย์ QR',
      'สแกนจ่ายผ่านแอปธนาคารทันที',
      Icons.qr_code_2_rounded,
    ),
    (
      'card',
      'บัตรเครดิต / เดบิต',
      'Visa, Mastercard, JCB',
      Icons.credit_card_rounded,
    ),
    (
      'cod',
      'เก็บเงินปลายทาง',
      'ชำระเงินสดเมื่อได้รับสินค้า',
      Icons.local_shipping_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color surface =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: Container(
                height: 46,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark
                        ? TamadeeColors.borderDark
                        : TamadeeColors.borderLight,
                  ),
                ),
                child: TextField(
                  controller: promoController,
                  decoration: const InputDecoration(
                    hintText: 'ใส่โค้ดส่วนลด',
                    border: InputBorder.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            OutlinedButton(
              onPressed: onApplyPromo,
              child: const Text('ใช้โค้ด'),
            ),
          ],
        ),
        const SizedBox(height: 18),
        const Text(
          'วิธีชำระเงิน',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        for (final (String id, String title, String sub, IconData icon)
            in paymentOptions)
          InkWell(
            onTap: () => onSelectPayment(id),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: selectedPaymentMethod == id
                    ? TamadeeColors.lime
                    : surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: selectedPaymentMethod == id
                      ? TamadeeColors.ink
                      : Colors.transparent,
                  width: 1.5,
                ),
              ),
              child: Row(
                children: <Widget>[
                  Icon(
                    icon,
                    color: selectedPaymentMethod == id
                        ? TamadeeColors.ink
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          title,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: selectedPaymentMethod == id
                                ? TamadeeColors.ink
                                : null,
                          ),
                        ),
                        Text(
                          sub,
                          style: TextStyle(
                            fontSize: 12,
                            color: selectedPaymentMethod == id
                                ? TamadeeColors.ink.withValues(alpha: 0.75)
                                : (isDark
                                      ? TamadeeColors.textMutedDark
                                      : TamadeeColors.textMutedLight),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    selectedPaymentMethod == id
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    color: selectedPaymentMethod == id
                        ? TamadeeColors.ink
                        : null,
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: 12),
        CartTotalsCard(cart: cart),
      ],
    );
  }
}
