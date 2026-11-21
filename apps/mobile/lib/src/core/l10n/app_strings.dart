import 'package:flutter/foundation.dart';

import 'app_locale.dart';
import 'app_strings_data.dart';

@immutable
class AppStrings {
  const AppStrings({
    required this.navHome,
    required this.navCategories,
    required this.navWishlist,
    required this.navMe,
    required this.searchHint,
    required this.newDropSub,
    required this.shopNow,
    required this.forYou,
    required this.aiPicks,
    required this.viewAll,
    required this.emptyCategory,
    required this.productDetailsHeading,
    required this.addToCart,
    required this.addedShort,
    required this.buyNow,
    required this.cartTitlePrefix,
    required this.emptyCart,
    required this.browseProducts,
    required this.payPrefix,
    required this.accountTitle,
    required this.welcomeTitle,
    required this.welcomeSub,
    required this.signIn,
    required this.register,
    required this.addressesPrefix,
    required this.signOut,
    required this.langHeading,
    required this.themeHeading,
    required this.themeLight,
    required this.themeDark,
    required this.themeSystem,
    required this.ordersHeading,
    required this.noOrders,
    required this.backofficeHeading,
    required this.sellerLoginTitle,
    required this.sellerLoginSub,
    required this.adminLoginTitle,
    required this.adminLoginSub,
    required this.linkCopiedFallback,
    required this.aiName,
    required this.aiSamplePrompt,
    required this.aiThinking,
    required this.aiInputHint,
    required this.aiSuggestions,
  });

  final String navHome;
  final String navCategories;
  final String navWishlist;
  final String navMe;
  final String searchHint;
  final String newDropSub;
  final String shopNow;
  final String forYou;
  final String aiPicks;
  final String viewAll;
  final String emptyCategory;
  final String productDetailsHeading;
  final String addToCart;
  final String addedShort;
  final String buyNow;
  final String cartTitlePrefix;
  final String emptyCart;
  final String browseProducts;
  final String payPrefix;
  final String accountTitle;
  final String welcomeTitle;
  final String welcomeSub;
  final String signIn;
  final String register;
  final String addressesPrefix;
  final String signOut;
  final String langHeading;
  final String themeHeading;
  final String themeLight;
  final String themeDark;
  final String themeSystem;
  final String ordersHeading;
  final String noOrders;
  final String backofficeHeading;
  final String sellerLoginTitle;
  final String sellerLoginSub;
  final String adminLoginTitle;
  final String adminLoginSub;
  final String linkCopiedFallback;
  final String aiName;
  final String aiSamplePrompt;
  final String aiThinking;
  final String aiInputHint;
  final List<String> aiSuggestions;

  static AppStrings of(AppLocale locale) {
    return switch (locale) {
      AppLocale.th => appStringsTh,
      AppLocale.en => appStringsEn,
      AppLocale.zh => appStringsZh,
    };
  }
}
