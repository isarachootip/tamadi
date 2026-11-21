import 'dart:js_interop';

@JS('window.open')
external JSAny? _windowOpen(String url, String target, String features);

/// Opens [url] in a new browser tab on Flutter Web (`m.tamadee.online`).
bool openExternalUrl(String url) {
  _windowOpen(url, '_blank', 'noopener,noreferrer');
  return true;
}
