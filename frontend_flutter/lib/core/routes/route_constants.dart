class RouteConstants {
  RouteConstants._();

  //Auth Routes
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgotpassword';

  //User Routes
  static const String dashboard = '/dashboard';
  static const String settings = '/settings';

  //Player Routes
  // static const String dashboard = 'player/dashboard';

  //Club Routes
  static const String club = '/clubs';

  //Tournament Routes
  static const String tournament = '/tournaments';

  //Schedule Routes
  static const String schedules = '/schedules';
  static const String playerSchedule = '/player/:id/schedules';
  static const String clubSchedule = '/clubs/:id/schedules';
  static const String tournamentSchedule = '/tournamets/:id/schedules';
}
