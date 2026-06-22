import 'package:flutter/material.dart';
import 'package:frontend_flutter/core/theme/app_theme.dart';

class PlayerIndividualStatCard extends StatelessWidget {
  final IconData? icon;
  final String value;
  final String label;

  const PlayerIndividualStatCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
  });

  Color _getAccentColor(String statLabel) {
    final lowerLabel = statLabel.toLowerCase();
    if (lowerLabel.contains('yellow')) {
      return AppColors.warning;
    } else if (lowerLabel.contains('loss') || lowerLabel.contains('lose')) {
      return AppColors.error;
    } else if (lowerLabel.contains('draw')) {
      return AppColors.textSecondary;
    } else if (lowerLabel.contains('goal') || lowerLabel.contains('win') || lowerLabel.contains('assist') || lowerLabel.contains('rate')) {
      return AppColors.primary;
    }
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final accentColor = _getAccentColor(label);

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
      child: ClipRRect(
        borderRadius: AppBorderRadius.radiusL,
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s,
                    vertical: AppSpacing.m,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Icon Container
                      if (icon != null) ...[
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.s),
                          decoration: BoxDecoration(
                            color: accentColor.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            icon,
                            color: accentColor,
                            size: 24,
                          ),
                        ),
                        AppSpacing.verticalM,
                      ],
                      
                      // Value Text
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Text(
                          value,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.5,
                            shadows: [
                              Shadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                      ),
                      AppSpacing.verticalXS,
                      
                      // Label Text
                      Text(
                        label.toUpperCase(),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Container(
              height: 4,
              color: accentColor,
            ),
          ],
        ),
      ),
    );
  }
}
