import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/widgets/app_top_bar.dart';
import 'package:frontend_flutter/presentation/pages/club/screens/browse_clubs_screen.dart';
import 'package:frontend_flutter/presentation/pages/club/screens/my_clubs_screen.dart';
import 'package:frontend_flutter/presentation/pages/club/widgets/club_screen_header.dart';
import 'package:frontend_flutter/presentation/pages/club/widgets/club_tab_bar.dart';

class ClubsScreen extends StatelessWidget {
  const ClubsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppTopBar(),
        body: Column(
          children: [
            //Text("Top Part"),
            ClubScreenHeader(),
            ClubTabBar(),
            Expanded(
              child: TabBarView(
                children: [MyClubsScreen(), BrowseClubsScreen()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
