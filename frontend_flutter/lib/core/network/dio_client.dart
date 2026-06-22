import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  DioClient._();

  static const String baseUrl = "http://192.168.1.10:5555/api";
  static final _storage = const FlutterSecureStorage();

  static Dio? _dio;

  //Singelton pattern
  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {"content-type": "application/json"},
      ),
    );

    //Adding interceptors
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          //Automatically attach JWT token to every request
          final token = await _storage.read(key: 'jwt');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },

        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException error, handler) {
          print("DIO Error: ${error.requestOptions}");
          print("Message: ${error.message}");
          return handler.next(error);
        },
      ),
    );
    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
    return dio;
  }
}
