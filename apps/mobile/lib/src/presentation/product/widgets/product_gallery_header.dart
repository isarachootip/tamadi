import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../shared/product_image_box.dart';

class ProductGalleryHeader extends StatefulWidget {
  const ProductGalleryHeader({
    super.key,
    required this.images,
    required this.isWishlisted,
    required this.onBack,
    required this.onToggleWishlist,
  });

  final List<String> images;
  final bool isWishlisted;
  final VoidCallback onBack;
  final VoidCallback onToggleWishlist;

  @override
  State<ProductGalleryHeader> createState() => _ProductGalleryHeaderState();
}

class _ProductGalleryHeaderState extends State<ProductGalleryHeader> {
  int _activeIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<String?> pages = widget.images.isEmpty
        ? const <String?>[null]
        : widget.images;
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color circleBg = isDark
        ? TamadeeColors.ink.withValues(alpha: 0.85)
        : TamadeeColors.white.withValues(alpha: 0.92);

    return SizedBox(
      height: 360,
      child: Stack(
        children: <Widget>[
          PageView.builder(
            itemCount: pages.length,
            onPageChanged: (int index) => setState(() => _activeIndex = index),
            itemBuilder: (BuildContext context, int index) {
              return ProductImageBox(
                imageUrl: pages[index],
                borderRadius: BorderRadius.zero,
                iconSize: 64,
              );
            },
          ),
          Positioned(
            top: 12,
            left: 14,
            right: 14,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                _FloatingCircleButton(
                  backgroundColor: circleBg,
                  tooltip: 'ย้อนกลับ',
                  onTap: widget.onBack,
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                ),
                _FloatingCircleButton(
                  backgroundColor: circleBg,
                  tooltip: 'บันทึกในรายการถูกใจ',
                  onTap: widget.onToggleWishlist,
                  icon: Icon(
                    widget.isWishlisted
                        ? Icons.favorite_rounded
                        : Icons.favorite_border_rounded,
                    size: 20,
                    color: widget.isWishlisted ? TamadeeColors.error : null,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 14,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    for (int i = 0; i < pages.length; i++)
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 6),
                        width: i == _activeIndex ? 22 : 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: i == _activeIndex
                              ? TamadeeColors.ink
                              : TamadeeColors.ink.withValues(alpha: 0.25),
                          borderRadius: TamadeeLayout.pillBorderRadius,
                        ),
                      ),
                  ],
                ),
                InkWell(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'ฟีเจอร์ลองสินค้าด้วย AR เตรียมเปิดใช้งานเร็ว ๆ นี้',
                        ),
                      ),
                    );
                  },
                  borderRadius: TamadeeLayout.pillBorderRadius,
                  child: Container(
                    height: 38,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: const BoxDecoration(
                      color: TamadeeColors.ink,
                      borderRadius: TamadeeLayout.pillBorderRadius,
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        Icon(
                          Icons.view_in_ar_rounded,
                          size: 16,
                          color: TamadeeColors.lime,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'ลองด้วย AR',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: TamadeeColors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FloatingCircleButton extends StatelessWidget {
  const _FloatingCircleButton({
    required this.backgroundColor,
    required this.tooltip,
    required this.onTap,
    required this.icon,
  });

  final Color backgroundColor;
  final String tooltip;
  final VoidCallback onTap;
  final Widget icon;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: tooltip,
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: TamadeeLayout.minTouchTarget,
          height: TamadeeLayout.minTouchTarget,
          decoration: BoxDecoration(
            color: backgroundColor,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: icon,
        ),
      ),
    );
  }
}
