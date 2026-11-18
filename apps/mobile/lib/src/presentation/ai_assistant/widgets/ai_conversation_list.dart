import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:tamadee_flutter_ui/tamadee_flutter_ui.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../domain/models/ai_chat.dart';
import '../../providers/locale_controller.dart';
import 'ai_input_bar.dart';
import 'ai_outfit_preview_card.dart';
import 'ai_product_card_tile.dart';

@immutable
class AiConversationTurn {
  const AiConversationTurn({
    required this.isUser,
    required this.text,
    this.products = const <AiRecommendedProduct>[],
  });

  final bool isUser;
  final String text;
  final List<AiRecommendedProduct> products;
}

class AiConversationList extends ConsumerWidget {
  const AiConversationList({
    super.key,
    required this.scrollController,
    required this.turns,
    required this.sending,
    required this.suggestions,
    required this.onSelectSuggestion,
  });

  final ScrollController scrollController;
  final List<AiConversationTurn> turns;
  final bool sending;
  final List<String> suggestions;
  final ValueChanged<String> onSelectSuggestion;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AppStrings strings = ref.watch(appStringsProvider);

    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      children: <Widget>[
        AiChatBubble(isUser: true, text: strings.aiSamplePrompt),
        AiOutfitPreviewCard(onBrowseSet: () => context.push('/products')),
        for (final AiConversationTurn turn in turns) ...<Widget>[
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: AiChatBubble(isUser: turn.isUser, text: turn.text),
          ),
          for (final AiRecommendedProduct item in turn.products)
            AiProductCardTile(product: item),
        ],
        if (sending)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: AiChatBubble(isUser: false, text: strings.aiThinking),
          ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: <Widget>[
            for (final String chip in suggestions)
              ActionChip(
                backgroundColor: const Color(0xFF1C1C1A),
                side: const BorderSide(color: TamadeeColors.borderDark),
                label: Text(
                  chip,
                  style: const TextStyle(color: TamadeeColors.white),
                ),
                onPressed: sending ? null : () => onSelectSuggestion(chip),
              ),
          ],
        ),
      ],
    );
  }
}
