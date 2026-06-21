class PlayerStats {
  final int userId;
  final String firstname;
  final String lastname;
  final String? profilePhoto;
  final int matchesPlayed;
  final int goalsScored;
  final int assists;
  final int yellowCards;
  final int redCards;
  final int wins;
  final int draws;
  final int loses;
  final int winRate;

  PlayerStats({
    required this.userId,
    required this.firstname,
    required this.lastname,
    required this.profilePhoto,
    required this.matchesPlayed,
    required this.goalsScored,
    required this.assists,
    required this.yellowCards,
    required this.redCards,
    required this.wins,
    required this.draws,
    required this.loses,
    required this.winRate,
  });

  factory PlayerStats.fromJson(Map<String, dynamic> json) {
    return PlayerStats(
      userId: json['userId'],
      firstname: json['firstName'],
      lastname: json['lastName'],
      profilePhoto: json['profilePhoto'],
      matchesPlayed: json['matchesPlayed'],
      goalsScored: json['goalsScored'],
      assists: json['assists'],
      yellowCards: json['yellowCards'],
      redCards: json['redCards'],
      wins: json['wins'],
      draws: json['draws'],
      loses: json['losses'],
      winRate: json['winRate'],
    );
  }
}
