import 'package:flutter/material.dart';
import 'package:frontend_flutter/presentation/providers/player_provider.dart';
import 'package:provider/provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    //Fetch only once when the screen starts
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PlayerProvider>().fetchPlayerData();
    });
  }

  //   @override
  //   Widget build(BuildContext context) {
  //     return Consumer<PlayerProvider>(
  //       builder: (context, playerProvider, child) {
  //         switch (playerProvider.statsStatus) {
  //           case LoadStatus.initial:
  //           case LoadStatus.loading:
  //             return const Center(child: CircularProgressIndicator());
  //           case LoadStatus.error:
  //             return Center(child: Text('Error: ${playerProvider.profileError}'));
  //           case LoadStatus.loaded:
  //             final player = playerProvider.player!;
  //             // print("Player Provider: ${playerProvider.player}");
  //             final stats = playerProvider.stats!;
  //             // print("Stats Provider ${playerProvider.stats}");
  //             return Scaffold(
  //               appBar: AppBar(title: Text('Welcome, ${player.firstName}')),
  //               body: Center(
  //                 child: Column(
  //                   children: [
  //                     Text("Welcome Back, ${player.firstName}"),
  //                     Text("Total Goals: ${stats.goalsScored}"),
  //                     Text("Personal Stats"),
  //                     // PersonalInformationCard(player: player),
  //                   ],
  //                 ),
  //               ),
  //               // body: PersonalInformationCard(player: player),
  //             );
  //         }
  //       },
  //     );
  //   }
  // }

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (provider.hasError) {
          return Scaffold(
            body: Center(
              child: ElevatedButton(
                onPressed: () => provider.fetchPlayerData(),
                child: const Text("Retry"),
              ),
            ),
          );
        }

        final player = provider.player!;
        final stats = provider.stats!;

        return Scaffold(
          body: Center(
            child: Column(
              children: [
                Text("Welcome Back, ${player.firstName}"),
                Text("Total Goals ${stats.goalsScored}"),
              ],
            ),
          ),
        );
      },
    );
  }
}
