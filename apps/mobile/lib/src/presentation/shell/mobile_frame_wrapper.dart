import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

/// Constrains wide desktop/tablet viewports (e.g. m.tamadee.online on PC)
/// into a clean centered 430px mobile frame while keeping full-bleed on phones.
class MobileFrameWrapper extends StatelessWidget {
  const MobileFrameWrapper({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        if (constraints.maxWidth <= TamadeeLayout.mobileMaxFrameWidth + 32) {
          return child;
        }
        return ColoredBox(
          color: isDark ? const Color(0xFF070707) : TamadeeColors.offWhite,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: TamadeeLayout.mobileMaxFrameWidth,
              ),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border.symmetric(
                    vertical: BorderSide(
                      color: isDark
                          ? TamadeeColors.borderDark
                          : TamadeeColors.borderLight,
                    ),
                  ),
                ),
                child: ClipRect(child: child),
              ),
            ),
          ),
        );
      },
    );
  }
}
