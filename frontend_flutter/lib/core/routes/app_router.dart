import 'package:frontend_flutter/core/widgets/scaffold_with_nav_bar.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/notification_screen.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/profile_screen.dart';
import 'package:frontend_flutter/presentation/pages/settings/screens/settings_screen.dart';
import 'package:frontend_flutter/presentation/pages/auth/screens/login_screen.dart';
import 'package:frontend_flutter/presentation/pages/auth/screens/register_screen.dart';
import 'package:frontend_flutter/presentation/pages/club/screens/clubs_screen.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/dashboard_screen.dart';
import 'package:frontend_flutter/presentation/pages/schedule/screens/schedule_screen.dart';
import 'package:frontend_flutter/presentation/pages/tournament/screens/tournaments_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:frontend_flutter/data/datasources/auth_service.dart';

import 'route_constants.dart';

//statefulshellroute
//branch 0: Home tab/dashboard
//branch 1: Schedules tab
//branch 2: clubs tab
//branch 3: tournaments tab
//branch 4: settings tab

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
        //THe shell: Wrapping five main navigation points in bottom navbar
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) {
            return ScaffoldWithNavBar(
              currentIndex: navigationShell.currentIndex,
              onTap: (index) => navigationShell.goBranch(
                index,
                initialLocation: index == navigationShell.currentIndex,
              ),
              child: navigationShell,
            );
          },
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RouteConstants.dashboard,
                  name: 'dashboard',
                  builder: (context, state) => const DashboardScreen(),
                ),
                GoRoute(
                  path: RouteConstants.profile,
                  name: 'profile',
                  builder: (context, state) => const ProfileScreen(),
                ),
                GoRoute(
                  path: RouteConstants.notifications,
                  name: 'notifications',
                  builder: (context, state) => const NotificationScreen(),
                ),
              ],
            ),

            //Schedule Routes
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RouteConstants.schedules,
                  name: 'schedules',
                  builder: (context, state) => const ScheduleScreen(),
                ),
              ],
            ),
            //Club Routes
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RouteConstants.club,
                  name: 'clubs',
                  builder: (context, state) => const ClubsScreen(),
                ),
              ],
            ),

            StatefulShellBranch(
              routes: [
                //Tournamnets Route
                GoRoute(
                  path: RouteConstants.tournament,
                  name: 'tournaments',
                  builder: (context, state) => const TournamentsScreen(),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RouteConstants.settings,
                  name: 'settings',
                  builder: (context, state) => const SettingsScreen(),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
