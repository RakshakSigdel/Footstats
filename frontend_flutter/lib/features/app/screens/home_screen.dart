import 'package:flutter/material.dart';
import 'package:frontend_flutter/services/auth_service.dart';
import 'package:frontend_flutter/widget/global/app_bottom_nav.dart';
import 'package:frontend_flutter/widget/global/app_top_bar.dart';
import 'package:frontend_flutter/features/auth/screens/login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _authService = AuthService();

  int selectedIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: Center(
        child: Column(
          children: [
            //Logout Button
            ElevatedButton(
              onPressed: () {
                _authService.logout();
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              },
              child: Text("Logout"),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavBar(),
    );
  }
}
