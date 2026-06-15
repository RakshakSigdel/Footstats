import 'package:flutter/material.dart';
import 'package:frontend_flutter/pages/home/widgets/app_top_bar.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: const AppTopBar());
  }
}
