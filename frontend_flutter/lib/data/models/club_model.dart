class Club {
  final int clubId;
  final String name;
  final String description;
  final String? logo;
  final String location;
  final double? locationLatitude;
  final double? locationLongitude;
  final String? locationPlaceId;
  final DateTime foundedDate;
  final int createdBy;
  final String userRole;

  Club({
    required this.clubId,
    required this.name,
    required this.description,
    this.logo,
    required this.location,
    this.locationLatitude,
    this.locationLongitude,
    this.locationPlaceId,
    required this.foundedDate,
    required this.createdBy,
    required this.userRole,
  });

  factory Club.fromJson(Map<String,dynamic> json){
    return Club(
      clubId: json['clubId'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      logo: json['logo'] ?? '',
      location: json['location'] ?? '',
      locationLatitude: (json['locationLatitude'] as num).toDouble() ?? 0.00,
      locationLongitude: (json['locationLongitude'] as num).toDouble() ?? 0.00,
      locationPlaceId: json['locationPlaceId'] ?? '',
      foundedDate: DateTime.parse(json['foundedDate'] ?? ''),
      createdBy: json['createdBy'] ?? 0,
      userRole: json['userRole'] ?? '',
    );
  }
}
