import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/config/app_config.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/navigation/external_link_opener_stub.dart'
    if (dart.library.js_interop) '../../../core/navigation/external_link_opener_web.dart';
import '../../providers/core_providers.dart';
import '../../providers/locale_controller.dart';

class BackofficePortalSection extends ConsumerWidget {
  const BackofficePortalSection({super.key});

  Future<void> _openPortal(
    BuildContext context,
    String url,
    String copiedMessage,
  ) async {
    final bool opened = openExternalUrl(url);
    if (opened) {
      return;
    }
    await Clipboard.setData(ClipboardData(text: url));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$copiedMessage\n$url')),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppConfig cfg = ref.watch(appConfigProvider);
    final AppStrings strings = ref.watch(appStringsProvider);
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg =
        isDark ? TamadeeColors.surfaceDark : TamadeeColors.surfaceMuted;

    final String sellerUrl = '${cfg.apiBaseUrl}/seller';
    final String adminUrl = '${cfg.apiBaseUrl}/dashboard';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Divider(height: 32),
        Text(
          strings.backofficeHeading,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        _PortalTile(
          cardBg: cardBg,
          icon: Icons.storefront_outlined,
          title: strings.sellerLoginTitle,
          subtitle: strings.sellerLoginSub,
          onTap: () => _openPortal(
            context,
            sellerUrl,
            strings.linkCopiedFallback,
          ),
        ),
        const SizedBox(height: 10),
        _PortalTile(
          cardBg: cardBg,
          icon: Icons.admin_panel_settings_outlined,
          title: strings.adminLoginTitle,
          subtitle: strings.adminLoginSub,
          onTap: () => _openPortal(
            context,
            adminUrl,
            strings.linkCopiedFallback,
          ),
        ),
      ],
    );
  }
}

class _PortalTile extends StatelessWidget {
  const _PortalTile({
    required this.cardBg,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final Color cardBg;
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: cardBg,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        leading: Icon(icon),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.open_in_new_rounded, size: 18),
        onTap: onTap,
      ),
    );
  }
}
