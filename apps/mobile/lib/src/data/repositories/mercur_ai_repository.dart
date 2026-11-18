import '../../core/network/api_client.dart';
import '../../core/network/json_parsers.dart';
import '../../domain/models/ai_chat.dart';
import '../../domain/repositories/ai_repository.dart';

class MercurAiRepository implements AiRepository {
  const MercurAiRepository({required this.apiClient});

  final ApiClient apiClient;

  static List<AiRecommendedProduct> _parseProducts(Object? rawList) {
    final List<JsonMap> rawProducts = JsonParsers.asJsonMapList(
      rawList,
      context: 'products',
    );
    return <AiRecommendedProduct>[
      for (final JsonMap p in rawProducts)
        AiRecommendedProduct(
          id: JsonParsers.readString(p, 'id'),
          title: JsonParsers.readString(p, 'title'),
          handle: JsonParsers.readString(p, 'handle', fallback: ''),
          priceAmount: JsonParsers.readInt(p, 'priceAmount', fallback: 0),
          offerId: JsonParsers.readString(p, 'offerId'),
          variantId: JsonParsers.readString(p, 'variantId', fallback: ''),
          variantTitle: JsonParsers.readString(
            p,
            'variantTitle',
            fallback: 'มาตรฐาน',
          ),
          sellerId: JsonParsers.readString(p, 'sellerId'),
          sellerName: JsonParsers.readString(p, 'sellerName'),
          thumbnail: JsonParsers.readNullableString(p, 'thumbnail'),
        ),
    ];
  }

  @override
  Future<AiChatResult> askAssistant({
    required String message,
    List<AiHistoryTurn> history = const <AiHistoryTurn>[],
  }) async {
    final JsonMap json = await apiClient.post(
      '/store/ai/chat',
      body: <String, Object?>{
        'message': message.trim(),
        'history': <Map<String, Object?>>[
          for (final AiHistoryTurn turn in history) turn.toJson(),
        ],
      },
    );

    final Object? rawBudget = json['budgetThb'];
    return AiChatResult(
      reply: JsonParsers.readString(json, 'reply'),
      source: JsonParsers.readString(
        json,
        'source',
        fallback: 'catalog-fallback',
      ),
      budgetThb: rawBudget is num ? rawBudget.round() : null,
      products: _parseProducts(json['products']),
    );
  }

  @override
  Future<VisualSearchResult> searchByImage({
    required String imageBase64,
    required String mimeType,
    String? hint,
  }) async {
    final String trimmedHint = (hint ?? '').trim();
    final JsonMap json = await apiClient.post(
      '/store/ai/visual-search',
      body: <String, Object?>{
        'imageBase64': imageBase64,
        'mimeType': mimeType,
        if (trimmedHint.isNotEmpty) 'hint': trimmedHint,
      },
    );

    final Object? rawKeywords = json['keywords'];
    final List<String> keywords = <String>[
      if (rawKeywords is List<Object?>)
        for (final Object? kw in rawKeywords)
          if (kw is String && kw.trim().isNotEmpty) kw.trim(),
    ];

    return VisualSearchResult(
      detectedSummary: JsonParsers.readString(json, 'detectedSummary'),
      keywords: keywords,
      source: JsonParsers.readString(
        json,
        'source',
        fallback: 'catalog-fallback',
      ),
      products: _parseProducts(json['products']),
    );
  }
}
