import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';

import '../tokens/brand_colors.dart';
import '../tokens/brand_layout.dart';

/// Builds Light and Dark [ThemeData] adhering to Tamadee Minimal + Bold rules.
abstract final class TamadeeTheme {
  static ThemeData light({bool useGoogleFonts = true}) {
    return _buildTheme(
      brightness: Brightness.light,
      background: TamadeeColors.white,
      surface: TamadeeColors.surfaceMuted,
      foreground: TamadeeColors.ink,
      border: TamadeeColors.borderLight,
      useGoogleFonts: useGoogleFonts,
    );
  }

  static ThemeData dark({bool useGoogleFonts = true}) {
    return _buildTheme(
      brightness: Brightness.dark,
      background: TamadeeColors.ink,
      surface: TamadeeColors.surfaceDark,
      foreground: TamadeeColors.white,
      border: TamadeeColors.borderDark,
      useGoogleFonts: useGoogleFonts,
    );
  }

  static ThemeData _buildTheme({
    required Brightness brightness,
    required Color background,
    required Color surface,
    required Color foreground,
    required Color border,
    required bool useGoogleFonts,
  }) {
    final ColorScheme colorScheme = ColorScheme(
      brightness: brightness,
      primary: TamadeeColors.lime,
      onPrimary: TamadeeColors.ink,
      secondary: foreground,
      onSecondary: background,
      error: TamadeeColors.error,
      onError: TamadeeColors.white,
      surface: surface,
      onSurface: foreground,
    );

    final TextTheme baseTextTheme = brightness == Brightness.dark
        ? Typography.whiteMountainView
        : Typography.blackMountainView;
    final TextTheme textTheme = useGoogleFonts
        ? GoogleFonts.anuphanTextTheme(baseTextTheme).apply(
            bodyColor: foreground,
            displayColor: foreground,
          )
        : baseTextTheme.apply(
            bodyColor: foreground,
            displayColor: foreground,
          );

    const Size minTouchSize = Size(
      TamadeeLayout.minTouchTarget,
      TamadeeLayout.minTouchTarget,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: background,
      colorScheme: colorScheme,
      textTheme: textTheme,
      dividerColor: border,
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: minTouchSize,
          backgroundColor: TamadeeColors.lime,
          foregroundColor: TamadeeColors.ink,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: TamadeeLayout.pillBorderRadius,
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: minTouchSize,
          foregroundColor: foreground,
          side: BorderSide(color: foreground, width: 1.5),
          shape: const RoundedRectangleBorder(
            borderRadius: TamadeeLayout.pillBorderRadius,
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
      ),
    );
  }
}
