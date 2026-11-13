import 'package:tamadee_mobile/src/domain/models/cart.dart';
import 'package:tamadee_mobile/src/domain/models/customer.dart';
import 'package:tamadee_mobile/src/domain/repositories/auth_repository.dart';
import 'package:tamadee_mobile/src/domain/repositories/cart_repository.dart';

class FakeCartRepository implements CartRepository {
  final List<CartLineItem> _items = <CartLineItem>[];

  CartModel _snapshot() {
    final int subtotal = _items.fold<int>(
      0,
      (int s, CartLineItem i) => s + i.lineTotal,
    );
    return CartModel(
      id: 'cart_test',
      currencyCode: 'thb',
      regionId: 'reg_th',
      items: List<CartLineItem>.unmodifiable(_items),
      itemSubtotal: subtotal,
      shippingTotal: 0,
      discountTotal: 0,
      total: subtotal,
    );
  }

  @override
  Future<CartModel?> loadActiveCart() async =>
      _items.isEmpty ? null : _snapshot();

  @override
  Future<CartModel> addOfferToCart(AddCartOfferInput input) async {
    _items.add(
      CartLineItem(
        id: 'li_${_items.length + 1}',
        productId: 'prod_shirt',
        variantId: 'var_m',
        offerId: input.offerId,
        title: 'เสื้อเชิ้ตลินิน',
        variantTitle: 'ไซซ์ M · ขาวครีม',
        quantity: input.quantity,
        unitPrice: 890,
        sellerId: input.sellerId,
        sellerName: input.sellerName,
      ),
    );
    return _snapshot();
  }

  @override
  Future<CartModel> updateLineItemQuantity({
    required String lineItemId,
    required int quantity,
  }) async =>
      _snapshot();

  @override
  Future<CartModel> removeLineItem(String lineItemId) async {
    _items.removeWhere((CartLineItem i) => i.id == lineItemId);
    return _snapshot();
  }

  @override
  Future<CartModel> applyPromoCode(String code) async => _snapshot();

  @override
  Future<CartModel?> transferCartToCustomer() async => _snapshot();
}

class FakeAuthRepository implements AuthRepository {
  CustomerProfile? _current;

  @override
  Future<CustomerProfile?> getCurrentCustomer() async => _current;

  @override
  Future<CustomerProfile> login({
    required String email,
    required String password,
  }) async {
    return _current = CustomerProfile(
      id: 'cus_1',
      email: email,
      firstName: 'ผู้ซื้อ',
      lastName: 'ทดสอบ',
    );
  }

  @override
  Future<CustomerProfile> register(RegisterCustomerInput input) async =>
      login(email: input.email, password: input.password);

  @override
  Future<void> logout() async {
    _current = null;
  }

  @override
  Future<CustomerProfile> addShippingAddress(CreateAddressInput input) async =>
      _current!;

  @override
  Future<List<OrderGroupSummary>> listOrderGroups() async =>
      const <OrderGroupSummary>[];
}
