import 'package:material_ui/material_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Persists non-sensitive preferences: active cart ID, wishlist IDs, and ThemeMode.
abstract interface class LocalPrefsStorage {
  Future<String?> readCartId();
  Future<void> saveCartId(String cartId);
  Future<void> clearCartId();

  Future<Set<String>> readWishlistIds();
  Future<void> saveWishlistIds(Set<String> ids);

  Future<ThemeMode> readThemeMode();
  Future<void> saveThemeMode(ThemeMode mode);
}

class SharedPrefsLocalStorage implements LocalPrefsStorage {
  const SharedPrefsLocalStorage();

  static const String _cartIdKey = 'tamadee_cart_id';
  static const String _wishlistKey = 'tamadee_wishlist_ids';
  static const String _themeKey = 'tamadee_theme_mode';

  @override
  Future<String?> readCartId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_cartIdKey);
  }

  @override
  Future<void> saveCartId(String cartId) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cartIdKey, cartId);
  }

  @override
  Future<void> clearCartId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartIdKey);
  }

  @override
  Future<Set<String>> readWishlistIds() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final List<String> list = prefs.getStringList(_wishlistKey) ?? const <String>[];
    return list.toSet();
  }

  @override
  Future<void> saveWishlistIds(Set<String> ids) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_wishlistKey, ids.toList(growable: false));
  }

  @override
  Future<ThemeMode> readThemeMode() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? raw = prefs.getString(_themeKey);
    return switch (raw) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  @override
  Future<void> saveThemeMode(ThemeMode mode) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String raw = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };
    await prefs.setString(_themeKey, raw);
  }
}

class InMemoryPrefsStorage implements LocalPrefsStorage {
  String? _cartId;
  Set<String> _wishlist = <String>{};
  ThemeMode _themeMode = ThemeMode.light;

  @override
  Future<String?> readCartId() async => _cartId;

  @override
  Future<void> saveCartId(String cartId) async {
    _cartId = cartId;
  }

  @override
  Future<void> clearCartId() async {
    _cartId = null;
  }

  @override
  Future<Set<String>> readWishlistIds() async => Set<String>.from(_wishlist);

  @override
  Future<void> saveWishlistIds(Set<String> ids) async {
    _wishlist = Set<String>.from(ids);
  }

  @override
  Future<ThemeMode> readThemeMode() async => _themeMode;

  @override
  Future<void> saveThemeMode(ThemeMode mode) async {
    _themeMode = mode;
  }
}
