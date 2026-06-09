import 'package:flutter/material.dart';
import 'package:frontend_flutter/widget/global/app_bottom_nav.dart';
import 'package:frontend_flutter/widget/global/app_top_bar..dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: const Center(child: Text("Home Page")),
      bottomNavigationBar: BottomNavBar(),
    );
  }
}
