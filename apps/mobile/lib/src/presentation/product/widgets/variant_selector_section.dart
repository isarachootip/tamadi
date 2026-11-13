import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../domain/models/product.dart';
import 'color_swatch_option.dart';

class VariantSelectorSection extends StatelessWidget {
  const VariantSelectorSection({
    super.key,
    required this.options,
    required this.selectedOptions,
    required this.onSelectOption,
  });

  final List<ProductOptionAxis> options;
  final Map<String, String> selectedOptions;
  final void Function(String axisTitle, String value) onSelectOption;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color surfaceColor =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Row(
            children: <Widget>[
              CircleAvatar(
                radius: 15,
                backgroundColor: TamadeeColors.lime,
                child: Icon(
                  Icons.auto_awesome,
                  size: 16,
                  color: TamadeeColors.ink,
                ),
              ),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'AI แนะนำไซซ์ M จากออเดอร์ก่อนหน้าของคุณ',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
        for (final ProductOptionAxis axis in options) ...<Widget>[
          const SizedBox(height: 18),
          Text(
            axis.title,
            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: <Widget>[
              for (final String val in axis.values)
                axis.title.contains('สี')
                    ? ColorSwatchOption(
                        label: val,
                        selected: selectedOptions[axis.title] == val,
                        isDark: isDark,
                        onTap: () => onSelectOption(axis.title, val),
                      )
                    : _SizeChipOption(
                        label: val,
                        selected: selectedOptions[axis.title] == val,
                        isDark: isDark,
                        onTap: () => onSelectOption(axis.title, val),
                      ),
            ],
          ),
        ],
      ],
    );
  }
}

class _SizeChipOption extends StatelessWidget {
  const _SizeChipOption({
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

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        constraints: const BoxConstraints(
          minWidth: 52,
          minHeight: TamadeeLayout.minTouchTarget,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected
                ? bg
                : (isDark
                      ? TamadeeColors.borderDark
                      : TamadeeColors.borderLight),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(fontWeight: FontWeight.w700, color: fg),
        ),
      ),
    );
  }
}
