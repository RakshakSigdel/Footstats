import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/routes/app_router.dart';
import 'package:frontend_flutter/core/routes/route_constants.dart';
import 'package:go_router/go_router.dart';

class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text("Footstats"),
      actions: [
        IconButton(
          onPressed: () {
            context.push(RouteConstants.profile);
          },
          icon: const Icon(Icons.person_outline),
        ),
        IconButton(
          onPressed: () {
            context.push(RouteConstants.notifications);
          },
          icon: const Icon(Icons.notifications_outlined),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
