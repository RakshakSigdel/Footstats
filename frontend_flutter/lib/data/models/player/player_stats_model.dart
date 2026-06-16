class PlayerStats {
  final int userId;
  final String firstname;
  final String lastname;
  final String? profilePhoto;
  final int matchesplayed;
  final int goalsScored;
  final int assists;
  final int yellowCards;
  final int redCards;
  final int wins;
  final int draws;
  final int loses;
  final double winRate;

  PlayerStats({
    required this.userId,
    required this.firstname,
    required this.lastname,
    required this.profilePhoto,
    required this.matchesplayed,
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
    final s = json['stats'] as Map<String, dynamic>;

    return PlayerStats(
      userId: s['userId'],
      firstname: s['firstname'],
      lastname: s['lastname'],
      profilePhoto: s['profilePhoto'],
      matchesplayed: s['matchesplayed'],
      goalsScored: s['goalsScored'],
      assists: s['assists'],
      yellowCards: s['yellowCards'],
      redCards: s['redCards'],
      wins: s['wins'],
      draws: s['draws'],
      loses: s['loses'],
      winRate: s['winRate'],
    );
  }
}
