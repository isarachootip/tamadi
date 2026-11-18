import 'package:flutter/foundation.dart';

@immutable
class AiHistoryTurn {
  const AiHistoryTurn({
    required this.role,
    required this.content,
  });

  final String role;
  final String content;

  Map<String, Object?> toJson() => <String, Object?>{
        'role': role,
        'content': content,
      };
}

@immutable
class AiRecommendedProduct {
  const AiRecommendedProduct({
    required this.id,
    required this.title,
    required this.handle,
    required this.priceAmount,
    required this.offerId,
    required this.variantId,
    required this.variantTitle,
    required this.sellerId,
    required this.sellerName,
    this.thumbnail,
  });

  final String id;
  final String title;
  final String handle;
  final int priceAmount;
  final String offerId;
  final String variantId;
  final String variantTitle;
  final String sellerId;
  final String sellerName;
  final String? thumbnail;
}

@immutable
class AiChatResult {
  const AiChatResult({
    required this.reply,
    required this.source,
    required this.products,
    this.budgetThb,
  });

  final String reply;
  final String source;
  final List<AiRecommendedProduct> products;
  final int? budgetThb;
}

@immutable
class VisualSearchResult {
  const VisualSearchResult({
    required this.detectedSummary,
    required this.keywords,
    required this.source,
    required this.products,
  });

  final String detectedSummary;
  final List<String> keywords;
  final String source;
  final List<AiRecommendedProduct> products;
}
