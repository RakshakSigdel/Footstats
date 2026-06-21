import 'package:dio/dio.dart';

String dioErrorHandler(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
      return ("Connection timeout ${e.message}");

    case DioExceptionType.connectionError:
      return ("No internet Connection");

    case DioExceptionType.badResponse:
      final statusCode = e.response?.statusCode;
      if (statusCode == 401) {
        return ('Session expired. Please log in again');
      }
      final data = e.response?.data;
      if (data is Map<String, dynamic> && data['message'] != null) {
        return data['message'].toString();
      }
      return ("server Error: $statusCode");

    // case (e.response != null)
    //   {
    //     final data = e.response!.data;
    //     if (data is Map<String, dynamic> && data['message'] != null) {
    //       return data['message'].toString();
    //     }
    //     return 'Request failed (${e.response?.statusCode})';
    //   }

    default:
      final data = e.response?.data;
      if (data is Map<String, dynamic> && data['message'] != null) {
        return data['message'].toString();
      }
      return ("Something went wrong ${e.message}");
  }
}
