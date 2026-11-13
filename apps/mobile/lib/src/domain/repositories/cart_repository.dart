import '../models/cart.dart';

class AddCartOfferInput {
  const AddCartOfferInput({
    required this.offerId,
    required this.quantity,
    required this.sellerId,
    required this.sellerName,
  });

  final String offerId;
  final int quantity;
  final String sellerId;
  final String sellerName;
}

abstract interface class CartRepository {
  Future<CartModel?> loadActiveCart();
  Future<CartModel> addOfferToCart(AddCartOfferInput input);
  Future<CartModel> updateLineItemQuantity({
    required String lineItemId,
    required int quantity,
  });
  Future<CartModel> removeLineItem(String lineItemId);
  Future<CartModel> applyPromoCode(String code);
  Future<CartModel?> transferCartToCustomer();
}
