import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/models/product.dart';
import 'core_providers.dart';

class WishlistController extends Notifier<Set<String>> {
  @override
  Set<String> build() {
    unawaited(_loadSaved());
    return <String>{};
  }

  Future<void> _loadSaved() async {
    final Set<String> saved =
        await ref.read(prefsStorageProvider).readWishlistIds();
    if (saved.isNotEmpty && state.isEmpty) {
      state = saved;
    }
  }

  Future<void> toggle(String productId) async {
    final Set<String> next = Set<String>.from(state);
    if (!next.remove(productId)) {
      next.add(productId);
    }
    state = next;
    await ref.read(prefsStorageProvider).saveWishlistIds(next);
  }
}

final NotifierProvider<WishlistController, Set<String>>
    wishlistControllerProvider =
    NotifierProvider<WishlistController, Set<String>>(WishlistController.new);

final FutureProvider<List<ProductSummary>> wishlistProductsProvider =
    FutureProvider<List<ProductSummary>>((Ref ref) async {
      final Set<String> ids = ref.watch(wishlistControllerProvider);
      if (ids.isEmpty) {
        return const <ProductSummary>[];
      }
      final List<ProductSummary> all =
          await ref.watch(catalogRepositoryProvider).listProducts();
      return all
          .where((ProductSummary product) => ids.contains(product.id))
          .toList(growable: false);
    });
