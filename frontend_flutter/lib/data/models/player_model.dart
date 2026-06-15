class Player {
  final String userId;
  final String firstName;
  final String lastName;
  final String email;
  final DateTime dateOfBirth;
  final String gender;
  final String phone;
  final String location;
  final String locationLatitude;
  final String locationLongitude;
  final String locationPlaceId;
  final String profilephoto;
  final PlayerStatsOverall stats;

  Player({
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.dateOfBirth,
    required this.gender,
    required this.phone,
    required this.location,
    required this.locationLatitude,
    required this.locationLongitude,
    required this.locationPlaceId,
    required this.profilephoto,
    required this.stats,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      userId: json['userid'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      dateOfBirth: json['dateOfBirth'] as DateTime,
      gender: json['gender'] as String,
      phone: json['phone'] as String,
      location: json['location'] as String,
      locationLatitude: json['locationLatitute'] as String,
      locationLongitude: json['locationLongitude'] as String,
      locationPlaceId: json['locationPlaceId'] as String,
      profilephoto: json['profilephoto'] as String,
      stats: PlayerStatsOverall.fromJson(
        json['PlayerStatsOverall'] as Map<String, dynamic>,
      ),
    );
  }
}

class PlayerStatsOverall {
  final int matchesPlayed;
  final int goalsScored;
  final int assits;
  final int yellowCards;
  final int redCards;
  final int wins;
  final int draws;
  final int losses;
  final double winRate;

  PlayerStatsOverall({
    required this.matchesPlayed,
    required this.goalsScored,
    required this.assits,
    required this.yellowCards,
    required this.redCards,
    required this.wins,
    required this.draws,
    required this.losses,
    required this.winRate,
  });

  factory PlayerStatsOverall.fromJson(Map<String, dynamic> json) {
    return PlayerStatsOverall(
      matchesPlayed: json['matchesPlayed'] as int,
      goalsScored: json['goalsScored'] as int,
      assits: json['assits'] as int,
      yellowCards: json['yellowCards'] as int,
      redCards: json['redCards'] as int,
      wins: json['wins'] as int,
      draws: json['draws'] as int,
      losses: json['losses'] as int,
      winRate: json['winRate'] as double,
    );
  }
}

// class PlayerStatsClub {}

// class PlayerStatsTournament {}

// class PlayerAchievements {}
