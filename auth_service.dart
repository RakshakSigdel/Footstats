import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AuthService {
  static String get baseUrl {
    const fromEnv = String.fromEnvironment('API_BASE_URL');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (kIsWeb) return "http://localhost:5555/api";
    if (defaultTargetPlatform == TargetPlatform.android) {
      return "http://192.168.18.49/api";
    }
    return "http://localhost:5555/api";
  }

  Future<http.Response> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    return http.post(
      Uri.parse("$baseUrl/auth/register"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": password,
      }),
    );
  }

  Future<http.Response> login({
    required String email,
    required String password,
  }) async {
    return http.post(
      Uri.parse("$baseUrl/auth/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );
  }
}
