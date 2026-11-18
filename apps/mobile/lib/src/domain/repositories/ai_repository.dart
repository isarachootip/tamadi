import '../../core/l10n/app_locale.dart';
import '../models/ai_chat.dart';

abstract interface class AiRepository {
  Future<AiChatResult> askAssistant({
    required String message,
    List<AiHistoryTurn> history = const <AiHistoryTurn>[],
    AppLocale locale = AppLocale.th,
  });

  Future<VisualSearchResult> searchByImage({
    required String imageBase64,
    required String mimeType,
    String? hint,
    AppLocale locale = AppLocale.th,
  });
}
