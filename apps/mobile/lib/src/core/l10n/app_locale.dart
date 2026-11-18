enum AppLocale {
  th('th', 'TH'),
  en('en', 'EN'),
  zh('zh', '中文');

  const AppLocale(this.code, this.shortLabel);

  final String code;
  final String shortLabel;

  static AppLocale fromCode(String? raw) {
    final String clean = (raw ?? '').trim().toLowerCase();
    if (clean == 'en' || clean.startsWith('en-')) {
      return AppLocale.en;
    }
    if (clean == 'zh' || clean.startsWith('zh-')) {
      return AppLocale.zh;
    }
    return AppLocale.th;
  }
}
