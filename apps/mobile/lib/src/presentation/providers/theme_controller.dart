import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import 'core_providers.dart';

class ThemeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    unawaited(_loadSavedTheme());
    return ThemeMode.light;
  }

  Future<void> _loadSavedTheme() async {
    final ThemeMode saved = await ref.read(prefsStorageProvider).readThemeMode();
    state = saved;
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await ref.read(prefsStorageProvider).saveThemeMode(mode);
  }
}

final NotifierProvider<ThemeController, ThemeMode> themeControllerProvider =
    NotifierProvider<ThemeController, ThemeMode>(ThemeController.new);
