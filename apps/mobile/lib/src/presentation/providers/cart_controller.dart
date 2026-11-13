import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/models/cart.dart';
import '../../domain/repositories/cart_repository.dart';
import 'core_providers.dart';

class CartController extends AsyncNotifier<CartModel?> {
  @override
  Future<CartModel?> build() {
    return ref.watch(cartRepositoryProvider).loadActiveCart();
  }

  Future<void> addOffer({
    required String offerId,
    required String sellerId,
    required String sellerName,
    int quantity = 1,
  }) async {
    final CartModel updated = await ref
        .read(cartRepositoryProvider)
        .addOfferToCart(
          AddCartOfferInput(
            offerId: offerId,
            quantity: quantity,
            sellerId: sellerId,
            sellerName: sellerName,
          ),
        );
    state = AsyncData<CartModel?>(updated);
  }

  Future<void> updateQuantity(String lineItemId, int quantity) async {
    final CartModel updated = await ref
        .read(cartRepositoryProvider)
        .updateLineItemQuantity(lineItemId: lineItemId, quantity: quantity);
    state = AsyncData<CartModel?>(updated);
  }

  Future<void> removeItem(String lineItemId) async {
    final CartModel updated =
        await ref.read(cartRepositoryProvider).removeLineItem(lineItemId);
    state = AsyncData<CartModel?>(updated);
  }

  Future<void> applyPromoCode(String code) async {
    final CartModel updated =
        await ref.read(cartRepositoryProvider).applyPromoCode(code);
    state = AsyncData<CartModel?>(updated);
  }

  Future<void> attachToAuthenticatedCustomer() async {
    final CartModel? transferred =
        await ref.read(cartRepositoryProvider).transferCartToCustomer();
    if (transferred != null) {
      state = AsyncData<CartModel?>(transferred);
    }
  }
}

final AsyncNotifierProvider<CartController, CartModel?> cartControllerProvider =
    AsyncNotifierProvider<CartController, CartModel?>(CartController.new);

final Provider<int> cartBadgeCountProvider = Provider<int>((Ref ref) {
  final AsyncValue<CartModel?> cartAsync = ref.watch(cartControllerProvider);
  return cartAsync.maybeWhen(
    data: (CartModel? cart) => cart?.totalQuantity ?? 0,
    orElse: () => 0,
  );
});
