import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

/// 5-slot Minimal + Bold bottom navigation bar with center lime AI sparkle CTA.
class MobileShellScaffold extends StatelessWidget {
  const MobileShellScaffold({
    super.key,
    required this.navigationShell,
  });

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color barBg = isDark ? TamadeeColors.ink : TamadeeColors.white;
    final Color borderColor =
        isDark ? TamadeeColors.borderDark : TamadeeColors.borderLight;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          color: barBg,
          border: Border(top: BorderSide(color: borderColor, width: 1)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 70,
            child: Row(
              children: <Widget>[
                Expanded(
                  child: _NavTabButton(
                    label: 'หน้าแรก',
                    icon: Icons.home_outlined,
                    activeIcon: Icons.home_rounded,
                    selected: navigationShell.currentIndex == 0,
                    onTap: () => _selectTab(0),
                  ),
                ),
                Expanded(
                  child: _NavTabButton(
                    label: 'หมวดหมู่',
                    icon: Icons.grid_view_outlined,
                    activeIcon: Icons.grid_view_rounded,
                    selected: navigationShell.currentIndex == 1,
                    onTap: () => _selectTab(1),
                  ),
                ),
                SizedBox(
                  width: 72,
                  child: Center(
                    child: Semantics(
                      button: true,
                      label: 'ผู้ช่วยช้อป AI น้องทำมะดิ',
                      child: InkWell(
                        onTap: () => context.push('/ai-assistant'),
                        customBorder: const CircleBorder(),
                        child: Container(
                          width: 52,
                          height: 52,
                          decoration: const BoxDecoration(
                            color: TamadeeColors.lime,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.auto_awesome,
                            color: TamadeeColors.ink,
                            size: 24,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: _NavTabButton(
                    label: 'ถูกใจ',
                    icon: Icons.favorite_border_rounded,
                    activeIcon: Icons.favorite_rounded,
                    selected: navigationShell.currentIndex == 2,
                    onTap: () => _selectTab(2),
                  ),
                ),
                Expanded(
                  child: _NavTabButton(
                    label: 'ฉัน',
                    icon: Icons.person_outline_rounded,
                    activeIcon: Icons.person_rounded,
                    selected: navigationShell.currentIndex == 3,
                    onTap: () => _selectTab(3),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _selectTab(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }
}

class _NavTabButton extends StatelessWidget {
  const _NavTabButton({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final IconData activeIcon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color activeColor = isDark ? TamadeeColors.white : TamadeeColors.ink;
    final Color inactiveColor =
        isDark ? TamadeeColors.textMutedDark : TamadeeColors.textMutedLight;
    final Color fg = selected ? activeColor : inactiveColor;

    return InkWell(
      onTap: onTap,
      child: ConstrainedBox(
        constraints: const BoxConstraints(
          minHeight: TamadeeLayout.minTouchTarget,
          minWidth: TamadeeLayout.minTouchTarget,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(selected ? activeIcon : icon, size: 22, color: fg),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
