//Available Services
//Get All Players:
//Get Player By ID:
//Update Player By ID:
//Delete Player By ID:
//Get My Profile: Implemented
//Get Players By Club ID:
//Get My Stats: Implemented
//Upload Profile Photo

import 'dart:convert';

import 'package:dio/dio.dart';

import 'package:frontend_flutter/core/network/dio_client.dart';
import 'package:frontend_flutter/data/models/player/player_stats_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';

class PlayerService {
  final Dio _dio = DioClient.instance;

  //Get My Profile
  Future<Player> getMyProfile() async {
    try {
      final response = await _dio.get('/players/me');
      return Player.fromJson(response.data['profile'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to fetch Profile: ${e.message}');
    }
  }

  //Get My Stats
  Future<PlayerStats> getMyStats() async {
    try {
      final response = await _dio.get('/players/me/stats');
      return PlayerStats.fromJson(response.data['stats'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to fetch stats: ${e.message}');
    }
  }
}
