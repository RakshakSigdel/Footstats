import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/routes/app_router.dart';
import 'package:frontend_flutter/data/datasources/auth_service.dart';
import 'package:frontend_flutter/presentation/providers/player_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final authservice = AuthService();
  await authservice.getToken();

  final router = AppRouter.createRouter(authService: authservice);
  // runApp(
  //   ChangeNotifierProvider.value(
  //     value: authservice,
  //     child: MyApp(router: router),
  //   ),
  // );
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authservice),
        ChangeNotifierProvider(create: (_) => PlayerProvider()),
      ],
      child: MyApp(router: router),
    ),
  );
}

class MyApp extends StatelessWidget {
  final GoRouter router;
  const MyApp({super.key, required this.router});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Footstats',
      theme: ThemeData(colorScheme: .fromSeed(seedColor: Colors.deepPurple)),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
