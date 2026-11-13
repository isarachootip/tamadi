import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../domain/models/category.dart';

class CategoryPillsBar extends StatelessWidget {
  const CategoryPillsBar({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onSelect,
  });

  final List<ProductCategory> categories;
  final String? selectedCategoryId;
  final ValueChanged<String?> onSelect;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return SizedBox(
      height: TamadeeLayout.minTouchTarget,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: <Widget>[
          _PillChip(
            label: 'สำหรับคุณ',
            selected: selectedCategoryId == null,
            isDark: isDark,
            onTap: () => onSelect(null),
          ),
          for (final ProductCategory cat in categories) ...<Widget>[
            const SizedBox(width: 8),
            _PillChip(
              label: cat.name,
              selected: selectedCategoryId == cat.id,
              isDark: isDark,
              onTap: () => onSelect(cat.id),
            ),
          ],
        ],
      ),
    );
  }
}

class _PillChip extends StatelessWidget {
  const _PillChip({
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
    final Color bg = selected
        ? (isDark ? TamadeeColors.lime : TamadeeColors.ink)
        : (isDark ? TamadeeColors.surfaceDark : TamadeeColors.white);
    final Color fg = selected
        ? (isDark ? TamadeeColors.ink : TamadeeColors.white)
        : (isDark ? TamadeeColors.white : TamadeeColors.ink);
    final Color border = selected
        ? bg
        : (isDark ? TamadeeColors.borderDark : TamadeeColors.borderLight);

    return InkWell(
      onTap: onTap,
      borderRadius: TamadeeLayout.pillBorderRadius,
      child: Container(
        constraints: const BoxConstraints(
          minHeight: TamadeeLayout.minTouchTarget,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 18),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: TamadeeLayout.pillBorderRadius,
          border: Border.all(color: border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: fg,
          ),
        ),
      ),
    );
  }
}
