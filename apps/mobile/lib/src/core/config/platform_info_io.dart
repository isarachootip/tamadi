import 'dart:io' show Platform;

/// Native Dart VM check: true only when running on an actual Android OS/Emulator.
bool get isAndroidOs => Platform.isAndroid;
