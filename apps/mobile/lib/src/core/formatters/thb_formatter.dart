/// Pure Thai Baht (`฿`) price formatter matching Minimal + Bold spec.
abstract final class ThbFormatter {
  static String format(num amount) {
    final int rounded = amount.round();
    final bool isNegative = rounded < 0;
    final String digits = rounded.abs().toString();
    final StringBuffer buffer = StringBuffer();

    for (int i = 0; i < digits.length; i++) {
      final int distanceFromEnd = digits.length - i;
      buffer.write(digits[i]);
      if (distanceFromEnd > 1 && distanceFromEnd % 3 == 1) {
        buffer.write(',');
      }
    }

    return '${isNegative ? '-' : ''}฿$buffer';
  }
}
