import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Abstraction for storing customer authentication JWT tokens.
abstract interface class TokenStorage {
  Future<String?> readToken();
  Future<void> saveToken(String token);
  Future<void> clearToken();
}

class SecureTokenStorage implements TokenStorage {
  const SecureTokenStorage({
    this.storage = const FlutterSecureStorage(),
  });

  static const String _tokenKey = 'tamadee_customer_jwt';
  final FlutterSecureStorage storage;

  @override
  Future<String?> readToken() => storage.read(key: _tokenKey);

  @override
  Future<void> saveToken(String token) =>
      storage.write(key: _tokenKey, value: token);

  @override
  Future<void> clearToken() => storage.delete(key: _tokenKey);
}

class InMemoryTokenStorage implements TokenStorage {
  String? _token;

  @override
  Future<String?> readToken() async => _token;

  @override
  Future<void> saveToken(String token) async {
    _token = token;
  }

  @override
  Future<void> clearToken() async {
    _token = null;
  }
}
