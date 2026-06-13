import 'package:flutter/material.dart';
import 'package:frontend_flutter/features/app/screens/home_screen.dart';
import 'package:frontend_flutter/features/auth/screens/login_screen.dart';
import 'package:frontend_flutter/services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final authService = AuthService();
  final token = await authService.getToken();

  runApp(MyApp(isLoggedIn: token != null));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;
  const MyApp({super.key, required this.isLoggedIn});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(colorScheme: .fromSeed(seedColor: Colors.deepPurple)),
      home: isLoggedIn ? const HomeScreen() : const LoginScreen(),
    );
  }
}
