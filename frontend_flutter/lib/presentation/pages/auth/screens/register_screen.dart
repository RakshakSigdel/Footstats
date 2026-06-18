import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/routes/route_constants.dart';
import 'package:frontend_flutter/core/theme/app_theme.dart';
import 'package:frontend_flutter/data/datasources/auth_service.dart';
import 'package:go_router/go_router.dart';

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
  bool _obscurePassword = true;

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
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppGradients.background,
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.l),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppSpacing.verticalL,

                  // App Branding Header
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.m),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            blurRadius: 24,
                            spreadRadius: 4,
                          )
                        ],
                      ),
                      child: const Icon(
                        Icons.sports_soccer,
                        size: 56,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  AppSpacing.verticalM,
                  const Text(
                    "FOOTSTATS",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4.0,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  AppSpacing.verticalXXL,

                  // Register Info
                  const Text(
                    "Create Account",
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  AppSpacing.verticalXS,
                  const Text(
                    "Join Footstats to track stats, matches, and more",
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  
                  AppSpacing.verticalXL,

                  // First & Last Name side-by-side
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: firstNameController,
                          textInputAction: TextInputAction.next,
                          style: const TextStyle(color: AppColors.textPrimary),
                          decoration: const InputDecoration(
                            labelText: "First Name",
                            prefixIcon: Icon(
                              Icons.person_outline,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                      AppSpacing.horizontalM,
                      Expanded(
                        child: TextField(
                          controller: lastNameController,
                          textInputAction: TextInputAction.next,
                          style: const TextStyle(color: AppColors.textPrimary),
                          decoration: const InputDecoration(
                            labelText: "Last Name",
                            prefixIcon: Icon(
                              Icons.person_outline,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  AppSpacing.verticalM,

                  // Email Field
                  TextField(
                    controller: emailcontroller,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      labelText: "Email Address",
                      prefixIcon: Icon(
                        Icons.email_outlined,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),

                  AppSpacing.verticalM,

                  // Password Field
                  TextField(
                    controller: passwordController,
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.done,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      labelText: "Password",
                      prefixIcon: const Icon(
                        Icons.lock_outline,
                        color: AppColors.textSecondary,
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword 
                              ? Icons.visibility_off_outlined 
                              : Icons.visibility_outlined,
                          color: AppColors.textSecondary,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                  ),

                  AppSpacing.verticalXL,

                  // Register Button
                  GestureDetector(
                    onTap: () async {
                      final response = await authService.register(
                        firstName: firstNameController.text,
                        lastName: lastNameController.text,
                        email: emailcontroller.text,
                        password: passwordController.text,
                      );
                      if (response.statusCode == 200 || response.statusCode == 201) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Registered Successfully"),
                              duration: Duration(seconds: 2),
                              backgroundColor: AppColors.success,
                            ),
                          );
                          context.go(RouteConstants.login);
                        }
                      } else {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Error during registration"),
                              duration: Duration(seconds: 2),
                              backgroundColor: AppColors.error,
                            ),
                          );
                        }
                        debugPrint(
                          "*************************************************************************Error while creating account",
                        );
                        debugPrint(response.body);
                      }
                    },
                    child: Container(
                      height: 54,
                      decoration: BoxDecoration(
                        gradient: AppGradients.buttonPrimary,
                        borderRadius: AppBorderRadius.radiusM,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          "REGISTER",
                          style: TextStyle(
                            color: Color(0xFF0B0D0F),
                            fontSize: 16.0,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                    ),
                  ),

                  AppSpacing.verticalXXL,

                  // Footer - Go to Login
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Already a Member?",
                        style: TextStyle(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          context.go(RouteConstants.login);
                        },
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: AppSpacing.xs),
                          child: Text(
                            "Login",
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  AppSpacing.verticalL,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
