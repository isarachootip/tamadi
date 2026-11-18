import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../core/formatters/thb_formatter.dart';
import '../../core/l10n/app_locale.dart';
import '../../core/l10n/app_strings.dart';
import '../../domain/models/customer.dart';
import '../providers/auth_controller.dart';
import '../providers/locale_controller.dart';
import '../providers/theme_controller.dart';
import '../shared/language_pill_selector.dart';
import 'widgets/guest_welcome_card.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<CustomerProfile?> authAsync = ref.watch(
      authControllerProvider,
    );
    final AsyncValue<List<OrderGroupSummary>> ordersAsync = ref.watch(
      orderGroupsProvider,
    );
    final ThemeMode themeMode = ref.watch(themeControllerProvider);
    final AppLocale locale = ref.watch(localeControllerProvider);
    final AppStrings strings = ref.watch(appStringsProvider);
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: <Widget>[
          Text(
            strings.accountTitle,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 14),
          authAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (Object err, StackTrace _) => Text('$err'),
            data: (CustomerProfile? customer) {
              if (customer == null) {
                return const GuestWelcomeCard();
              }
              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      customer.displayName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(customer.email),
                    const SizedBox(height: 12),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.location_on_outlined),
                      title: Text(
                        '${strings.addressesPrefix} (${customer.addresses.length})',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => context.push('/account/addresses'),
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () =>
                            ref.read(authControllerProvider.notifier).logout(),
                        icon: const Icon(Icons.logout_rounded, size: 18),
                        label: Text(strings.signOut),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          Text(
            strings.langHeading,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          const Align(
            alignment: Alignment.centerLeft,
            child: LanguagePillSelector(compact: false),
          ),
          const SizedBox(height: 20),
          Text(
            strings.themeHeading,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          SegmentedButton<ThemeMode>(
            segments: <ButtonSegment<ThemeMode>>[
              ButtonSegment<ThemeMode>(
                value: ThemeMode.light,
                icon: const Icon(Icons.light_mode_outlined),
                label: Text(strings.themeLight),
              ),
              ButtonSegment<ThemeMode>(
                value: ThemeMode.dark,
                icon: const Icon(Icons.dark_mode_outlined),
                label: Text(strings.themeDark),
              ),
              ButtonSegment<ThemeMode>(
                value: ThemeMode.system,
                icon: const Icon(Icons.brightness_auto_outlined),
                label: Text(strings.themeSystem),
              ),
            ],
            selected: <ThemeMode>{themeMode},
            onSelectionChanged: (Set<ThemeMode> selection) {
              ref
                  .read(themeControllerProvider.notifier)
                  .setThemeMode(selection.first);
            },
          ),
          const SizedBox(height: 22),
          Text(
            strings.ordersHeading,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          ordersAsync.maybeWhen(
            data: (List<OrderGroupSummary> groups) {
              if (groups.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(strings.noOrders),
                );
              }
              return Column(
                children: <Widget>[
                  for (final OrderGroupSummary g in groups)
                    ListTile(
                      tileColor: cardBg,
                      title: Text('#${g.id}'),
                      trailing: Text(
                        ThbFormatter.formatByLocale(g.totalAmount, locale),
                      ),
                    ),
                ],
              );
            },
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}
