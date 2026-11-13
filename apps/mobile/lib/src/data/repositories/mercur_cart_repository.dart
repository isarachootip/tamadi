import '../../core/network/api_client.dart';
import '../../core/network/json_parsers.dart';
import '../../core/storage/local_prefs_storage.dart';
import '../../domain/models/cart.dart';
import '../../domain/repositories/cart_repository.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../mappers/cart_mapper.dart';

class MercurCartRepository implements CartRepository {
  MercurCartRepository({
    required this.apiClient,
    required this.prefsStorage,
    required this.catalogRepository,
  });

  static const String _cartFields = '+items.offer,+items.offer.seller';

  final ApiClient apiClient;
  final LocalPrefsStorage prefsStorage;
  final CatalogRepository catalogRepository;

  @override
  Future<CartModel?> loadActiveCart() async {
    final String? savedId = await prefsStorage.readCartId();
    if (savedId == null || savedId.isEmpty) {
      return null;
    }
    try {
      return await _fetchCart(savedId);
    } on Exception {
      await prefsStorage.clearCartId();
      return null;
    }
  }

  Future<String> _ensureCartId() async {
    final CartModel? existing = await loadActiveCart();
    if (existing != null) {
      return existing.id;
    }
    final String regionId = await catalogRepository.getThailandRegionId();
    final JsonMap res = await apiClient.post(
      '/store/carts',
      body: <String, Object?>{'region_id': regionId},
      authenticated: true,
    );
    final JsonMap cartJson = JsonParsers.asJsonMap(res['cart'], context: 'cart');
    final String id = JsonParsers.readString(cartJson, 'id');
    await prefsStorage.saveCartId(id);
    return id;
  }

  Future<CartModel> _fetchCart(String cartId) async {
    final JsonMap res = await apiClient.get(
      '/store/carts/$cartId',
      queryParameters: <String, Object?>{'fields': _cartFields},
      authenticated: true,
    );
    return CartMapper.fromJson(
      JsonParsers.asJsonMap(res['cart'], context: 'cart'),
    );
  }

  @override
  Future<CartModel> addOfferToCart(AddCartOfferInput input) async {
    final String cartId = await _ensureCartId();
    await apiClient.post(
      '/store/carts/$cartId/line-items',
      body: <String, Object?>{
        'offer_id': input.offerId,
        'quantity': input.quantity,
        'metadata': <String, Object?>{
          'seller_id': input.sellerId,
          'seller_name': input.sellerName,
        },
      },
      authenticated: true,
    );
    return _fetchCart(cartId);
  }

  @override
  Future<CartModel> updateLineItemQuantity({
    required String lineItemId,
    required int quantity,
  }) async {
    if (quantity <= 0) {
      return removeLineItem(lineItemId);
    }
    final String cartId = await _ensureCartId();
    await apiClient.post(
      '/store/carts/$cartId/line-items/$lineItemId',
      body: <String, Object?>{'quantity': quantity},
      authenticated: true,
    );
    return _fetchCart(cartId);
  }

  @override
  Future<CartModel> removeLineItem(String lineItemId) async {
    final String cartId = await _ensureCartId();
    await apiClient.delete(
      '/store/carts/$cartId/line-items/$lineItemId',
      authenticated: true,
    );
    return _fetchCart(cartId);
  }

  @override
  Future<CartModel> applyPromoCode(String code) async {
    final String cartId = await _ensureCartId();
    await apiClient.post(
      '/store/carts/$cartId/promotions',
      body: <String, Object?>{
        'promo_codes': <String>[code.trim()],
      },
      authenticated: true,
    );
    return _fetchCart(cartId);
  }

  @override
  Future<CartModel?> transferCartToCustomer() async {
    final String? cartId = await prefsStorage.readCartId();
    if (cartId == null || cartId.isEmpty) {
      return null;
    }
    await apiClient.post(
      '/store/carts/$cartId/customer',
      body: const <String, Object?>{},
      authenticated: true,
    );
    return _fetchCart(cartId);
  }
}
