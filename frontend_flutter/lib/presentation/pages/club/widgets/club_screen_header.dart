//Used in clubs_screen.dart
//My clubs                          Create Club Button
//Join or create football clubs
//Search Bar
import 'package:flutter/material.dart';

class ClubScreenHeader extends StatelessWidget {
  const ClubScreenHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("My Clubs"),
                    Text("Join or create football clubs"),
                  ],
                ),
              ),
              ElevatedButton(onPressed: () {}, child: Text("Create Club")),
            ],
          ),
          SizedBox(height: 24),
          SizedBox(
            width: 450,
            child: TextField(
              decoration: InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: "Search clubs by name, location...",
              ),
            ),
          ),
        ],
      ),
    );
  }
}
