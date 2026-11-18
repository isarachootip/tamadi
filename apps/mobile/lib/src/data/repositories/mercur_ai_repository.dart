import '../../core/network/api_client.dart';
import '../../core/network/json_parsers.dart';
import '../../domain/models/ai_chat.dart';
import '../../domain/repositories/ai_repository.dart';

class MercurAiRepository implements AiRepository {
  const MercurAiRepository({required this.apiClient});

  final ApiClient apiClient;

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

    final String reply = JsonParsers.readString(json, 'reply');
    final String source = JsonParsers.readString(
      json,
      'source',
      fallback: 'catalog-fallback',
    );
    final Object? rawBudget = json['budgetThb'];
    final int? budgetThb =
        rawBudget is num ? rawBudget.round() : null;

    final List<JsonMap> rawProducts = JsonParsers.asJsonMapList(
      json['products'],
      context: 'products',
    );

    final List<AiRecommendedProduct> products = <AiRecommendedProduct>[
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

    return AiChatResult(
      reply: reply,
      source: source,
      budgetThb: budgetThb,
      products: products,
    );
  }
}
