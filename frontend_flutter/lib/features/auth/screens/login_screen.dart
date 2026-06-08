import 'package:flutter/material.dart';
import 'package:frontend_flutter/features/app/screens/home_screen.dart';
import 'package:frontend_flutter/features/auth/screens/register_screen.dart';
import 'package:frontend_flutter/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final authService = AuthService();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            const SizedBox(height: 24),
            //EMAIL FIELD
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                labelText: "Email",
                border: OutlineInputBorder(),
              ),
            ),
            //Password FIELD
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: "Password",
                border: OutlineInputBorder(),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                final token = await authService.login(
                  email: emailController.text,
                  password: passwordController.text,
                );
                if (token != null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Logged in Successfully"),
                      duration: Duration(seconds: 2),
                    ),
                  );
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const HomeScreen()),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Error during login"),
                      duration: Duration(seconds: 2),
                    ),
                  );
                }
              },
              child: const Text("login"),
            ),

            Row(
              children: [
                Text("Don't Have an account?"),
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const RegisterScreen(),
                      ),
                    );
                  },
                  child: Text(" Register Here"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
