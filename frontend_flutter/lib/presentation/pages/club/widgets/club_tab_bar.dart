import 'package:flutter/material.dart';

class ClubTabBar extends StatelessWidget implements PreferredSizeWidget {
  const ClubTabBar({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      child: TabBar(
        tabs: const [
          Tab(text: 'My Clubs'),
          Tab(text: 'Browse'),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(56);
}
