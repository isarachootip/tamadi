import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/app_config.dart';
import '../../core/media/image_picker_adapter.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/local_prefs_storage.dart';
import '../../core/storage/token_storage.dart';
import '../../data/repositories/mercur_ai_repository.dart';
import '../../data/repositories/mercur_auth_repository.dart';
import '../../data/repositories/mercur_cart_repository.dart';
import '../../data/repositories/mercur_catalog_repository.dart';
import '../../domain/repositories/ai_repository.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/cart_repository.dart';
import '../../domain/repositories/catalog_repository.dart';

final Provider<AppConfig> appConfigProvider = Provider<AppConfig>((Ref ref) {
  return AppConfig.fromEnvironment();
});

final Provider<TokenStorage> tokenStorageProvider = Provider<TokenStorage>((
  Ref ref,
) {
  return const SecureTokenStorage();
});

final Provider<LocalPrefsStorage> prefsStorageProvider =
    Provider<LocalPrefsStorage>((Ref ref) {
      return const SharedPrefsLocalStorage();
    });

final Provider<ApiClient> apiClientProvider = Provider<ApiClient>((Ref ref) {
  return ApiClient(
    config: ref.watch(appConfigProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

final Provider<CatalogRepository> catalogRepositoryProvider =
    Provider<CatalogRepository>((Ref ref) {
      return MercurCatalogRepository(apiClient: ref.watch(apiClientProvider));
    });

final Provider<CartRepository> cartRepositoryProvider =
    Provider<CartRepository>((Ref ref) {
      return MercurCartRepository(
        apiClient: ref.watch(apiClientProvider),
        prefsStorage: ref.watch(prefsStorageProvider),
        catalogRepository: ref.watch(catalogRepositoryProvider),
      );
    });

final Provider<AuthRepository> authRepositoryProvider =
    Provider<AuthRepository>((Ref ref) {
      return MercurAuthRepository(
        apiClient: ref.watch(apiClientProvider),
        tokenStorage: ref.watch(tokenStorageProvider),
      );
    });

final Provider<AiRepository> aiRepositoryProvider = Provider<AiRepository>((
  Ref ref,
) {
  return MercurAiRepository(apiClient: ref.watch(apiClientProvider));
});

final Provider<ImagePickerAdapter> imagePickerAdapterProvider =
    Provider<ImagePickerAdapter>((Ref ref) {
      return const DeviceImagePickerAdapter();
    });
