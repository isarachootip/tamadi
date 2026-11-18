import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/l10n/app_locale.dart';
import '../providers/locale_controller.dart';

class LanguagePillSelector extends ConsumerWidget {
  const LanguagePillSelector({
    super.key,
    this.compact = true,
  });

  final bool compact;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppLocale active = ref.watch(localeControllerProvider);
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color bg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;
    final Color border =
        isDark ? TamadeeColors.borderDark : TamadeeColors.borderLight;

    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: TamadeeLayout.pillBorderRadius,
        border: Border.all(color: border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          for (final AppLocale opt in AppLocale.values)
            _LocaleChip(
              locale: opt,
              selected: opt == active,
              isDark: isDark,
              compact: compact,
              onTap: () {
                ref.read(localeControllerProvider.notifier).setLocale(opt);
              },
            ),
        ],
      ),
    );
  }
}

class _LocaleChip extends StatelessWidget {
  const _LocaleChip({
    required this.locale,
    required this.selected,
    required this.isDark,
    required this.compact,
    required this.onTap,
  });

  final AppLocale locale;
  final bool selected;
  final bool isDark;
  final bool compact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color activeBg = isDark ? TamadeeColors.lime : TamadeeColors.ink;
    final Color activeFg = isDark ? TamadeeColors.ink : TamadeeColors.lime;
    final Color idleFg =
        isDark ? TamadeeColors.textMutedDark : TamadeeColors.textMutedLight;

    return Semantics(
      button: true,
      selected: selected,
      label: 'Language ${locale.shortLabel}',
      child: InkWell(
        onTap: onTap,
        borderRadius: TamadeeLayout.pillBorderRadius,
        child: Container(
          constraints: BoxConstraints(
            minHeight: compact ? 34 : 40,
            minWidth: compact ? 34 : 44,
          ),
          padding: EdgeInsets.symmetric(horizontal: compact ? 8 : 12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? activeBg : Colors.transparent,
            borderRadius: TamadeeLayout.pillBorderRadius,
          ),
          child: Text(
            locale.shortLabel,
            style: TextStyle(
              fontSize: compact ? 11.5 : 13,
              fontWeight: FontWeight.w800,
              color: selected ? activeFg : idleFg,
            ),
          ),
        ),
      ),
    );
  }
}
