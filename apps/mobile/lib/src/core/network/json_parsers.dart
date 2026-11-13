typedef JsonMap = Map<String, Object?>;

/// Strict runtime JSON validators enforcing schema safety at API boundaries.
abstract final class JsonParsers {
  static JsonMap asJsonMap(Object? raw, {String context = 'root'}) {
    if (raw is Map<Object?, Object?>) {
      final JsonMap result = <String, Object?>{};
      for (final MapEntry<Object?, Object?> entry in raw.entries) {
        final Object? key = entry.key;
        if (key is! String) {
          throw FormatException('Non-string key in JSON map at $context');
        }
        result[key] = entry.value;
      }
      return result;
    }
    throw FormatException('Expected JSON object at $context, got ${raw.runtimeType}');
  }

  static List<JsonMap> asJsonMapList(Object? raw, {String context = 'list'}) {
    if (raw == null) {
      return const <JsonMap>[];
    }
    if (raw is List<Object?>) {
      return <JsonMap>[
        for (int i = 0; i < raw.length; i++)
          asJsonMap(raw[i], context: '$context[$i]'),
      ];
    }
    throw FormatException('Expected JSON list at $context, got ${raw.runtimeType}');
  }

  static JsonMap? readNullableMap(JsonMap map, String key) {
    final Object? value = map[key];
    if (value == null) {
      return null;
    }
    return asJsonMap(value, context: key);
  }

  static String readString(JsonMap map, String key, {String? fallback}) {
    final Object? value = map[key];
    if (value is String) {
      return value;
    }
    if (value == null && fallback != null) {
      return fallback;
    }
    throw FormatException('Expected String at "$key", got ${value.runtimeType}');
  }

  static String? readNullableString(JsonMap map, String key) {
    final Object? value = map[key];
    if (value == null) {
      return null;
    }
    if (value is String) {
      final String trimmed = value.trim();
      return trimmed.isEmpty ? null : trimmed;
    }
    throw FormatException('Expected String? at "$key", got ${value.runtimeType}');
  }

  static num readNum(JsonMap map, String key, {num? fallback}) {
    final Object? value = map[key];
    if (value is num) {
      return value;
    }
    if (value is String) {
      final num? parsed = num.tryParse(value);
      if (parsed != null) {
        return parsed;
      }
    }
    if (value == null && fallback != null) {
      return fallback;
    }
    throw FormatException('Expected num at "$key", got ${value.runtimeType}');
  }

  static int readInt(JsonMap map, String key, {int? fallback}) {
    return readNum(map, key, fallback: fallback).round();
  }

  static bool readBool(JsonMap map, String key, {bool fallback = false}) {
    final Object? value = map[key];
    if (value == null) {
      return fallback;
    }
    if (value is bool) {
      return value;
    }
    throw FormatException('Expected bool at "$key", got ${value.runtimeType}');
  }
}
