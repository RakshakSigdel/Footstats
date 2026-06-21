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
      userId: json['userId'] ?? 0,
      firstName: json['firstName'] ?? 'Player First Name',
      lastName: json['lastName'] ?? 'Player Last Name',
      email: json['email'] ?? 'Player Email',
      dateOfBirth: json['dateOfBirth'] ?? 'Player Date of Birth',
      gender: json['gender'] ?? 'Player Gender',
      phone: json['Phone'] ?? 'Player Phone Number',
      location: json['location'] ?? 'Player Location',
      locationLatitude: (json['locationLatitude'] as num).toDouble() ?? 0.00,
      locationLongitude: (json['locationLongitude'] as num).toDouble() ?? 0.00,
      locationPlaceId: json['locationPlaceId'] ?? 'Player Place ID',
      profilephoto: json['profilePhoto'] ?? 'Player Profile Photo',
    );
  }
}
