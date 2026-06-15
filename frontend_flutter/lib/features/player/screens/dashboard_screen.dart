import 'package:flutter/material.dart';
import 'package:frontend_flutter/services/auth_service.dart';
import 'package:frontend_flutter/widget/global/app_bottom_nav.dart';
import 'package:frontend_flutter/widget/global/app_top_bar.dart';
import 'package:frontend_flutter/features/auth/screens/login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
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
