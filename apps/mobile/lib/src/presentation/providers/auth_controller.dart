import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/models/customer.dart';
import '../../domain/repositories/auth_repository.dart';
import 'cart_controller.dart';
import 'core_providers.dart';

class AuthController extends AsyncNotifier<CustomerProfile?> {
  @override
  Future<CustomerProfile?> build() {
    return ref.watch(authRepositoryProvider).getCurrentCustomer();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final CustomerProfile customer = await ref
        .read(authRepositoryProvider)
        .login(email: email, password: password);
    state = AsyncData<CustomerProfile?>(customer);
    try {
      await ref
          .read(cartControllerProvider.notifier)
          .attachToAuthenticatedCustomer();
    } on Exception {
      // Non-fatal if cart was already attached to another customer.
    }
  }

  Future<void> register(RegisterCustomerInput input) async {
    final CustomerProfile customer =
        await ref.read(authRepositoryProvider).register(input);
    state = AsyncData<CustomerProfile?>(customer);
    try {
      await ref
          .read(cartControllerProvider.notifier)
          .attachToAuthenticatedCustomer();
    } on Exception {
      // Non-fatal if guest cart cannot be transferred.
    }
  }

  Future<void> addAddress(CreateAddressInput input) async {
    final CustomerProfile updated =
        await ref.read(authRepositoryProvider).addShippingAddress(input);
    state = AsyncData<CustomerProfile?>(updated);
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData<CustomerProfile?>(null);
  }
}

final AsyncNotifierProvider<AuthController, CustomerProfile?>
    authControllerProvider =
    AsyncNotifierProvider<AuthController, CustomerProfile?>(
      AuthController.new,
    );

final FutureProvider<List<OrderGroupSummary>> orderGroupsProvider =
    FutureProvider<List<OrderGroupSummary>>((Ref ref) async {
      final CustomerProfile? customer =
          await ref.watch(authControllerProvider.future);
      if (customer == null) {
        return const <OrderGroupSummary>[];
      }
      return ref.watch(authRepositoryProvider).listOrderGroups();
    });
