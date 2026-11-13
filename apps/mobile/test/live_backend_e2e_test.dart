import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:tamadee_mobile/src/core/config/app_config.dart';
import 'package:tamadee_mobile/src/core/network/api_client.dart';
import 'package:tamadee_mobile/src/core/storage/local_prefs_storage.dart';
import 'package:tamadee_mobile/src/core/storage/token_storage.dart';
import 'package:tamadee_mobile/src/data/repositories/mercur_auth_repository.dart';
import 'package:tamadee_mobile/src/data/repositories/mercur_cart_repository.dart';
import 'package:tamadee_mobile/src/data/repositories/mercur_catalog_repository.dart';
import 'package:tamadee_mobile/src/domain/models/cart.dart';
import 'package:tamadee_mobile/src/domain/models/category.dart';
import 'package:tamadee_mobile/src/domain/models/customer.dart';
import 'package:tamadee_mobile/src/domain/models/product.dart';
import 'package:tamadee_mobile/src/domain/models/seller.dart';
import 'package:tamadee_mobile/src/domain/repositories/auth_repository.dart';
import 'package:tamadee_mobile/src/domain/repositories/cart_repository.dart';
import 'package:tamadee_mobile/src/domain/repositories/catalog_repository.dart';

void main() {
  final AppConfig config = AppConfig.fromEnvironment();

  setUpAll(() {
    if (config.hasPublishableKey) {
      HttpOverrides.global = null;
    }
  });

  test(
    'Live Mercur v2 E2E: catalog, 2-seller cart grouping, customer auth & address',
    () async {
      final InMemoryTokenStorage tokenStorage = InMemoryTokenStorage();
      final InMemoryPrefsStorage prefsStorage = InMemoryPrefsStorage();
      final ApiClient apiClient = ApiClient(
        config: config,
        tokenStorage: tokenStorage,
      );
      final MercurCatalogRepository catalogRepo = MercurCatalogRepository(
        apiClient: apiClient,
      );
      final MercurCartRepository cartRepo = MercurCartRepository(
        apiClient: apiClient,
        prefsStorage: prefsStorage,
        catalogRepository: catalogRepo,
      );
      final MercurAuthRepository authRepo = MercurAuthRepository(
        apiClient: apiClient,
        tokenStorage: tokenStorage,
      );

      // 1. Categories & Products
      final List<ProductCategory> categories = await catalogRepo.listCategories();
      expect(categories.length, greaterThanOrEqualTo(5));

      final List<ProductSummary> products = await catalogRepo.listProducts();
      expect(products.length, greaterThanOrEqualTo(30));
      expect(products.every((ProductSummary p) => p.priceAmount > 0), isTrue);

      final List<ProductSummary> filtered = await catalogRepo.listProducts(
        filter: ProductQueryFilter(categoryId: categories.first.id),
      );
      expect(filtered, isNotEmpty);

      // 2. Sellers & Seller Storefront
      final List<SellerSummary> sellers = await catalogRepo.listSellers();
      expect(sellers.length, greaterThanOrEqualTo(3));

      final List<ProductSummary> sellerOneProducts =
          await catalogRepo.listSellerProducts(sellers[0].id);
      final List<ProductSummary> sellerTwoProducts =
          await catalogRepo.listSellerProducts(sellers[1].id);
      expect(sellerOneProducts, isNotEmpty);
      expect(sellerTwoProducts, isNotEmpty);

      // 3. Product Details & 2-Seller Cart Grouping
      final ProductDetail detailOne =
          await catalogRepo.getProductDetail(sellerOneProducts.first.id);
      final ProductDetail detailTwo =
          await catalogRepo.getProductDetail(sellerTwoProducts.first.id);
      expect(detailOne.offers, isNotEmpty);
      expect(detailTwo.offers, isNotEmpty);

      final SellerOfferModel offerOne = detailOne.offers.first;
      final SellerOfferModel offerTwo = detailTwo.offers.first;
      expect(offerOne.sellerId, isNot(equals(offerTwo.sellerId)));

      await cartRepo.addOfferToCart(
        AddCartOfferInput(
          offerId: offerOne.id,
          quantity: 1,
          sellerId: offerOne.sellerId,
          sellerName: offerOne.sellerName,
        ),
      );
      final CartModel twoSellerCart = await cartRepo.addOfferToCart(
        AddCartOfferInput(
          offerId: offerTwo.id,
          quantity: 2,
          sellerId: offerTwo.sellerId,
          sellerName: offerTwo.sellerName,
        ),
      );

      expect(twoSellerCart.currencyCode, equals('thb'));
      expect(twoSellerCart.items.length, equals(2));
      expect(twoSellerCart.totalQuantity, equals(3));
      expect(twoSellerCart.sellerGroups.length, equals(2));

      // 4. Customer Registration, Cart Transfer, Address & Order Groups
      final int stamp = DateTime.now().millisecondsSinceEpoch;
      final String testEmail = 'mobile.e2e.$stamp@tamadee.online';
      final CustomerProfile customer = await authRepo.register(
        RegisterCustomerInput(
          email: testEmail,
          password: 'TamadeeUser!2026',
          firstName: 'สมหญิง',
          lastName: 'ทดสอบระบบ',
          phone: '0891234567',
        ),
      );
      expect(customer.email, equals(testEmail));

      final CartModel? transferredCart = await cartRepo.transferCartToCustomer();
      expect(transferredCart, isNotNull);
      expect(transferredCart!.sellerGroups.length, equals(2));

      final CustomerProfile withAddress = await authRepo.addShippingAddress(
        const CreateAddressInput(
          firstName: 'สมหญิง',
          lastName: 'ทดสอบระบบ',
          address1: '99/9 ถนนสุขุมวิท แขวงคลองตันเหนือ',
          city: 'เขตวัฒนา',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
          phone: '0891234567',
          addressName: 'บ้าน',
        ),
      );
      expect(withAddress.addresses, isNotEmpty);

      final List<OrderGroupSummary> orderGroups =
          await authRepo.listOrderGroups();
      expect(orderGroups, isEmpty);
    },
    skip: !config.hasPublishableKey
        ? 'Skipped offline; pass --dart-define-from-file=.env.json to run against live Mercur.'
        : false,
  );
}
