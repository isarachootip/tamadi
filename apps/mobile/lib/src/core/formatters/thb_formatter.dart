import '../l10n/app_locale.dart';

/// Pure Thai Baht (`฿`) price formatter + tourist reference rates (`~$` / `~¥`).
abstract final class ThbFormatter {
  static const double _thbPerUsd = 34.0;
  static const double _thbPerCny = 4.8;

  static String format(num amount) {
    final int rounded = amount.round();
    final bool isNegative = rounded < 0;
    final String formattedDigits = _formatWithCommas(rounded.abs());
    return '${isNegative ? '-' : ''}฿$formattedDigits';
  }

  static String formatByLocale(num amount, AppLocale locale) {
    final int rounded = amount.round();
    final String thbText = format(rounded);
    if (locale == AppLocale.th || rounded <= 0) {
      return thbText;
    }
    if (locale == AppLocale.en) {
      final int usd = (rounded / _thbPerUsd).round().clamp(1, 999999999);
      return '$thbText (~\$${_formatWithCommas(usd)})';
    }
    final int cny = (rounded / _thbPerCny).round().clamp(1, 999999999);
    return '$thbText (~¥${_formatWithCommas(cny)})';
  }

  static String _formatWithCommas(int nonNegativeValue) {
    final String digits = nonNegativeValue.toString();
    final StringBuffer buffer = StringBuffer();
    for (int i = 0; i < digits.length; i++) {
      final int distanceFromEnd = digits.length - i;
      buffer.write(digits[i]);
      if (distanceFromEnd > 1 && distanceFromEnd % 3 == 1) {
        buffer.write(',');
      }
    }
    return buffer.toString();
  }
}
