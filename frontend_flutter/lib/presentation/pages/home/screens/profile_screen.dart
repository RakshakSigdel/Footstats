import 'package:flutter/material.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';
import 'package:frontend_flutter/presentation/providers/player_provider.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
  // final String name;

  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // @override
  // void initState() {
  //   super.initState();
  //   //Fetch only once when the screen starts
  //   WidgetsBinding.instance.addPostFrameCallback((_) {
  //     context.read<PlayerProvider>().fetchPlayerData();
  //   });
  // }

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerProvider>(
      builder: (context, playerProvider, child) {
        switch (playerProvider.profileStatus) {
          case LoadStatus.initial:
          case LoadStatus.loading:
            return const Center(child: CircularProgressIndicator());
          case LoadStatus.error:
            return Center(child: Text('Error: ${playerProvider.profileError}'));
          case LoadStatus.loaded:
            final player = playerProvider.player!;
            final stats = playerProvider.stats!;
            return Scaffold(
              appBar: AppBar(title: Text('Welcome, ${player.firstName}')),
              body: Center(
                child: Column(
                  children: [
                    Text("Banner Card"),
                    Text("Navigation Bar"),
                    Text("Personal Stats"),
                    PersonalInformationCard(player: player),
                  ],
                ),
              ),
              // body: PersonalInformationCard(player: player),
            );
        }
      },
    );
  }
}

//Details Tab -> Personal Information Section
class PersonalInformationCard extends StatelessWidget {
  final Player player;
  const PersonalInformationCard({super.key, required this.player});

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text("Personal Information"),
            Text("Full Name: ${player.firstName} ${player.lastName}"),
            Text("Age: ${player.age} Years Old"),
            Text("Date of Birth: ${player.formattedDob}"),
            Text("Gender: ${player.gender}"),
            Text("Location: ${player.location}"),
            Text("Preferred Foot: To be Implemented"),
            Text("Clubs: To be implemented"),
            Text("Member Since: To be Implemented"),
          ],
        ),
      ),
    );
  }
}
