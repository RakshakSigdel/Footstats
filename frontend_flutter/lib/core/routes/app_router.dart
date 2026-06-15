import 'package:frontend_flutter/features/app/screens/settings_screen.dart';
import 'package:frontend_flutter/features/auth/screens/login_screen.dart';
import 'package:frontend_flutter/features/auth/screens/register_screen.dart';
import 'package:frontend_flutter/features/club/screens/clubs_screen.dart';
import 'package:frontend_flutter/features/player/screens/dashboard_screen.dart';
import 'package:frontend_flutter/features/schedule/screens/schedule_screen.dart';
import 'package:frontend_flutter/features/tournament/screens/tournaments_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:frontend_flutter/services/auth_service.dart';

import 'route_constants.dart';

class AppRouter {
  AppRouter._();

  static GoRouter createRouter({required AuthService authService}) {
    return GoRouter(
      initialLocation: RouteConstants.dashboard,
      refreshListenable: authService,

      redirect: (context, state) {
        final isLoggedIn = authService.isLoggedIn;
        final isGoingToLogin = state.matchedLocation == RouteConstants.login;

        if (!isLoggedIn && !isGoingToLogin) {
          return RouteConstants.login;
        }

        if (isLoggedIn && isGoingToLogin) {
          return RouteConstants.dashboard;
        }
        return null;
      },
      routes: [
        //Authentication Routes
        GoRoute(
          path: RouteConstants.login,
          name: 'login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: RouteConstants.register,
          name: 'register',
          builder: (context, state) => const RegisterScreen(),
        ),
        //User Routes
        GoRoute(
          path: RouteConstants.dashboard,
          name: 'dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: RouteConstants.settings,
          name: 'settings',
          builder: (context, state) => const SettingsScreen(),
        ),
        //Schedule Routes
        GoRoute(
          path: RouteConstants.schedules,
          name: 'schedules',
          builder: (context, state) => const ScheduleScreen(),
        ),
        //Club Routes
        GoRoute(
          path: RouteConstants.club,
          name: 'clubs',
          builder: (context, state) => const ClubsScreen(),
        ),
        //Tournamnets Route
        GoRoute(
          path: RouteConstants.tournament,
          name: 'tournaments',
          builder: (context, state) => const TournamentsScreen(),
        ),
      ],
    );
  }
}
