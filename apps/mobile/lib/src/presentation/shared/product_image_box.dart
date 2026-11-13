import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class ProductImageBox extends StatelessWidget {
  const ProductImageBox({
    super.key,
    required this.imageUrl,
    this.borderRadius = const BorderRadius.all(Radius.circular(20)),
    this.iconSize = 36,
  });

  final String? imageUrl;
  final BorderRadius borderRadius;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color placeholderBg =
        isDark ? const Color(0xFF252522) : const Color(0xFFEBEBE6);
    final Color iconColor =
        isDark ? TamadeeColors.textMutedDark : TamadeeColors.textMutedLight;

    final String? trimmed = imageUrl?.trim();
    return ClipRRect(
      borderRadius: borderRadius,
      child: ColoredBox(
        color: placeholderBg,
        child: trimmed != null && trimmed.isNotEmpty
            ? Image.network(
                trimmed,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
                errorBuilder: (
                  BuildContext context,
                  Object error,
                  StackTrace? stackTrace,
                ) {
                  return _FallbackPlaceholder(
                    iconColor: iconColor,
                    iconSize: iconSize,
                  );
                },
              )
            : _FallbackPlaceholder(iconColor: iconColor, iconSize: iconSize),
      ),
    );
  }
}

class _FallbackPlaceholder extends StatelessWidget {
  const _FallbackPlaceholder({
    required this.iconColor,
    required this.iconSize,
  });

  final Color iconColor;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Icon(
        Icons.shopping_bag_outlined,
        size: iconSize,
        color: iconColor.withValues(alpha: 0.55),
      ),
    );
  }
}
