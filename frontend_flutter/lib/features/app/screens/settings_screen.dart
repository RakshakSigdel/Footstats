import 'package:flutter/material.dart';
import 'package:frontend_flutter/features/auth/screens/login_screen.dart';
import 'package:frontend_flutter/services/auth_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreen();
}

class _SettingsScreen extends State<SettingsScreen> {
  final _authService = AuthService();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            //Title and description of the page
            Column(
              children: [
                Text("Settings"),
                Text("Manage Your Account Preferences"),
              ],
            ),
            //Profile Column
            Column(
              children: [
                Text("Profile"),
                Text("First Name"),
                Text("Phone Number"),
                Text("Location"),
                ElevatedButton(onPressed: () {}, child: Text("Save Changes")),
              ],
            ),

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
    );
  }
}
