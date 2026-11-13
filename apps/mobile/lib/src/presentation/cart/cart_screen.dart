import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../domain/models/cart.dart';
import '../../domain/models/customer.dart';
import '../providers/auth_controller.dart';
import '../providers/cart_controller.dart';
import '../shared/error_retry_view.dart';
import 'widgets/cart_checkout_bar.dart';
import 'widgets/cart_promo_and_payment_section.dart';
import 'widgets/seller_cart_group_card.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final TextEditingController _promoCtrl = TextEditingController();
  String _paymentMethod = 'promptpay';

  @override
  void dispose() {
    _promoCtrl.dispose();
    super.dispose();
  }

  Future<void> _onApplyPromo() async {
    final String code = _promoCtrl.text.trim();
    if (code.isEmpty) return;
    try {
      await ref.read(cartControllerProvider.notifier).applyPromoCode(code);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ใช้โค้ดส่วนลด $code เรียบร้อยแล้ว')),
        );
      }
    } on Exception catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ไม่สามารถใช้โค้ดส่วนลด: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final AsyncValue<CartModel?> cartAsync = ref.watch(cartControllerProvider);
    final CustomerProfile? customer = ref
        .watch(authControllerProvider)
        .maybeWhen(data: (CustomerProfile? c) => c, orElse: () => null);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
        title: Text(
          'ตะกร้า (${cartAsync.value?.totalQuantity ?? 0})',
          style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
        ),
      ),
      body: cartAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (Object err, StackTrace _) => ErrorRetryView(
          message: '$err',
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (CartModel? cart) {
          if (cart == null || cart.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  const Text(
                    'ยังไม่มีสินค้าในตะกร้า',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => context.go('/'),
                    child: const Text('เลือกดูสินค้า'),
                  ),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 110),
            children: <Widget>[
              for (final SellerCartGroup group in cart.sellerGroups)
                SellerCartGroupCard(
                  group: group,
                  onUpdateQuantity: (String lineId, int qty) => ref
                      .read(cartControllerProvider.notifier)
                      .updateQuantity(lineId, qty),
                  onRemoveItem: (String lineId) => ref
                      .read(cartControllerProvider.notifier)
                      .removeItem(lineId),
                ),
              const SizedBox(height: 6),
              CartPromoAndPaymentSection(
                cart: cart,
                promoController: _promoCtrl,
                selectedPaymentMethod: _paymentMethod,
                onSelectPayment: (String method) =>
                    setState(() => _paymentMethod = method),
                onApplyPromo: _onApplyPromo,
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: cartAsync.maybeWhen(
        data: (CartModel? cart) {
          if (cart == null || cart.isEmpty) return null;
          return CartCheckoutBar(
            cart: cart,
            onPressed: () {
              if (customer == null) {
                context.push('/auth/login');
              } else {
                CartCheckoutBar.showPhase3Sheet(context, cart);
              }
            },
          );
        },
        orElse: () => null,
      ),
    );
  }
}
