import '../../core/network/json_parsers.dart';
import '../../domain/models/customer.dart';

abstract final class CustomerMapper {
  static CustomerProfile fromJson(JsonMap map) {
    final List<JsonMap> rawAddresses =
        JsonParsers.asJsonMapList(map['addresses'], context: 'addresses');
    return CustomerProfile(
      id: JsonParsers.readString(map, 'id'),
      email: JsonParsers.readString(map, 'email'),
      firstName: JsonParsers.readNullableString(map, 'first_name'),
      lastName: JsonParsers.readNullableString(map, 'last_name'),
      phone: JsonParsers.readNullableString(map, 'phone'),
      addresses: <CustomerAddress>[
        for (final JsonMap a in rawAddresses) toAddress(a),
      ],
    );
  }

  static CustomerAddress toAddress(JsonMap map) {
    return CustomerAddress(
      id: JsonParsers.readString(map, 'id'),
      firstName: JsonParsers.readString(map, 'first_name', fallback: ''),
      lastName: JsonParsers.readString(map, 'last_name', fallback: ''),
      address1: JsonParsers.readString(map, 'address_1', fallback: ''),
      city: JsonParsers.readString(map, 'city', fallback: ''),
      province: JsonParsers.readString(map, 'province', fallback: ''),
      postalCode: JsonParsers.readString(map, 'postal_code', fallback: ''),
      phone: JsonParsers.readString(map, 'phone', fallback: ''),
      addressName: JsonParsers.readNullableString(map, 'address_name'),
      isDefaultShipping: JsonParsers.readBool(map, 'is_default_shipping'),
    );
  }

  static OrderGroupSummary toOrderGroup(JsonMap map) {
    final List<JsonMap> orders = JsonParsers.asJsonMapList(map['orders']);
    int total = JsonParsers.readInt(map, 'total', fallback: 0);
    if (total == 0) {
      for (final JsonMap o in orders) {
        total += JsonParsers.readInt(o, 'total', fallback: 0);
      }
    }
    return OrderGroupSummary(
      id: JsonParsers.readString(map, 'id'),
      createdAt: JsonParsers.readString(map, 'created_at', fallback: ''),
      orderCount: orders.length,
      totalAmount: total,
    );
  }
}
