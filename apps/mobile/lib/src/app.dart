import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import 'presentation/providers/theme_controller.dart';
import 'presentation/router/app_router.dart';
import 'presentation/shell/mobile_frame_wrapper.dart';

class TamadeeMobileApp extends ConsumerWidget {
  const TamadeeMobileApp({
    super.key,
    this.useGoogleFonts = true,
  });

  final bool useGoogleFonts;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ThemeMode themeMode = ref.watch(themeControllerProvider);
    final GoRouter router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Tamadee ทำมาดี ทำมาขาย',
      debugShowCheckedModeBanner: false,
      theme: TamadeeTheme.light(useGoogleFonts: useGoogleFonts),
      darkTheme: TamadeeTheme.dark(useGoogleFonts: useGoogleFonts),
      themeMode: themeMode,
      routerConfig: router,
      builder: (BuildContext context, Widget? child) {
        return MobileFrameWrapper(
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
