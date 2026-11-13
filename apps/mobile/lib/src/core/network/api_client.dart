import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';
import 'json_parsers.dart';

/// HTTP client wrapping [Dio] with publishable key & customer JWT headers.
class ApiClient {
  ApiClient({
    required this.config,
    required this.tokenStorage,
    Dio? dio,
  }) : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: config.apiBaseUrl,
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 20),
                headers: <String, String>{
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  if (config.hasPublishableKey)
                    'x-publishable-api-key': config.publishableApiKey,
                },
              ),
            );

  final AppConfig config;
  final TokenStorage tokenStorage;
  final Dio _dio;

  Future<JsonMap> get(
    String path, {
    Map<String, Object?>? queryParameters,
    bool authenticated = false,
  }) async {
    return _send(
      method: 'GET',
      path: path,
      queryParameters: queryParameters,
      authenticated: authenticated,
    );
  }

  Future<JsonMap> post(
    String path, {
    Map<String, Object?>? body,
    Map<String, Object?>? queryParameters,
    bool authenticated = false,
    String? overrideBearerToken,
  }) async {
    return _send(
      method: 'POST',
      path: path,
      body: body,
      queryParameters: queryParameters,
      authenticated: authenticated,
      overrideBearerToken: overrideBearerToken,
    );
  }

  Future<JsonMap> delete(
    String path, {
    Map<String, Object?>? queryParameters,
    bool authenticated = false,
  }) async {
    return _send(
      method: 'DELETE',
      path: path,
      queryParameters: queryParameters,
      authenticated: authenticated,
    );
  }

  Future<JsonMap> _send({
    required String method,
    required String path,
    Map<String, Object?>? body,
    Map<String, Object?>? queryParameters,
    bool authenticated = false,
    String? overrideBearerToken,
  }) async {
    if (path.startsWith('/store') && !config.hasPublishableKey) {
      throw const ApiException(
        message:
            'ยังไม่ได้ตั้งค่า TAMADEE_PUBLISHABLE_KEY (รันด้วย --dart-define-from-file=.env.json)',
      );
    }

    final Map<String, String> extraHeaders = <String, String>{};
    final String? token = overrideBearerToken ??
        (authenticated ? await tokenStorage.readToken() : null);
    if (token != null && token.isNotEmpty) {
      extraHeaders['Authorization'] = 'Bearer $token';
    }

    try {
      final Response<Object?> response = await _dio.request<Object?>(
        path,
        data: body,
        queryParameters: queryParameters,
        options: Options(method: method, headers: extraHeaders),
      );
      final Object? rawData = response.data;
      if (rawData == null || (rawData is String && rawData.isEmpty)) {
        return const <String, Object?>{};
      }
      return JsonParsers.asJsonMap(rawData, context: '$method $path');
    } on DioException catch (error) {
      throw _mapDioError(error);
    } on FormatException catch (error) {
      throw ApiException(message: 'ข้อมูลจากเซิร์ฟเวอร์ผิดรูปแบบ: ${error.message}');
    }
  }

  ApiException _mapDioError(DioException error) {
    final int? status = error.response?.statusCode;
    final Object? data = error.response?.data;
    if (data is Map<Object?, Object?>) {
      final Object? serverMsg = data['message'];
      if (serverMsg is String && serverMsg.trim().isNotEmpty) {
        return ApiException(message: serverMsg.trim(), statusCode: status);
      }
    }
    if (status == 401) {
      return const ApiException(
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือเซสชันหมดอายุ',
        statusCode: 401,
      );
    }
    return ApiException(
      message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Tamadee ได้ (${status ?? "เครือข่ายขัดข้อง"})',
      statusCode: status,
    );
  }
}
