import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/theme/app_theme.dart';
import 'package:frontend_flutter/data/models/player/player_model.dart';
import 'package:frontend_flutter/presentation/pages/home/widgets/player_individual_stat_card.dart';

// Details Tab -> Stats Cards
class StatItem {
  final String label;
  final String value;
  final IconData? icon;

  StatItem({required this.label, required this.value, this.icon});
}

class ProfileDetailsScreen extends StatelessWidget {
  final List<StatItem> stats;
  final Player player;

  const ProfileDetailsScreen({
    super.key,
    required this.stats,
    required this.player,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.m),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Label
          const Row(
            children: [
              Icon(Icons.bar_chart, color: AppColors.primary, size: 18),
              AppSpacing.horizontalS,
              Text(
                "PERFORMANCE STATS",
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          AppSpacing.verticalM,
          
          // Stats Grid
          GridView.builder(
            itemCount: stats.length,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: AppSpacing.m,
              mainAxisSpacing: AppSpacing.m,
              childAspectRatio: 0.85,
            ),
            itemBuilder: (context, index) {
              final item = stats[index];
              return PlayerIndividualStatCard(
                icon: item.icon,
                value: item.value,
                label: item.label,
              );
            },
          ),
          AppSpacing.verticalL,
          
          // Personal Information Section
          PersonalInformationCard(player: player),
          AppSpacing.verticalL,
        ],
      ),
    );
  }
}

// Details Tab -> Personal Information Section
class PersonalInformationCard extends StatelessWidget {
  final Player player;

  const PersonalInformationCard({super.key, required this.player});

  Widget _buildInfoTile({
    required IconData icon,
    required String label,
    required String value,
    Widget? customValue,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.xs + 2),
          decoration: BoxDecoration(
            color: AppColors.surfaceLight,
            borderRadius: AppBorderRadius.radiusS,
          ),
          child: Icon(icon, size: 16, color: AppColors.primary),
        ),
        AppSpacing.horizontalM,
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label.toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                  letterSpacing: 1.0,
                ),
              ),
              AppSpacing.verticalXS,
              customValue ??
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: AppBorderRadius.radiusS,
        border: Border.all(
          color: color.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final infoTiles = [
      _buildInfoTile(
        icon: Icons.badge_outlined,
        label: "Full Name",
        value: "${player.firstName} ${player.lastName}",
      ),
      _buildInfoTile(
        icon: Icons.cake_outlined,
        label: "Age",
        value: "${player.age} Years Old",
      ),
      _buildInfoTile(
        icon: Icons.calendar_today_outlined,
        label: "Date of Birth",
        value: player.formattedDob,
      ),
      _buildInfoTile(
        icon: Icons.wc_outlined,
        label: "Gender",
        value: player.gender,
      ),
      _buildInfoTile(
        icon: Icons.phone_outlined,
        label: "Phone",
        value: player.phone.isNotEmpty ? player.phone : "Not Provided",
      ),
      _buildInfoTile(
        icon: Icons.location_on_outlined,
        label: "Location",
        value: player.location,
      ),
      _buildInfoTile(
        icon: Icons.sports_soccer,
        label: "Preferred Foot",
        value: "",
        customValue: Row(
          children: [
            _buildBadge("Right", AppColors.primary),
          ],
        ),
      ),
      _buildInfoTile(
        icon: Icons.shield_outlined,
        label: "Current Club",
        value: "",
        customValue: Row(
          children: [
            _buildBadge("Independent", AppColors.textSecondary),
          ],
        ),
      ),
      _buildInfoTile(
        icon: Icons.verified_user_outlined,
        label: "Member Since",
        value: "",
        customValue: Row(
          children: [
            _buildBadge("June 2026", AppColors.primary),
          ],
        ),
      ),
    ];

    List<Widget> buildDoubleColumnLayout() {
      final rows = <Widget>[];
      for (int i = 0; i < infoTiles.length; i += 2) {
        final leftTile = infoTiles[i];
        final rightTile = (i + 1 < infoTiles.length) ? infoTiles[i + 1] : const SizedBox();
        rows.add(
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: leftTile),
              AppSpacing.horizontalL,
              Expanded(child: rightTile),
            ],
          ),
        );
      }
      return rows;
    }

    List<Widget> buildSingleColumnLayout() {
      return infoTiles;
    }

    return Container(
      decoration: BoxDecoration(
        gradient: AppGradients.surface,
        borderRadius: AppBorderRadius.radiusL,
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.l),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title Header
            Row(
              children: const [
                Icon(Icons.person_outline, color: AppColors.primary, size: 20),
                AppSpacing.horizontalS,
                Text(
                  "PERSONAL INFORMATION",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.0,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            AppSpacing.verticalM,
            const Divider(color: AppColors.border, thickness: 1),
            AppSpacing.verticalM,

            // Responsive details layout
            LayoutBuilder(
              builder: (context, constraints) {
                final useDoubleColumn = constraints.maxWidth > 550;
                final children = useDoubleColumn ? buildDoubleColumnLayout() : buildSingleColumnLayout();
                
                return Column(
                  children: children.map((w) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.m),
                    child: w,
                  )).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
