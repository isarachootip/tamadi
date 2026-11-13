import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../account/account_screen.dart';
import '../account/addresses_screen.dart';
import '../account/login_screen.dart';
import '../account/register_screen.dart';
import '../ai_assistant/ai_assistant_screen.dart';
import '../cart/cart_screen.dart';
import '../catalog/categories_screen.dart';
import '../catalog/product_list_screen.dart';
import '../home/home_screen.dart';
import '../product/product_detail_screen.dart';
import '../seller/seller_store_screen.dart';
import '../shell/mobile_shell_scaffold.dart';
import '../wishlist/wishlist_screen.dart';

final GlobalKey<NavigatorState> _rootNavKey = GlobalKey<NavigatorState>();

final Provider<GoRouter> appRouterProvider = Provider<GoRouter>((Ref ref) {
  return GoRouter(
    navigatorKey: _rootNavKey,
    initialLocation: '/',
    routes: <RouteBase>[
      StatefulShellRoute.indexedStack(
        builder: (
          BuildContext context,
          GoRouterState state,
          StatefulNavigationShell navigationShell,
        ) {
          return MobileShellScaffold(navigationShell: navigationShell);
        },
        branches: <StatefulShellBranch>[
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/',
                builder: (BuildContext context, GoRouterState state) =>
                    const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/categories',
                builder: (BuildContext context, GoRouterState state) =>
                    const CategoriesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/wishlist',
                builder: (BuildContext context, GoRouterState state) =>
                    const WishlistScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/account',
                builder: (BuildContext context, GoRouterState state) =>
                    const AccountScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/search',
        builder: (BuildContext context, GoRouterState state) =>
            const ProductListScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/products/:id',
        builder: (BuildContext context, GoRouterState state) =>
            ProductDetailScreen(productId: state.pathParameters['id'] ?? ''),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/sellers/:id',
        builder: (BuildContext context, GoRouterState state) =>
            SellerStoreScreen(sellerId: state.pathParameters['id'] ?? ''),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/cart',
        builder: (BuildContext context, GoRouterState state) =>
            const CartScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/ai-assistant',
        builder: (BuildContext context, GoRouterState state) =>
            const AiAssistantScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/auth/login',
        builder: (BuildContext context, GoRouterState state) =>
            const LoginScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/auth/register',
        builder: (BuildContext context, GoRouterState state) =>
            const RegisterScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavKey,
        path: '/account/addresses',
        builder: (BuildContext context, GoRouterState state) =>
            const AddressesScreen(),
      ),
    ],
  );
});
