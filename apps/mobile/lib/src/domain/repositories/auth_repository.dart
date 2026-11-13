import '../models/customer.dart';

class RegisterCustomerInput {
  const RegisterCustomerInput({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    this.phone,
  });

  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String? phone;
}

class CreateAddressInput {
  const CreateAddressInput({
    required this.firstName,
    required this.lastName,
    required this.address1,
    required this.city,
    required this.province,
    required this.postalCode,
    required this.phone,
    this.addressName,
  });

  final String firstName;
  final String lastName;
  final String address1;
  final String city;
  final String province;
  final String postalCode;
  final String phone;
  final String? addressName;
}

abstract interface class AuthRepository {
  Future<CustomerProfile?> getCurrentCustomer();
  Future<CustomerProfile> login({
    required String email,
    required String password,
  });
  Future<CustomerProfile> register(RegisterCustomerInput input);
  Future<void> logout();
  Future<CustomerProfile> addShippingAddress(CreateAddressInput input);
  Future<List<OrderGroupSummary>> listOrderGroups();
}
