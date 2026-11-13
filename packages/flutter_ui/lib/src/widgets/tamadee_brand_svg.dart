import 'package:flutter_svg/flutter_svg.dart';
import 'package:material_ui/material_ui.dart';

import '../tokens/brand_colors.dart';

const String _packageName = 'tamadee_flutter_ui';

/// Renders the "น้องทำมะดิ" mascot SVG, automatically adapting to Light/Dark mode.
class NongTammadiMascotWidget extends StatelessWidget {
  const NongTammadiMascotWidget({
    super.key,
    this.size = 48.0,
    this.brightness,
    this.semanticsLabel = 'น้องทำมะดิ มาสคอต Tamadee',
  });

  final double size;
  final Brightness? brightness;
  final String semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final Brightness effectiveBrightness =
        brightness ?? Theme.of(context).brightness;
    final String assetPath = effectiveBrightness == Brightness.dark
        ? 'assets/svg/mascot-nong-tammadi-dark.svg'
        : 'assets/svg/mascot-nong-tammadi.svg';

    return SvgPicture.asset(
      assetPath,
      package: _packageName,
      width: size,
      height: size,
      semanticsLabel: semanticsLabel,
    );
  }
}

/// Renders the Tamadee App Icon SVG (lime rounded square + mascot).
class TamadeeAppIconWidget extends StatelessWidget {
  const TamadeeAppIconWidget({
    super.key,
    this.size = 64.0,
    this.semanticsLabel = 'ไอคอนแอป Tamadee',
  });

  final double size;
  final String semanticsLabel;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/svg/app-icon.svg',
      package: _packageName,
      width: size,
      height: size,
      semanticsLabel: semanticsLabel,
    );
  }
}

/// Renders the full Tamadee horizontal brand logo (Mascot + "tama" + lime "dee" pill).
class TamadeeLogoWidget extends StatelessWidget {
  const TamadeeLogoWidget({
    super.key,
    this.height = 36.0,
    this.brightness,
  });

  final double height;
  final Brightness? brightness;

  @override
  Widget build(BuildContext context) {
    final Brightness effectiveBrightness =
        brightness ?? Theme.of(context).brightness;
    final Color wordmarkColor = effectiveBrightness == Brightness.dark
        ? TamadeeColors.white
        : TamadeeColors.ink;
    final double fontSize = height * 0.56;

    return Semantics(
      label: 'โลโก้ Tamadee',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          NongTammadiMascotWidget(
            size: height,
            brightness: effectiveBrightness,
          ),
          SizedBox(width: height * 0.2),
          Text(
            'tama',
            style: TextStyle(
              fontFamily: 'Space Grotesk',
              fontSize: fontSize,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.5,
              color: wordmarkColor,
              height: 1.0,
            ),
          ),
          SizedBox(width: height * 0.08),
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: height * 0.22,
              vertical: height * 0.12,
            ),
            decoration: BoxDecoration(
              color: TamadeeColors.lime,
              borderRadius: BorderRadius.circular(height * 0.28),
            ),
            child: Text(
              'dee',
              style: TextStyle(
                fontFamily: 'Space Grotesk',
                fontSize: fontSize,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.5,
                color: TamadeeColors.ink,
                height: 1.0,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
