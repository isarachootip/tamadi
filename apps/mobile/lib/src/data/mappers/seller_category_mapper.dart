import '../../core/network/json_parsers.dart';
import '../../domain/models/category.dart';
import '../../domain/models/seller.dart';

abstract final class SellerCategoryMapper {
  static ProductCategory toCategory(JsonMap map) {
    return ProductCategory(
      id: JsonParsers.readString(map, 'id'),
      name: JsonParsers.readString(map, 'name'),
      handle: JsonParsers.readString(map, 'handle', fallback: ''),
      description: JsonParsers.readNullableString(map, 'description'),
      rank: JsonParsers.readInt(map, 'rank', fallback: 0),
    );
  }

  static SellerSummary toSeller(JsonMap map) {
    return SellerSummary(
      id: JsonParsers.readString(map, 'id'),
      name: JsonParsers.readString(map, 'name', fallback: 'ร้านค้าทำมาดี'),
      handle: JsonParsers.readString(map, 'handle', fallback: ''),
      description: JsonParsers.readNullableString(map, 'description'),
      logo: JsonParsers.readNullableString(map, 'logo'),
      banner: JsonParsers.readNullableString(map, 'banner'),
      isPremium: JsonParsers.readBool(map, 'is_premium'),
      leadtimeDays: map['default_leadtime_to_ship'] == null
          ? null
          : JsonParsers.readInt(map, 'default_leadtime_to_ship'),
    );
  }
}
