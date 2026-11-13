import 'package:flutter_test/flutter_test.dart';
import 'package:tamadee_mobile/src/core/network/json_parsers.dart';
import 'package:tamadee_mobile/src/data/mappers/cart_mapper.dart';
import 'package:tamadee_mobile/src/data/mappers/customer_mapper.dart';
import 'package:tamadee_mobile/src/data/mappers/product_mapper.dart';
import 'package:tamadee_mobile/src/domain/models/cart.dart';
import 'package:tamadee_mobile/src/domain/models/customer.dart';
import 'package:tamadee_mobile/src/domain/models/product.dart';

void main() {
  group('ProductMapper', () {
    test('maps Mercur store product and seller offers with THB prices', () {
      final JsonMap rawProduct = <String, Object?>{
        'id': 'prod_01',
        'title': 'เสื้อเชิ้ตลินิน',
        'subtitle': 'ทรงหลวม ผ้าลินินแท้',
        'description': 'ระบายอากาศดี ใส่สบาย',
        'handle': 'linen-relaxed-shirt',
        'thumbnail': 'https://placehold.co/600x800.png',
        'images': <Object?>[
          <String, Object?>{'url': 'https://placehold.co/600x800.png'},
          <String, Object?>{'url': 'https://placehold.co/600x801.png'},
        ],
        'categories': <Object?>[
          <String, Object?>{'id': 'cat_1', 'name': 'เสื้อผ้า', 'handle': 'apparel'},
        ],
        'options': <Object?>[
          <String, Object?>{
            'id': 'opt_size',
            'title': 'ไซซ์',
            'values': <Object?>[
              <String, Object?>{'id': 'val_s', 'value': 'S'},
              <String, Object?>{'id': 'val_m', 'value': 'M'},
            ],
          },
        ],
        'variants': <Object?>[
          <String, Object?>{
            'id': 'var_m',
            'title': 'M',
            'sku': 'SHIRT-M',
            'offer_id': 'off_01',
            'calculated_price': <String, Object?>{
              'calculated_amount': 890,
              'currency_code': 'thb',
            },
            'options': <Object?>[
              <String, Object?>{'option_id': 'opt_size', 'value': 'M'},
            ],
          },
        ],
      };

      final JsonMap rawOffer = <String, Object?>{
        'id': 'off_01',
        'variant_id': 'var_m',
        'seller_id': 'sel_lamai',
        'effective_leadtime_to_ship': 2,
        'seller': <String, Object?>{
          'id': 'sel_lamai',
          'name': 'ละไม สตูดิโอ',
          'handle': 'lamai-studio',
          'description': 'เสื้อผ้าลินินตัดเย็บปราณีต',
        },
        'calculated_price': <String, Object?>{'calculated_amount': 890},
      };

      final ProductSummary summary = ProductMapper.toSummary(rawProduct);
      expect(summary.title, 'เสื้อเชิ้ตลินิน');
      expect(summary.priceAmount, 890);
      expect(summary.primaryOfferId, 'off_01');
      expect(summary.categoryNames, <String>['เสื้อผ้า']);

      final ProductDetail detail = ProductMapper.toDetail(
        rawProduct,
        <JsonMap>[rawOffer],
      );
      expect(detail.galleryUrls.length, 2);
      expect(detail.variants.first.optionValues['ไซซ์'], 'M');
      expect(detail.offers.first.sellerName, 'ละไม สตูดิโอ');
      expect(detail.offers.first.priceAmount, 890);
    });
  });

  group('CartMapper', () {
    test('extracts seller grouping from offer relation and metadata fallback', () {
      final JsonMap rawCart = <String, Object?>{
        'id': 'cart_01',
        'currency_code': 'thb',
        'region_id': 'reg_th',
        'item_subtotal': 2480,
        'shipping_total': 0,
        'discount_total': 0,
        'total': 2480,
        'promotions': <Object?>[
          <String, Object?>{'code': 'TAMADEE10'},
        ],
        'items': <Object?>[
          <String, Object?>{
            'id': 'li_1',
            'product_id': 'prod_1',
            'variant_id': 'var_1',
            'title': 'เสื้อเชิ้ตลินิน',
            'variant_title': 'M',
            'quantity': 1,
            'unit_price': 890,
            'metadata': <String, Object?>{'offer_id': 'off_1'},
            'offer': <String, Object?>{
              'id': 'off_1',
              'seller': <String, Object?>{
                'id': 'sel_lamai',
                'name': 'ละไม สตูดิโอ',
              },
            },
          },
          <String, Object?>{
            'id': 'li_2',
            'product_id': 'prod_2',
            'variant_id': 'var_2',
            'title': 'กระเป๋าผ้าแคนวาส',
            'variant_title': 'ดำ',
            'quantity': 1,
            'unit_price': 1590,
            'metadata': <String, Object?>{
              'offer_id': 'off_2',
              'seller_id': 'sel_kaodee',
              'seller_name': 'ก้าวดี คราฟต์ชูส์',
            },
          },
        ],
      };

      final CartModel cart = CartMapper.fromJson(rawCart);
      expect(cart.sellerGroups.length, 2);
      expect(cart.sellerGroups.first.sellerName, 'ละไม สตูดิโอ');
      expect(cart.sellerGroups.last.sellerName, 'ก้าวดี คราฟต์ชูส์');
      expect(cart.promoCodes, <String>['TAMADEE10']);
    });
  });

  group('CustomerMapper', () {
    test('maps customer profile and Thai shipping addresses', () {
      final JsonMap rawCustomer = <String, Object?>{
        'id': 'cus_01',
        'email': 'buyer@tamadee.online',
        'first_name': 'พิมพ์ใจ',
        'last_name': 'สายช้อป',
        'phone': '0812345678',
        'addresses': <Object?>[
          <String, Object?>{
            'id': 'addr_1',
            'first_name': 'พิมพ์ใจ',
            'last_name': 'สายช้อป',
            'address_1': '99 สุขุมวิท',
            'city': 'วัฒนา',
            'province': 'กรุงเทพมหานคร',
            'postal_code': '10110',
            'phone': '0812345678',
            'is_default_shipping': true,
          },
        ],
      };
      final CustomerProfile profile = CustomerMapper.fromJson(rawCustomer);
      expect(profile.displayName, 'พิมพ์ใจ สายช้อป');
      expect(profile.addresses.single.province, 'กรุงเทพมหานคร');
    });
  });
}
