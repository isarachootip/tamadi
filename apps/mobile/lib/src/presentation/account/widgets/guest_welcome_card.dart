import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/l10n/app_strings.dart';
import '../../providers/locale_controller.dart';

class GuestWelcomeCard extends ConsumerWidget {
  const GuestWelcomeCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppStrings strings = ref.watch(appStringsProvider);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: TamadeeColors.ink,
        borderRadius: TamadeeLayout.cardBorderRadius,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            strings.welcomeTitle,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: TamadeeColors.white,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            strings.welcomeSub,
            style: const TextStyle(fontSize: 13, color: Color(0xFFC8C8C0)),
          ),
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              Expanded(
                child: ElevatedButton(
                  onPressed: () => context.push('/auth/login'),
                  child: Text(strings.signIn),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push('/auth/register'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: TamadeeColors.white,
                    side: const BorderSide(color: TamadeeColors.white),
                  ),
                  child: Text(strings.register),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
