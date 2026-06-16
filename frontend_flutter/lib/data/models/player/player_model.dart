class Player {
  final int userId;
  final String firstName;
  final String lastName;
  final String email;
  final String dateOfBirth;
  final String gender;
  final String phone;
  final String location;
  final double locationLatitude;
  final double locationLongitude;
  final String locationPlaceId;
  final String profilephoto;
  //final PlayerStatsOverall stats;

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
  });

  DateTime get dobDate => DateTime.parse(dateOfBirth); //From string to datetime
  String get formattedDob =>
      "${dobDate.year}-"
      "${dobDate.month.toString().padLeft(2, '0')}-"
      "${dobDate.day.toString().padLeft(2, '0')}";

  int get age {
    final today = DateTime.now();
    int age = today.year - dobDate.year;

    if (today.month < dobDate.month ||
        (today.month == dobDate.month && today.day < dobDate.day)) {
      age--;
    }

    return age;
  }

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      userId: json['userId'] ?? 'User Id',
      firstName: json['firstName'] ?? 'Player Name',
      lastName: json['lastName'],
      email: json['email'],
      dateOfBirth: json['dateOfBirth'],
      gender: json['gender'],
      phone: json['Phone'],
      location: json['location'],
      locationLatitude: (json['locationLatitude'] as num).toDouble(),
      locationLongitude: (json['locationLongitude'] as num).toDouble(),
      locationPlaceId: json['locationPlaceId'],
      profilephoto: json['profilePhoto'],
    );
  }
}
