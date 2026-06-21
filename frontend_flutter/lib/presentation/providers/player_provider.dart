import 'package:flutter/material.dart';
import 'package:frontend_flutter/data/datasources/player_service.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';
import 'package:frontend_flutter/data/models/player/player_stats_model.dart';

enum LoadStatus { initial, loading, loaded, error }

class PlayerProvider extends ChangeNotifier {
  final PlayerService _service = PlayerService();

  //Profile State
  Player? _player;
  LoadStatus _profileStatus = LoadStatus.initial;
  String? _profileError;

  Player? get player => _player;
  LoadStatus get profileStatus => _profileStatus;
  String? get profileError => _profileError;

  //Stats State
  PlayerStats? _stats;
  LoadStatus _statsStatus = LoadStatus.initial;
  String? _statsError;

  PlayerStats? get stats => _stats;
  LoadStatus get statsStatus => _statsStatus;
  String? get statsError => _statsError;

  bool get isFullyLoaded =>
      _profileStatus == LoadStatus.loaded && _statsStatus == LoadStatus.loaded;

  bool get isLoading =>
      _profileStatus == LoadStatus.loading ||
      _statsStatus == LoadStatus.loading;

  bool get hasError =>
      _profileStatus == LoadStatus.error || _statsStatus == LoadStatus.error;
  String? get combinedError => _profileError ?? _statsError;

  Future<void> fetchPlayerData() async {
    //Skip if data is already loaded
    if (isFullyLoaded || isLoading) {
      return;
    }
    //Set the status to loading as the data starts to get fetched
    _profileStatus = LoadStatus.loading;
    _statsStatus = LoadStatus.loading;
    notifyListeners();

    //Fetch the data (Fetch both profile and stats at once)
    await Future.wait([
      _service
          .getMyProfile()
          .then((value) {
            _player = value;
            _profileStatus = LoadStatus.loaded;
          })
          .catchError((e) {
            print('Profile Error: ${e}');
            _profileError = e.toString();
            _profileStatus = LoadStatus.error;
          }),
      _service
          .getMyStats()
          .then((value) {
            _stats = value;
            _statsStatus = LoadStatus.loaded;
          })
          .catchError((e) {
            print('Stats Error: ${e}');
            _statsError = e.toString();
            _statsStatus = LoadStatus.error;
          }),
    ]);
    notifyListeners();
  }

  void clear() {
    _player = null;
    _stats = null;
    _profileStatus = LoadStatus.initial;
    _statsStatus = LoadStatus.initial;
    _profileError = null;
    _statsError = null;
    notifyListeners();
  }
}
