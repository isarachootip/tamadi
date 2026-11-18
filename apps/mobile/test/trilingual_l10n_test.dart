import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_mobile/src/app.dart';
import 'package:tamadee_mobile/src/core/formatters/thb_formatter.dart';
import 'package:tamadee_mobile/src/core/l10n/app_locale.dart';
import 'package:tamadee_mobile/src/core/l10n/catalog_data_en.dart';
import 'package:tamadee_mobile/src/core/l10n/catalog_data_zh.dart';
import 'package:tamadee_mobile/src/core/l10n/catalog_localizer.dart';
import 'package:tamadee_mobile/src/core/storage/local_prefs_storage.dart';
import 'package:tamadee_mobile/src/core/storage/token_storage.dart';
import 'package:tamadee_mobile/src/domain/models/category.dart';
import 'package:tamadee_mobile/src/presentation/providers/core_providers.dart';
import 'package:tamadee_mobile/src/presentation/providers/locale_controller.dart';

import 'helpers/fake_cart_auth_repositories.dart';
import 'helpers/fake_repositories.dart';

void main() {
  test('formats THB and tourist reference rates for TH / EN / ZH', () {
    expect(AppLocale.fromCode(null), AppLocale.th);
    expect(AppLocale.fromCode('en-US'), AppLocale.en);
    expect(AppLocale.fromCode('zh-CN'), AppLocale.zh);

    expect(ThbFormatter.formatByLocale(890, AppLocale.th), '฿890');
    expect(ThbFormatter.formatByLocale(890, AppLocale.en), '฿890 (~\$26)');
    expect(ThbFormatter.formatByLocale(890, AppLocale.zh), '฿890 (~¥185)');

    expect(productEnByHandle.length, greaterThanOrEqualTo(30));
    expect(productZhByHandle.length, greaterThanOrEqualTo(30));

    const ProductCategory rawCat = ProductCategory(
      id: 'c1',
      name: 'ของใช้/งานคราฟต์',
      handle: 'crafts',
    );
    expect(
      CatalogLocalizer.localizeCategory(rawCat, AppLocale.en).name,
      'Home & Crafts',
    );
    expect(
      CatalogLocalizer.localizeCategory(rawCat, AppLocale.zh).name,
      '家居与手作',
    );
  });

  testWidgets('switches live between TH, EN, and 中文 on HomeScreen', (
    WidgetTester tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    final InMemoryPrefsStorage prefs = InMemoryPrefsStorage();
    final ProviderContainer container = ProviderContainer(
      overrides: [
        tokenStorageProvider.overrideWithValue(InMemoryTokenStorage()),
        prefsStorageProvider.overrideWithValue(prefs),
        catalogRepositoryProvider.overrideWithValue(FakeCatalogRepository()),
        cartRepositoryProvider.overrideWithValue(FakeCartRepository()),
        authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
        aiRepositoryProvider.overrideWithValue(FakeAiRepository()),
        imagePickerAdapterProvider.overrideWithValue(FakeImagePickerAdapter()),
      ],
    );
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const TamadeeMobileApp(useGoogleFonts: false),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('เสื้อเชิ้ตลินิน'), findsOneWidget);
    expect(find.text('฿890'), findsOneWidget);

    await tester.tap(find.text('EN'));
    await tester.pumpAndSettle();

    expect(container.read(localeControllerProvider), AppLocale.en);
    expect(await prefs.readLocale(), AppLocale.en);
    expect(find.text('Thai Creator Drop'), findsOneWidget);
    expect(find.text('Clothing'), findsOneWidget);
    expect(find.text('Relaxed Pure Linen Shirt'), findsOneWidget);
    expect(find.text('฿890 (~\$26)'), findsOneWidget);

    await tester.tap(find.text('中文'));
    await tester.pumpAndSettle();

    expect(container.read(localeControllerProvider), AppLocale.zh);
    expect(await prefs.readLocale(), AppLocale.zh);
    expect(find.text('泰国匠人新品'), findsOneWidget);
    expect(find.text('服饰'), findsOneWidget);
    expect(find.text('宽松纯亚麻衬衫'), findsOneWidget);
    expect(find.text('฿890 (~¥185)'), findsOneWidget);
  });
}
