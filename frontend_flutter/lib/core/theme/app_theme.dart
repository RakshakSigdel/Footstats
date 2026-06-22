import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary brand colors
  static const Color primary = Color(0xFF00E676); // Vibrant Pitch Green
  static const Color primaryDark = Color(0xFF00B95B);
  static const Color accent = Color(0xFF00E676);

  // Background and surface colors
  static const Color background = Color(0xFF0B0D0F); // Deep Stadium Black
  static const Color backgroundLight = Color(0xFF12161A);
  static const Color surface = Color(0xFF1B2026); // Card background
  static const Color surfaceLight = Color(
    0xFF242B33,
  ); // Input / highlight surface
  static const Color surfaceLighter = Color(0xFF2F3742);

  // Borders
  static const Color border = Color(0xFF282F38);
  static const Color borderFocused = Color(0xFF00E676);
  static const Color borderHover = Color(0xFF3E4957);

  // Feedback/Status
  static const Color error = Color(0xFFFF5252);
  static const Color success = Color(0xFF00E676);
  static const Color warning = Color(0xFFFFD740);
  static const Color info = Color(0xFF448AFF);

  // Text colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF8F9CAE);
  static const Color textMuted = Color(0xFF5A6675);
}

class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double s = 8.0;
  static const double m = 16.0;
  static const double l = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  // Vertical spacing helpers
  static const SizedBox verticalXS = SizedBox(height: xs);
  static const SizedBox verticalS = SizedBox(height: s);
  static const SizedBox verticalM = SizedBox(height: m);
  static const SizedBox verticalL = SizedBox(height: l);
  static const SizedBox verticalXL = SizedBox(height: xl);
  static const SizedBox verticalXXL = SizedBox(height: xxl);

  // Horizontal spacing helpers
  static const SizedBox horizontalXS = SizedBox(width: xs);
  static const SizedBox horizontalS = SizedBox(width: s);
  static const SizedBox horizontalM = SizedBox(width: m);
  static const SizedBox horizontalL = SizedBox(width: l);
  static const SizedBox horizontalXL = SizedBox(width: xl);
}

class AppBorderRadius {
  AppBorderRadius._();

  static const double s = 8.0;
  static const double m = 12.0;
  static const double l = 16.0;
  static const double xl = 24.0;
  static const double circular = 99.0;

  static final BorderRadius radiusS = BorderRadius.circular(s);
  static final BorderRadius radiusM = BorderRadius.circular(m);
  static final BorderRadius radiusL = BorderRadius.circular(l);
  static final BorderRadius radiusXL = BorderRadius.circular(xl);
  static final BorderRadius radiusCircular = BorderRadius.circular(circular);
}

class AppGradients {
  AppGradients._();

  static const LinearGradient background = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF12161A), Color(0xFF0B0D0F)],
  );

  static const LinearGradient primary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF00FF87), Color(0xFF00E676)],
  );

  static const LinearGradient buttonPrimary = LinearGradient(
    colors: [Color(0xFF00FF87), Color(0xFF00C853)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient surface = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1B2026), Color(0xFF12161A)],
  );

  static const LinearGradient glow = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0x1F00E676), Color(0x0000E676)],
  );
}

class AppTheme {
  AppTheme._();

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.primary,
        surface: AppColors.background,
        error: AppColors.error,
        onPrimary: Color(0xFF0B0D0F),
        onSurface: AppColors.textPrimary,
      ),
      fontFamily: 'Inter',
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontSize: 32.0,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          letterSpacing: -0.5,
        ),
        headlineMedium: TextStyle(
          fontSize: 24.0,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          letterSpacing: -0.5,
        ),
        titleLarge: TextStyle(
          fontSize: 20.0,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        titleMedium: TextStyle(
          fontSize: 16.0,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: TextStyle(
          fontSize: 16.0,
          fontWeight: FontWeight.normal,
          color: AppColors.textPrimary,
        ),
        bodyMedium: TextStyle(
          fontSize: 14.0,
          fontWeight: FontWeight.normal,
          color: AppColors.textSecondary,
        ),
        labelLarge: TextStyle(
          fontSize: 14.0,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14.0),
        labelStyle: const TextStyle(
          color: AppColors.textSecondary,
          fontSize: 14.0,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.m,
          vertical: AppSpacing.m,
        ),
        border: OutlineInputBorder(
          borderRadius: AppBorderRadius.radiusM,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.radiusM,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.radiusM,
          borderSide: const BorderSide(
            color: AppColors.borderFocused,
            width: 1.5,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.radiusM,
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppBorderRadius.radiusM,
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: const Color(0xFF0B0D0F),
          backgroundColor: AppColors.primary,
          shadowColor: const Color(0x3D00E676),
          elevation: 4,
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.m, horizontal: AppSpacing.s),
          shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.radiusM),
          textStyle: const TextStyle(
            fontSize: 16.0,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: EdgeInsets.zero,
          textStyle: const TextStyle(
            fontSize: 14.0,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: AppBorderRadius.radiusL),
        elevation: 0,
      ),
    );
  }
}
