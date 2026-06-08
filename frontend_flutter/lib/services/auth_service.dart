import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String baseUrl = "http://192.168.18.49:5555/api";
  final storage = const FlutterSecureStorage();

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

    print("STATUS: ${response.statusCode}");
    print("BODY: ${response.body}");

    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data =
          jsonDecode(response.body) as Map<String, dynamic>;

      final String? token = data['token']?.toString();

      print("TOKEN: $token");

      if (token == null || token.isEmpty) {
        print("ERROR: Token missing in response");
        return null;
      }

      await storage.write(key: 'jwt', value: token);
      return token;
    }

    return null;
  }

  //Save Token
  Future<void> saveToken(String token) async {
    await storage.write(key: 'jwt', value: token);
  }

  //get token
  Future<String?> getToken() async {
    return await storage.read(key: 'jwt');
  }

  //logout - delete token
  Future<void> logout() async {
    await storage.delete(key: 'jwt');
  }
}
