import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService extends ChangeNotifier {
  String? _token;

  String? get token => _token;
  bool get isLoggedIn => _token != null;
  static const String baseUrl = "http://192.168.1.5:5555/api";
  final _storage = const FlutterSecureStorage();

  //Register
  Future<http.Response> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    return await http.post(
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

  //Login
  Future<String?> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/auth/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data =
          jsonDecode(response.body) as Map<String, dynamic>;

      final String? token = data['token']?.toString();

      if (token == null || token.isEmpty) {
        return null;
      }

      await _storage.write(key: 'jwt', value: token);
      _token = token;
      notifyListeners();
      return token;
    }

    return null;
  }

  //get token
  Future<String?> getToken() async {
    final storedToken = await _storage.read(key: 'jwt');
    _token = storedToken;
    return storedToken;
  }

  //logout - delete token
  Future<void> logout() async {
    await _storage.delete(key: 'jwt');
    _token = null;
    notifyListeners();
  }
}
