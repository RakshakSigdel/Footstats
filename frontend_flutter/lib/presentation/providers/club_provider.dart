import 'package:flutter/cupertino.dart';
import 'package:frontend_flutter/data/datasources/club_service.dart';
import 'package:frontend_flutter/data/models/club_model.dart';

enum LoadStatus { initial, loading, loaded, error }

class ClubProvider extends ChangeNotifier {
  final ClubService _service = ClubService();

  Club? _club;
  LoadStatus _clubStatus = LoadStatus.initial;
  String? _clubError;

  Club? get club => _club;

  LoadStatus get clubStatus => _clubStatus;

  String? get clubError => _clubError;

  bool get isFullyLoaded => _clubStatus == LoadStatus.loaded;

  bool get isLoading => _clubStatus == LoadStatus.loading;

  //bool get isLoading => _clubStatus == LoadStatus.loading;
  bool get hasError => _clubStatus == LoadStatus.error;

  Future<void> fetchClubData() async {
    if (isFullyLoaded || isLoading) {
      return;
    }

    await Future.wait([
      _service
          .getMyClubs()
          .then((value) {
            _club = value;
            _clubStatus = LoadStatus.loaded;
          })
          .catchError((e) {
            print('Profile Error: ${e}');
            _clubError = e.toString();
            _clubStatus = LoadStatus.error;
          }),
    ]);
    notifyListeners();
  }
  Future<void> refreshMyClubs() async {
    _clubStatus = LoadStatus.initial;
    await fetchClubData();
  }

  void clear() {
    _club = null;
    _clubStatus = LoadStatus.initial;
    _clubError = null;
  }
}
