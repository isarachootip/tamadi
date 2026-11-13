import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

class NewDropBanner extends StatelessWidget {
  const NewDropBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardColor =
        isDark ? const Color(0xFF1F1F1C) : TamadeeColors.ink;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: TamadeeLayout.cardBorderRadius,
        border: isDark
            ? Border.all(color: TamadeeColors.borderDark)
            : null,
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'คอลเลกชันใหม่',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFFB5B5AE),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'NEW\nDROP',
                  style: TextStyle(
                    fontFamily: 'Space Grotesk',
                    fontSize: 34,
                    fontWeight: FontWeight.w800,
                    height: 0.94,
                    letterSpacing: -1.0,
                    color: TamadeeColors.lime,
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  height: TamadeeLayout.minTouchTarget,
                  child: ElevatedButton(
                    onPressed: () => context.push('/search'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: TamadeeColors.lime,
                      foregroundColor: TamadeeColors.ink,
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                    ),
                    child: const Text(
                      'ช้อปเลย',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 100,
            height: 112,
            decoration: BoxDecoration(
              color: const Color(0xFF282824),
              borderRadius: BorderRadius.circular(20),
            ),
            alignment: Alignment.center,
            child: const NongTammadiMascotWidget(
              size: 76,
              brightness: Brightness.dark,
            ),
          ),
        ],
      ),
    );
  }
}
