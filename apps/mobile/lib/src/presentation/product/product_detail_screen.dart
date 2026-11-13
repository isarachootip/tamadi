import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../../domain/models/product.dart';
import '../providers/cart_controller.dart';
import '../providers/catalog_providers.dart';
import '../providers/wishlist_controller.dart';
import '../shared/error_retry_view.dart';
import 'widgets/product_bottom_action_bar.dart';
import 'widgets/product_detail_body.dart';
import 'widgets/product_gallery_header.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final String productId;

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  final Map<String, String> _selectedOptions = <String, String>{};
  bool _initialized = false;
  bool _submitting = false;

  void _ensureInitialSelection(ProductDetail detail) {
    if (_initialized) return;
    _initialized = true;
    for (final ProductOptionAxis axis in detail.options) {
      if (axis.values.isNotEmpty) {
        _selectedOptions[axis.title] = axis.values.contains('M')
            ? 'M'
            : axis.values.first;
      }
    }
  }

  Future<void> _handleAddToCart(
    ProductDetail detail, {
    required bool goToCart,
  }) async {
    final ProductVariantModel? variant = detail.findVariant(_selectedOptions);
    final SellerOfferModel? offer = detail.findOfferForVariant(variant?.id);
    final String? offerId = offer?.id ?? variant?.offerId;
    if (offerId == null || offerId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('สินค้าตัวเลือกนี้ยังไม่พร้อมจำหน่าย')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(cartControllerProvider.notifier).addOffer(
            offerId: offerId,
            sellerId: offer?.sellerId ?? 'seller_tamadee',
            sellerName: offer?.sellerName ?? 'ร้านค้าทำมาดี',
          );
      if (!mounted) return;
      if (goToCart) {
        await context.push('/cart');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('เพิ่ม "${detail.title}" ลงตะกร้าแล้ว')),
        );
      }
    } on Exception catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ไม่สามารถเพิ่มลงตะกร้า: $error')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final AsyncValue<ProductDetail> detailAsync = ref.watch(
      productDetailProvider(widget.productId),
    );
    final Set<String> wishlist = ref.watch(wishlistControllerProvider);

    return Scaffold(
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (Object err, StackTrace _) => ErrorRetryView(
          message: '$err',
          onRetry: () =>
              ref.invalidate(productDetailProvider(widget.productId)),
        ),
        data: (ProductDetail detail) {
          _ensureInitialSelection(detail);
          final ProductVariantModel? variant =
              detail.findVariant(_selectedOptions);
          final SellerOfferModel? offer =
              detail.findOfferForVariant(variant?.id);
          final int price = offer?.priceAmount ?? variant?.priceAmount ?? 0;

          return SafeArea(
            bottom: false,
            child: ListView(
              padding: const EdgeInsets.only(bottom: 100),
              children: <Widget>[
                ProductGalleryHeader(
                  images: detail.galleryUrls,
                  isWishlisted: wishlist.contains(detail.id),
                  onBack: () =>
                      context.canPop() ? context.pop() : context.go('/'),
                  onToggleWishlist: () => ref
                      .read(wishlistControllerProvider.notifier)
                      .toggle(detail.id),
                ),
                ProductDetailBody(
                  detail: detail,
                  price: price,
                  offer: offer,
                  selectedOptions: _selectedOptions,
                  onSelectOption: (String axis, String val) =>
                      setState(() => _selectedOptions[axis] = val),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: detailAsync.maybeWhen(
        data: (ProductDetail detail) => ProductBottomActionBar(
          submitting: _submitting,
          onAddToCart: () => _handleAddToCart(detail, goToCart: false),
          onBuyNow: () => _handleAddToCart(detail, goToCart: true),
        ),
        orElse: () => null,
      ),
    );
  }
}
