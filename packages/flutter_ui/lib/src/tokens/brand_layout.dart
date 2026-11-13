import 'package:flutter/widgets.dart';

/// Ergonomic layout constants and corner radii for Tamadee Mobile & Web.
abstract final class TamadeeLayout {
  static const double minTouchTarget = 44.0;
  static const double mobileDesignWidth = 390.0;
  static const double mobileMaxFrameWidth = 430.0;

  static const double radiusSm = 12.0;
  static const double radiusMd = 16.0;
  static const double radiusLg = 24.0;
  static const double radiusPill = 999.0;

  static const BorderRadius cardBorderRadius = BorderRadius.all(
    Radius.circular(radiusLg),
  );
  static const BorderRadius controlBorderRadius = BorderRadius.all(
    Radius.circular(radiusMd),
  );
  static const BorderRadius pillBorderRadius = BorderRadius.all(
    Radius.circular(radiusPill),
  );
}
