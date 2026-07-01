import 'package:flutter/material.dart';

class ProfileTabBar extends StatelessWidget implements PreferredSizeWidget {
  const ProfileTabBar({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      child: TabBar(
        tabs: const [
          Tab(text: 'Details'),
          Tab(text: 'Clubs'),
          Tab(text: 'Matches'),
          Tab(text: 'Achievements'),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(56);
}
