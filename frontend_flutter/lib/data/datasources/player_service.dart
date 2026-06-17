import 'dart:convert';

import 'package:frontend_flutter/data/models/player/player_stats_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';

class PlayerService {
  static const String baseUrl = "http://192.168.1.5:5555/api";
  final _storage = const FlutterSecureStorage();
  //Single Auth Header for all the methods
  Future<Map<String, String>> _authHeaders() async {
    final token = await _storage.read(key: 'jwt');
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${token}",
    };
  }

  //Get My Profile
  Future<Player> getMyProfile() async {
    final response = await http.get(
      Uri.parse("$baseUrl/players/me"),
      headers: await _authHeaders(),
    );

    // print("Status: ${response.statusCode}");
    // print("Response: ${response.body}");

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      return Player.fromJson(json['profile'] as Map<String, dynamic>);
    } else {
      throw Exception('Failed to load Profile');
    }
  }

  //get My stats
  Future<PlayerStats> getMyStats() async {
    final response = await http.get(
      Uri.parse("$baseUrl/players/me/stats"),
      headers: await _authHeaders(),
    );
    // print("Status: ${response.statusCode}");
    // print("Response: ${response.body}");

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      return PlayerStats.fromJson(json['stats'] as Map<String, dynamic>);
    } else {
      throw Exception("Error_Player_service: Failed to Load player stats");
    }
  }
}
