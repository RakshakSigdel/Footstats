import 'package:flutter/material.dart';

class ProfileBanner extends StatelessWidget {
  const ProfileBanner({super.key});

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
                                "Rakshak Sigdel",
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge,
                              ),
                              const SizedBox(height: 8),
                              const Text("Sundarharaicha-04"),
                              const Text("Sundarharaicha, Morang"),
                              const Text("Koshi Province, Nepal"),
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
                      children: const [
                        Chip(label: Text("Male")),
                        Chip(label: Text("Right Foot")),
                        Chip(label: Text("20 Years Old")),
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
