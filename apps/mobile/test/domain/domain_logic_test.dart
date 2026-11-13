import 'package:flutter_test/flutter_test.dart';
import 'package:tamadee_mobile/src/core/config/app_config.dart';
import 'package:tamadee_mobile/src/core/formatters/thb_formatter.dart';
import 'package:tamadee_mobile/src/core/network/json_parsers.dart';
import 'package:tamadee_mobile/src/domain/models/cart.dart';
import 'package:tamadee_mobile/src/domain/models/product.dart';

void main() {
  group('ThbFormatter', () {
    test('formats whole THB amounts with comma grouping and baht symbol', () {
      expect(ThbFormatter.format(0), '฿0');
      expect(ThbFormatter.format(890), '฿890');
      expect(ThbFormatter.format(1590), '฿1,590');
      expect(ThbFormatter.format(2520), '฿2,520');
      expect(ThbFormatter.format(1250000), '฿1,250,000');
      expect(ThbFormatter.format(-150), '-฿150');
    });
  });

  group('AppConfig.normalizeApiBaseUrl', () {
    test('rewrites localhost/127.0.0.1 to 10.0.2.2 only on native Android', () {
      expect(
        AppConfig.normalizeApiBaseUrl(
          'http://127.0.0.1:9000/',
          isWeb: false,
          isAndroid: true,
        ),
        'http://10.0.2.2:9000',
      );
      expect(
        AppConfig.normalizeApiBaseUrl(
          'http://127.0.0.1:9000',
          isWeb: true,
          isAndroid: false,
        ),
        'http://127.0.0.1:9000',
      );
      expect(
        AppConfig.normalizeApiBaseUrl(
          'https://bwebtamdi.tamadee.online/',
          isWeb: false,
          isAndroid: true,
        ),
        'https://bwebtamdi.tamadee.online',
      );
    });
  });

  group('JsonParsers boundary validation', () {
    test('validates typed fields and throws FormatException on bad input', () {
      final JsonMap map = JsonParsers.asJsonMap(<String, Object?>{
        'id': 'prod_1',
        'price': 890,
        'active': true,
      });
      expect(JsonParsers.readString(map, 'id'), 'prod_1');
      expect(JsonParsers.readInt(map, 'price'), 890);
      expect(JsonParsers.readBool(map, 'active'), isTrue);
      expect(
        () => JsonParsers.readString(map, 'price'),
        throwsA(isA<FormatException>()),
      );
    });
  });

  group('CartModel seller grouping & totals', () {
    test('groups line items by seller and computes shipping & grand total', () {
      const CartModel cart = CartModel(
        id: 'cart_01',
        currencyCode: 'thb',
        regionId: 'reg_th',
        items: <CartLineItem>[
          CartLineItem(
            id: 'item_1',
            productId: 'prod_1',
            variantId: 'var_1',
            offerId: 'off_1',
            title: 'เสื้อเชิ้ตลินิน',
            variantTitle: 'M / ขาวครีม',
            thumbnail: null,
            quantity: 1,
            unitPrice: 890,
            sellerId: 'sel_lamai',
            sellerName: 'ละไม สตูดิโอ',
          ),
          CartLineItem(
            id: 'item_2',
            productId: 'prod_2',
            variantId: 'var_2',
            offerId: 'off_2',
            title: 'กระเป๋าผ้าแคนวาส',
            variantTitle: 'ใหญ่ / ดำ',
            thumbnail: null,
            quantity: 1,
            unitPrice: 1590,
            sellerId: 'sel_lamai',
            sellerName: 'ละไม สตูดิโอ',
          ),
          CartLineItem(
            id: 'item_3',
            productId: 'prod_3',
            variantId: 'var_3',
            offerId: 'off_3',
            title: 'แก้วเซรามิกปั้นมือ',
            variantTitle: 'ขาวนวล',
            thumbnail: null,
            quantity: 2,
            unitPrice: 390,
            sellerId: 'sel_baandin',
            sellerName: 'บ้านดิน คราฟต์',
          ),
        ],
        itemSubtotal: 3260,
        shippingTotal: 0,
        discountTotal: 0,
        total: 3260,
        promoCodes: <String>[],
      );

      expect(cart.totalQuantity, 4);
      expect(cart.sellerGroups.length, 2);
      expect(cart.sellerGroups.first.sellerName, 'ละไม สตูดิโอ');
      expect(cart.sellerGroups.first.subtotal, 2480);
      expect(cart.sellerGroups.last.subtotal, 780);
      expect(cart.effectiveShippingTotal, 80);
      expect(cart.effectiveGrandTotal, 3340);
    });
  });

  group('ProductDetail variant & offer matching', () {
    test('resolves variant and seller offer matching selected options', () {
      const ProductDetail detail = ProductDetail(
        id: 'prod_shirt',
        title: 'เสื้อเชิ้ตลินิน',
        handle: 'linen-relaxed-shirt',
        subtitle: 'ทรงหลวม ผ้าลินินแท้',
        description: 'ระบายอากาศดี',
        thumbnail: null,
        images: <String>[],
        categoryNames: <String>['เสื้อผ้า'],
        options: <ProductOptionAxis>[
          ProductOptionAxis(
            id: 'opt_size',
            title: 'ไซซ์',
            values: <String>['S', 'M'],
          ),
        ],
        variants: <ProductVariantModel>[
          ProductVariantModel(
            id: 'var_s',
            title: 'S',
            sku: 'SHIRT-S',
            priceAmount: 890,
            offerId: 'off_s',
            optionValues: <String, String>{'ไซซ์': 'S'},
          ),
          ProductVariantModel(
            id: 'var_m',
            title: 'M',
            sku: 'SHIRT-M',
            priceAmount: 890,
            offerId: 'off_m',
            optionValues: <String, String>{'ไซซ์': 'M'},
          ),
        ],
        offers: <SellerOfferModel>[
          SellerOfferModel(
            id: 'off_m',
            variantId: 'var_m',
            sellerId: 'sel_lamai',
            sellerName: 'ละไม สตูดิโอ',
            sellerHandle: 'lamai-studio',
            priceAmount: 890,
            inStock: true,
          ),
        ],
      );

      final ProductVariantModel? variant = detail.findVariant(<String, String>{
        'ไซซ์': 'M',
      });
      expect(variant?.id, 'var_m');
      final SellerOfferModel? offer = detail.findOfferForVariant('var_m');
      expect(offer?.sellerName, 'ละไม สตูดิโอ');
    });
  });
}
