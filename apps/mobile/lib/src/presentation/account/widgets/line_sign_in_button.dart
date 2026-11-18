import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../../../core/config/app_config.dart';
import '../../providers/core_providers.dart';

class LineSignInButton extends ConsumerWidget {
  const LineSignInButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SizedBox(
      height: 50,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF06C755),
          foregroundColor: Colors.white,
        ),
        onPressed: () async {
          final AppConfig cfg = ref.read(appConfigProvider);
          final String returnTo = Uri.encodeComponent(
            '${cfg.siteUrl}/account/line-callback',
          );
          final String lineUrl =
              '${cfg.apiBaseUrl}/auth/line/start?return_to=$returnTo';
          await Clipboard.setData(ClipboardData(text: lineUrl));
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'คัดลอกลิงก์เข้าสู่ระบบด้วย LINE แล้ว เปิดในเบราว์เซอร์หรือแอป LINE ได้ทันที',
                ),
              ),
            );
          }
        },
        icon: const Icon(Icons.chat_bubble_rounded, size: 18),
        label: const Text(
          'เข้าสู่ระบบด้วย LINE (รับแจ้งเตือนพัสดุ)',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}
