import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/l10n/app_locale.dart';
import '../../core/l10n/app_strings.dart';
import 'core_providers.dart';

class LocaleController extends Notifier<AppLocale> {
  @override
  AppLocale build() {
    unawaited(_loadSavedLocale());
    return AppLocale.th;
  }

  Future<void> _loadSavedLocale() async {
    final AppLocale saved = await ref.read(prefsStorageProvider).readLocale();
    if (saved != state) {
      state = saved;
    }
  }

  Future<void> setLocale(AppLocale locale) async {
    state = locale;
    await ref.read(prefsStorageProvider).saveLocale(locale);
  }
}

final NotifierProvider<LocaleController, AppLocale> localeControllerProvider =
    NotifierProvider<LocaleController, AppLocale>(LocaleController.new);

final Provider<AppStrings> appStringsProvider = Provider<AppStrings>((Ref ref) {
  final AppLocale locale = ref.watch(localeControllerProvider);
  return AppStrings.of(locale);
});
