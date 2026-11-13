import 'package:flutter/foundation.dart';

import 'platform_info_stub.dart'
    if (dart.library.io) 'platform_info_io.dart';

/// Application runtime configuration injected via `--dart-define`.
@immutable
class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.publishableApiKey,
    required this.siteUrl,
  });

  factory AppConfig.fromEnvironment() {
    const String rawBaseUrl = String.fromEnvironment(
      'TAMADEE_API_BASE_URL',
      defaultValue: 'http://127.0.0.1:9000',
    );
    const String publishableKey = String.fromEnvironment(
      'TAMADEE_PUBLISHABLE_KEY',
    );
    const String siteUrl = String.fromEnvironment(
      'TAMADEE_SITE_URL',
      defaultValue: 'https://m.tamadee.online',
    );

    return AppConfig(
      apiBaseUrl: normalizeApiBaseUrl(
        rawBaseUrl,
        isWeb: kIsWeb,
        isAndroid: !kIsWeb && isAndroidOs,
      ),
      publishableApiKey: publishableKey.trim(),
      siteUrl: _stripTrailingSlash(siteUrl.trim()),
    );
  }

  final String apiBaseUrl;
  final String publishableApiKey;
  final String siteUrl;

  bool get hasPublishableKey => publishableApiKey.isNotEmpty;

  /// Rewrites localhost / 127.0.0.1 to 10.0.2.2 when running on Android Emulator.
  static String normalizeApiBaseUrl(
    String rawUrl, {
    required bool isWeb,
    required bool isAndroid,
  }) {
    final String cleaned = _stripTrailingSlash(rawUrl.trim());
    if (!isWeb && isAndroid) {
      final Uri? parsed = Uri.tryParse(cleaned);
      if (parsed != null &&
          (parsed.host == 'localhost' || parsed.host == '127.0.0.1')) {
        return _stripTrailingSlash(parsed.replace(host: '10.0.2.2').toString());
      }
    }
    return cleaned;
  }

  static String _stripTrailingSlash(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }
    return value;
  }
}
