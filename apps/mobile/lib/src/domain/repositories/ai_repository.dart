import '../models/ai_chat.dart';

abstract interface class AiRepository {
  Future<AiChatResult> askAssistant({
    required String message,
    List<AiHistoryTurn> history = const <AiHistoryTurn>[],
  });
}
