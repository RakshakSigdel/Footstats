import 'package:flutter/material.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';
import 'package:frontend_flutter/data/models/player/player_stats_model.dart';
import 'package:frontend_flutter/presentation/pages/home/widgets/player_individual_stat_card.dart';
import 'package:frontend_flutter/presentation/providers/player_provider.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
  // final String name;

  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
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

            final statsItems = <StatItem>[
              StatItem(
                label: "Matches Played",
                value: stats.matchesPlayed.toString(),
                icon: Icons.sports_football,
              ),
              StatItem(
                label: "Goals",
                value: stats.goalsScored.toString(),
                icon: Icons.sports_baseball,
              ),
              StatItem(
                label: "Assits",
                value: stats.assists.toString(),
                icon: Icons.people_outline,
              ),
              StatItem(
                label: "Win Rate",
                value: "${stats.winRate.toString()} %",
                icon: Icons.sports_football,
              ),
              StatItem(
                label: "Wins",
                value: stats.wins.toString(),
                icon: Icons.sports_football,
              ),
              StatItem(
                label: "Draws",
                value: stats.draws.toString(),
                icon: Icons.sports_football,
              ),
              StatItem(
                label: "Losses",
                value: stats.loses.toString(),
                icon: Icons.sports_football,
              ),
              StatItem(
                label: "Yellow Cards",
                value: stats.yellowCards.toString(),
                icon: Icons.sports_football,
              ),
            ];
            return Scaffold(
              appBar: AppBar(title: Text('Welcome, ${player.firstName}')),
              body: SingleChildScrollView(
                child: Column(
                  children: [
                    Text("Banner Card"),
                    Text("Navigation Bar"),
                    PlayerProfileStats(stats: statsItems),
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

//Details Tab -> Stats Cards
class StatItem {
  final String label;
  final String value;
  final IconData? icon;

  StatItem({required this.label, required this.value, this.icon});
}

class PlayerProfileStats extends StatelessWidget {
  final List<StatItem> stats;
  const PlayerProfileStats({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      itemCount: stats.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        // mainAxisSpacing: 0,
        childAspectRatio: 0.7,
      ),
      itemBuilder: (context, index) {
        final item = stats[index];
        return PlayerIndividualStatCard(
          icon: item.icon,
          value: item.value,
          label: item.label,
        );
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
