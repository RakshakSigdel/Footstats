import 'package:flutter/material.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';

class ProfileBanner extends StatelessWidget {

  final Player player;
  const ProfileBanner({super.key, required this.player});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(20),
      child: Stack(
        children: [
          Column(
            children: [
              Container(
                height: 100,
                width: double.infinity,
                color: Colors.blueGrey, // optional banner color
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 50, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "${player.firstName} ${player.lastName}",
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge,
                              ),
                              const SizedBox(height: 8),
                              Text("${player.location}"),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {},
                          child: const Text(
                            "Edit Profile",
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Tags
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if(player.gender.isNotEmpty)
                          Chip(label: Text('${player.gender}')),
                        if(player.age > 10)
                          Chip(label: Text("${player.age} Years Old")),
                      ],
                    ),
                    // const SizedBox(height: 16),
                    // const Divider(),
                    // const SizedBox(height: 8),
                  ],
                ),
              ),
            ],
          ),
          //Profile Picture
          Positioned(
            top: 50,
            left: 20,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                CircleAvatar(
                  radius: 35,
                  child: const Icon(Icons.person, size: 40),
                ),
                Positioned(
                  right: -4,
                  bottom: -4,
                  child: CircleAvatar(
                    radius: 12,
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      iconSize: 12,
                      onPressed: () {},
                      icon: const Icon(Icons.camera_alt),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
