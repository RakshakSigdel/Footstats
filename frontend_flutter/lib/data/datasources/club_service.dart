//Available Services
//Create Club:
//Get My clubs: /clubs/me
//Get All Clubs:
//Get Club By ID:
//Update Club:
//Delete Club:
//Get Club Members:
//Add Club Members:
//Remove Club Member:
//Update Member Role:
//Get Admin Clubs:
//Search Clubs:
//Leave Club:
//Upload Club logo:

import 'package:dio/dio.dart';
import 'package:frontend_flutter/core/network/dio_client.dart';
import 'package:frontend_flutter/data/models/club_model.dart';

class ClubService {
  final Dio _dio = DioClient.instance;

  //Get My Clubs
  Future<Club> getMyClubs() async {
    try {
      final response = await _dio.get('/clubs/me');
      return Club.fromJson(response.data['clubs'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to fetch Clubs');
    }
  }
}
