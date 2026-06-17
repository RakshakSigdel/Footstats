import 'package:flutter/material.dart';
import 'package:frontend_flutter/presentation/pages/home/widgets/app_top_bar.dart';
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

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerProvider>(
      builder: (context, provider, _) {
        if (!provider.isFullyLoaded) {
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
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final player = provider.player!;
        final stats = provider.stats!;

        return Scaffold(
          appBar: AppTopBar(),
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
