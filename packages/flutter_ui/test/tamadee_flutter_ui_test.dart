import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('Tamadee Brand Tokens', () {
    test('exposes exact brand color hex values', () {
      expect(TamadeeColors.ink, const Color(0xFF111111));
      expect(TamadeeColors.lime, const Color(0xFFC6F432));
      expect(TamadeeColors.white, const Color(0xFFFFFFFF));
      expect(TamadeeColors.surfaceMuted, const Color(0xFFF1F1EE));
    });

    test('enforces >= 44dp minimum touch target and mobile frame metrics', () {
      expect(TamadeeLayout.minTouchTarget, greaterThanOrEqualTo(44.0));
      expect(TamadeeLayout.mobileDesignWidth, 390.0);
    });
  });

  group('TamadeeTheme (Light & Dark)', () {
    test('builds light and dark themes with >= 44dp button minimumSize', () {
      final ThemeData light = TamadeeTheme.light(useGoogleFonts: false);
      final ThemeData dark = TamadeeTheme.dark(useGoogleFonts: false);

      expect(light.brightness, Brightness.light);
      expect(light.scaffoldBackgroundColor, TamadeeColors.white);
      expect(light.colorScheme.primary, TamadeeColors.lime);

      expect(dark.brightness, Brightness.dark);
      expect(dark.scaffoldBackgroundColor, TamadeeColors.ink);
      expect(dark.colorScheme.primary, TamadeeColors.lime);

      final Size? minButtonSize = light.elevatedButtonTheme.style?.minimumSize
          ?.resolve(<WidgetState>{});
      expect(minButtonSize, isNotNull);
      expect(minButtonSize!.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('Tamadee Brand Widgets', () {
    testWidgets('renders TamadeeLogoWidget, Mascot, and AppIcon in light & dark modes',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: TamadeeTheme.light(useGoogleFonts: false),
          home: const Scaffold(
            body: Column(
              children: <Widget>[
                TamadeeLogoWidget(),
                NongTammadiMascotWidget(size: 64),
                TamadeeAppIconWidget(size: 64),
              ],
            ),
          ),
        ),
      );

      expect(find.text('tama'), findsOneWidget);
      expect(find.text('dee'), findsOneWidget);
      expect(find.byType(SvgPicture), findsNWidgets(3));

      await tester.pumpWidget(
        MaterialApp(
          theme: TamadeeTheme.dark(useGoogleFonts: false),
          home: const Scaffold(
            body: NongTammadiMascotWidget(size: 48),
          ),
        ),
      );

      expect(find.byType(SvgPicture), findsOneWidget);
    });
  });
}
