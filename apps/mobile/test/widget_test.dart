import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_mobile/src/app.dart';
import 'package:tamadee_mobile/src/core/storage/local_prefs_storage.dart';
import 'package:tamadee_mobile/src/core/storage/token_storage.dart';
import 'package:tamadee_mobile/src/presentation/providers/core_providers.dart';
import 'package:tamadee_mobile/src/presentation/providers/theme_controller.dart';

import 'helpers/fake_cart_auth_repositories.dart';
import 'helpers/fake_repositories.dart';

Widget _buildTestApp(ProviderContainer container) {
  return UncontrolledProviderScope(
    container: container,
    child: const TamadeeMobileApp(useGoogleFonts: false),
  );
}

ProviderContainer _createTestContainer() {
  return ProviderContainer(
    overrides: [
      tokenStorageProvider.overrideWithValue(InMemoryTokenStorage()),
      prefsStorageProvider.overrideWithValue(InMemoryPrefsStorage()),
      catalogRepositoryProvider.overrideWithValue(FakeCatalogRepository()),
      cartRepositoryProvider.overrideWithValue(FakeCartRepository()),
      authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
    ],
  );
}

void main() {
  testWidgets(
    'completes Home -> Product Detail -> Buy Now -> Seller-grouped Cart flow',
    (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(390, 844));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final ProviderContainer container = _createTestContainer();
      addTearDown(container.dispose);

      await tester.pumpWidget(_buildTestApp(container));
      await tester.pumpAndSettle();

      expect(find.text('คอลเลกชันใหม่'), findsOneWidget);
      expect(find.text('สำหรับคุณ'), findsOneWidget);
      expect(find.text('เสื้อเชิ้ตลินิน'), findsOneWidget);
      expect(find.text('฿890'), findsOneWidget);

      await tester.tap(find.text('เสื้อเชิ้ตลินิน'));
      await tester.pumpAndSettle();

      expect(
        find.text('AI แนะนำไซซ์ M จากออเดอร์ก่อนหน้าของคุณ'),
        findsOneWidget,
      );
      expect(find.text('ลองด้วย AR'), findsOneWidget);
      expect(find.text('ละไม สตูดิโอ'), findsOneWidget);

      await tester.tap(find.text('ซื้อเลย'));
      await tester.pumpAndSettle();

      expect(find.text('ตะกร้า (1)'), findsOneWidget);
      expect(find.text('ละไม สตูดิโอ'), findsOneWidget);
      expect(find.text('ชำระเงิน ฿930'), findsOneWidget);
    },
  );

  testWidgets(
    'opens AI Assistant shell and toggles Light/Dark ThemeMode in Account',
    (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(390, 844));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final ProviderContainer container = _createTestContainer();
      addTearDown(container.dispose);

      await tester.pumpWidget(_buildTestApp(container));
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.auto_awesome));
      await tester.pumpAndSettle();

      expect(find.text('น้องทำมะดิ'), findsOneWidget);
      expect(
        find.text('หาชุดไปทะเลให้หน่อย งบไม่เกิน 2,500'),
        findsOneWidget,
      );
      expect(find.text('ใส่ตะกร้าทั้งชุด ฿2,480'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.arrow_back_ios_new_rounded));
      await tester.pumpAndSettle();

      await tester.tap(find.text('ฉัน'));
      await tester.pumpAndSettle();

      expect(find.text('บัญชีของฉัน'), findsOneWidget);
      await tester.tap(find.text('มืด'));
      await tester.pumpAndSettle();

      expect(container.read(themeControllerProvider), ThemeMode.dark);
    },
  );
}
