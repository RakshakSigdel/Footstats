import 'package:flutter/material.dart';
import 'package:frontend_flutter/features/auth/screens/login_screen.dart';
import 'package:frontend_flutter/services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final authService = AuthService();

  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final emailcontroller = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
    emailcontroller.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            const SizedBox(height: 24),
            TextField(
              controller: firstNameController,
              decoration: InputDecoration(
                labelText: "First Name",
                border: OutlineInputBorder(),
              ),
            ),
            TextField(
              controller: lastNameController,
              decoration: InputDecoration(
                labelText: "Last Name",
                border: OutlineInputBorder(),
              ),
            ),
            TextField(
              controller: emailcontroller,
              decoration: InputDecoration(
                labelText: "Email",
                border: OutlineInputBorder(),
              ),
            ),
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
                border: OutlineInputBorder(),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  final response = await authService.register(
                    firstName: firstNameController.text.trim(),
                    lastName: lastNameController.text.trim(),
                    email: emailcontroller.text.trim(),
                    password: passwordController.text,
                  );
                  debugPrint(
                    "Register response status: ${response.statusCode}",
                  );
                  debugPrint("Register response body: ${response.body}");

                  if (!mounted) return;
                  final messenger = ScaffoldMessenger.of(this.context);

                  if (response.statusCode == 200 ||
                      response.statusCode == 201) {
                    debugPrint("Account created successfully");
                    messenger.showSnackBar(
                      const SnackBar(
                        content: Text("Account created successfully"),
                      ),
                    );
                  } else {
                    debugPrint("Error while creating account");
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text("Registration failed: ${response.body}"),
                      ),
                    );
                  }
                } catch (error) {
                  debugPrint("Register request failed: $error");
                  if (!mounted) return;
                  final messenger = ScaffoldMessenger.of(this.context);
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text("Could not connect to server: $error"),
                    ),
                  );
                }
              },
              child: Text("Register"),
            ),
            Row(
              children: [
                Text("Already a Member?"),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const LoginScreen(),
                      ),
                    );
                  },
                  child: Text(" Login"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
