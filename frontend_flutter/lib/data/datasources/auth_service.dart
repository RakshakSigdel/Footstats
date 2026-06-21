import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/network/api_result.dart';
import 'package:frontend_flutter/core/network/dio_client.dart';
import 'package:frontend_flutter/data/helper/dio_error_handler.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService extends ChangeNotifier {
  String? _token;

  String? get token => _token;

  bool get isLoggedIn => _token != null;
  final _storage = const FlutterSecureStorage();
  final Dio _dio = DioClient.instance;

  //Register
  Future<ApiResult<String>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {
          "firstName": firstName,
          "lastName": lastName,
          "email": email,
          "password": password,
        },
      );
      final data = response.data as Map<String, dynamic>?;
      final message = data?['message']?.toString() ?? 'Registration Successful';
      return ApiResult.success(message);
    } on DioException catch (e) {
      return ApiResult.failure(dioErrorHandler(e));
    }
  }

  //Login
  // Future<String?> login({
  //   required String email,
  //   required String password,
  // }) async {
  //   try {
  //     final response = await _dio.post(
  //       '/auth/login',
  //       data: {"email": email, "password": password},
  //     );
  //     final data = response.data as Map<String, dynamic>;
  //     return data['token']?.toString();
  //   } on DioException catch (e) {
  //     return DioErrorHandler(e);
  //   }
  // }
  Future<ApiResult<String>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {"email": email, "password": password},
      );
      final data = response.data as Map<String, dynamic>;
      final token = data['token']?.toString();
      if (token == null || token.isEmpty) {
        return ApiResult.failure('No token received from the server');
      }
      await _storage.write(key: 'jwt', value: token);
      _token = token;
      notifyListeners();
      return ApiResult.success(token);
    }
    on DioException catch (e) {
      return ApiResult.failure(dioErrorHandler(e));
    }

  }

  //   //logout - delete token
  Future<void> logout() async {
    await _storage.delete(key: 'jwt');
    _token = null;
    notifyListeners();
  }
}
