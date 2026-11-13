import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class ColorSwatchOption extends StatelessWidget {
  const ColorSwatchOption({
    super.key,
    required this.label,
    required this.selected,
    required this.isDark,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color ringColor = isDark ? TamadeeColors.lime : TamadeeColors.ink;
    return InkWell(
      onTap: onTap,
      borderRadius: TamadeeLayout.pillBorderRadius,
      child: ConstrainedBox(
        constraints: const BoxConstraints(
          minHeight: TamadeeLayout.minTouchTarget,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected ? ringColor : Colors.transparent,
                  width: 2,
                ),
              ),
              child: Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: _resolveThaiColor(label),
                  shape: BoxShape.circle,
                  border: Border.all(color: TamadeeColors.borderLight),
                ),
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Color _resolveThaiColor(String name) {
    if (name.contains('ดำ')) return const Color(0xFF191919);
    if (name.contains('เขียว') || name.contains('มะกอก')) {
      return const Color(0xFF6B7B5C);
    }
    if (name.contains('น้ำตาล') || name.contains('แทน')) {
      return const Color(0xFF8B5E3C);
    }
    if (name.contains('กรม') || name.contains('คราม')) {
      return const Color(0xFF283A5A);
    }
    if (name.contains('เงิน')) return const Color(0xFFC8CCD0);
    return const Color(0xFFF3EFE6);
  }
}
