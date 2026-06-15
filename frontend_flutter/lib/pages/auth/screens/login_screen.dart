import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/routes/route_constants.dart';
import 'package:frontend_flutter/core/services/auth_service.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // final authService = AuthService();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final authService = context.read<AuthService>();
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
                  context.go(RouteConstants.dashboard);
                  // Navigator.push(
                  //   context,
                  //   MaterialPageRoute(
                  //     builder: (context) => const DashboardScreen(),
                  //   ),
                  // );
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
                    context.push(RouteConstants.register);
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
