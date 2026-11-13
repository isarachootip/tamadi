import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/json_parsers.dart';
import '../../core/storage/token_storage.dart';
import '../../domain/models/customer.dart';
import '../../domain/repositories/auth_repository.dart';
import '../mappers/customer_mapper.dart';

class MercurAuthRepository implements AuthRepository {
  const MercurAuthRepository({
    required this.apiClient,
    required this.tokenStorage,
  });

  final ApiClient apiClient;
  final TokenStorage tokenStorage;

  @override
  Future<CustomerProfile?> getCurrentCustomer() async {
    final String? token = await tokenStorage.readToken();
    if (token == null || token.isEmpty) {
      return null;
    }
    try {
      final JsonMap res = await apiClient.get(
        '/store/customers/me',
        queryParameters: <String, Object?>{'fields': '*addresses'},
        authenticated: true,
      );
      return CustomerMapper.fromJson(
        JsonParsers.asJsonMap(res['customer'], context: 'customer'),
      );
    } on ApiException catch (error) {
      if (error.statusCode == 401) {
        await tokenStorage.clearToken();
        return null;
      }
      rethrow;
    }
  }

  @override
  Future<CustomerProfile> login({
    required String email,
    required String password,
  }) async {
    final JsonMap authRes = await apiClient.post(
      '/auth/customer/emailpass',
      body: <String, Object?>{
        'email': email.trim(),
        'password': password,
      },
    );
    final String token = JsonParsers.readString(authRes, 'token');
    await tokenStorage.saveToken(token);
    final CustomerProfile? profile = await getCurrentCustomer();
    if (profile == null) {
      throw const ApiException(message: 'ไม่สามารถโหลดข้อมูลบัญชีผู้ใช้ได้');
    }
    return profile;
  }

  @override
  Future<CustomerProfile> register(RegisterCustomerInput input) async {
    final JsonMap regRes = await apiClient.post(
      '/auth/customer/emailpass/register',
      body: <String, Object?>{
        'email': input.email.trim(),
        'password': input.password,
      },
    );
    final String registrationToken = JsonParsers.readString(regRes, 'token');

    await apiClient.post(
      '/store/customers',
      overrideBearerToken: registrationToken,
      body: <String, Object?>{
        'email': input.email.trim(),
        'first_name': input.firstName.trim(),
        'last_name': input.lastName.trim(),
        if (input.phone != null && input.phone!.trim().isNotEmpty)
          'phone': input.phone!.trim(),
      },
    );

    return login(email: input.email, password: input.password);
  }

  @override
  Future<void> logout() async {
    await tokenStorage.clearToken();
  }

  @override
  Future<CustomerProfile> addShippingAddress(CreateAddressInput input) async {
    final JsonMap res = await apiClient.post(
      '/store/customers/me/addresses',
      authenticated: true,
      body: <String, Object?>{
        'first_name': input.firstName.trim(),
        'last_name': input.lastName.trim(),
        'address_1': input.address1.trim(),
        'city': input.city.trim(),
        'province': input.province.trim(),
        'postal_code': input.postalCode.trim(),
        'country_code': 'th',
        'phone': input.phone.trim(),
        'is_default_shipping': true,
        if (input.addressName != null && input.addressName!.trim().isNotEmpty)
          'address_name': input.addressName!.trim(),
      },
    );
    return CustomerMapper.fromJson(
      JsonParsers.asJsonMap(res['customer'], context: 'customer'),
    );
  }

  @override
  Future<List<OrderGroupSummary>> listOrderGroups() async {
    final JsonMap res = await apiClient.get(
      '/store/order-groups',
      authenticated: true,
    );
    final List<JsonMap> rawGroups = JsonParsers.asJsonMapList(
      res['order_groups'],
      context: 'order_groups',
    );
    return <OrderGroupSummary>[
      for (final JsonMap group in rawGroups) CustomerMapper.toOrderGroup(group),
    ];
  }
}
