import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/theme/app_theme.dart';
import 'package:frontend_flutter/core/widgets/app_top_bar.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/profile_achievements_screen.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/profile_clubs_screen.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/profile_details_Screen.dart';
import 'package:frontend_flutter/presentation/pages/home/screens/profile_matches_screen.dart';
import 'package:frontend_flutter/presentation/pages/home/widgets/player_individual_stat_card.dart';
import 'package:frontend_flutter/presentation/pages/home/widgets/profile_banner.dart';
import 'package:frontend_flutter/presentation/providers/player_provider.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
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
                icon: Icons.sports_soccer,
              ),
              StatItem(
                label: "Goals",
                value: stats.goalsScored.toString(),
                icon: Icons.sports_soccer,
              ),
              StatItem(
                label: "Assists",
                value: stats.assists.toString(),
                icon: Icons.handshake_outlined,
              ),
              StatItem(
                label: "Win Rate",
                value: "${stats.winRate.toString()} %",
                icon: Icons.analytics_outlined,
              ),
              StatItem(
                label: "Wins",
                value: stats.wins.toString(),
                icon: Icons.emoji_events_outlined,
              ),
              StatItem(
                label: "Draws",
                value: stats.draws.toString(),
                icon: Icons.compare_arrows_outlined,
              ),
              StatItem(
                label: "Losses",
                value: stats.loses.toString(),
                icon: Icons.trending_down_outlined,
              ),
              StatItem(
                label: "Yellow Cards",
                value: stats.yellowCards.toString(),
                icon: Icons.crop_portrait_outlined,
              ),
            ];
            return DefaultTabController(
              length: 4,
              child: Scaffold(
                appBar: AppTopBar(),
                body: NestedScrollView(
                  headerSliverBuilder: (context, innerBoxIsScrolled) {
                    return [
                      SliverToBoxAdapter(child: ProfileBanner()),

                      SliverPersistentHeader(
                        pinned: true,
                        delegate: _SliverTabBarDelegate(
                          TabBar(
                            tabs: [
                              Tab(text: "Details"),
                              Tab(text: "Clubs"),
                              Tab(text: "Matches"),
                              Tab(text: "Achievements"),
                            ],
                          ),
                        ),
                      ),
                    ];
                  },
                  //Tab Content
                  body: TabBarView(
                    children: [
                      ProfileDetailsScreen(stats: statsItems, player: player),
                      ProfileClubsScreen(),
                      ProfileMatchesScreen(),
                      ProfileAchievementsScreen(),
                    ],
                  ),
                  // children: [
                  //   ProfileBanner(),
                  //   ProfileTabBar(),
                  //   Expanded(
                  //     child: TabBarView(
                  //       children: [
                  //         ProfileDetailsScreen(stats: statsItems, player: player),
                  //         ProfileClubsScreen(),
                  //         ProfileMatchesScreen(),
                  //         ProfileAchievementsScreen(),
                  //       ],
                  //     ),
                  //   ),
                  // ],
                ),
              ),
            );
        }
      },
    );
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;

  _SliverTabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
       // important for overlap fix
      color: AppColors.background,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return false;
  }
}
