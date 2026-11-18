import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/l10n/app_strings.dart';
import '../../providers/locale_controller.dart';
import '../../shared/language_pill_selector.dart';

class AiAssistantAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const AiAssistantAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppStrings strings = ref.watch(appStringsProvider);

    return AppBar(
      backgroundColor: TamadeeColors.ink,
      surfaceTintColor: Colors.transparent,
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_ios_new_rounded,
          size: 18,
          color: TamadeeColors.white,
        ),
        onPressed: () => context.canPop() ? context.pop() : context.go('/'),
      ),
      titleSpacing: 0,
      title: Row(
        children: <Widget>[
          const NongTammadiMascotWidget(size: 34, brightness: Brightness.dark),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  strings.aiName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: TamadeeColors.white,
                  ),
                ),
                const Text(
                  'Gemini AI • Live Thai Catalog',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: TamadeeColors.textMutedDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: const <Widget>[
        Padding(
          padding: EdgeInsets.only(right: 12),
          child: LanguagePillSelector(compact: true),
        ),
      ],
    );
  }
}

class AiChatBubble extends StatelessWidget {
  const AiChatBubble({
    super.key,
    required this.isUser,
    required this.text,
  });

  final bool isUser;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 300),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? TamadeeColors.lime : const Color(0xFF1E1E1B),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isUser ? TamadeeColors.ink : TamadeeColors.white,
            fontWeight: isUser ? FontWeight.w700 : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class AiBottomInputBar extends ConsumerWidget {
  const AiBottomInputBar({
    super.key,
    required this.controller,
    required this.onSend,
    required this.onPickImage,
  });

  final TextEditingController controller;
  final ValueChanged<String> onSend;
  final VoidCallback onPickImage;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppStrings strings = ref.watch(appStringsProvider);

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
        child: Container(
          padding: const EdgeInsets.only(left: 8, right: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1B),
            borderRadius: TamadeeLayout.pillBorderRadius,
            border: Border.all(color: TamadeeColors.borderDark),
          ),
          child: Row(
            children: <Widget>[
              IconButton(
                tooltip: 'Visual Search',
                onPressed: onPickImage,
                icon: const Icon(
                  Icons.camera_alt_outlined,
                  color: TamadeeColors.lime,
                ),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  style: const TextStyle(color: TamadeeColors.white),
                  onSubmitted: onSend,
                  decoration: InputDecoration(
                    hintText: strings.aiInputHint,
                    hintStyle: const TextStyle(
                      color: TamadeeColors.textMutedDark,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
              InkWell(
                onTap: () => onSend(
                  controller.text.isEmpty
                      ? strings.aiSuggestions.first
                      : controller.text,
                ),
                customBorder: const CircleBorder(),
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: const BoxDecoration(
                    color: TamadeeColors.lime,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.send_rounded,
                    size: 18,
                    color: TamadeeColors.ink,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
