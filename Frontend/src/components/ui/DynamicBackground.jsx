import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function DynamicBackground({
  className = "",
  gradient = "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 55%, rgba(236,253,245,0.9) 100%)",
  darkGradient = "linear-gradient(135deg, rgba(12,18,34,0.96) 0%, rgba(13,27,45,0.94) 55%, rgba(14,35,44,0.92) 100%)",
  gradientOpacity = 1,
  patternType = "grid",
  patternColor = "rgba(15,23,42,0.035)",
  darkPatternColor = "rgba(148,163,184,0.11)",
  patternSize = 22,
  patternOpacity = 1,
  showAccents = false,
  accentOne = "rgba(59,130,246,0.16)",
  accentTwo = "rgba(14,165,233,0.14)",
  darkAccentOne = "rgba(59,130,246,0.22)",
  darkAccentTwo = "rgba(59,130,246,0.2)",
  adaptiveTheme = true,
}) {
  const { isDarkMode } = useTheme();
  const useDarkPalette = adaptiveTheme && isDarkMode;

  const resolvedGradient = useDarkPalette ? darkGradient : gradient;
  const resolvedPatternColor = useDarkPalette ? darkPatternColor : patternColor;
  const resolvedAccentOne = useDarkPalette ? darkAccentOne : accentOne;
  const resolvedAccentTwo = useDarkPalette ? darkAccentTwo : accentTwo;

  const patternStyles = {
    grid: {
      backgroundImage: `linear-gradient(to right, ${resolvedPatternColor} 1px, transparent 1px), linear-gradient(to bottom, ${resolvedPatternColor} 1px, transparent 1px)`,
      backgroundSize: `${patternSize}px ${patternSize}px`,
    },
    dots: {
      backgroundImage: `radial-gradient(${resolvedPatternColor} 1px, transparent 1px)`,
      backgroundSize: `${patternSize}px ${patternSize}px`,
    },
    none: {
      backgroundImage: "none",
    },
  };

  const resolvedPattern = patternStyles[patternType] || patternStyles.grid;

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ background: resolvedGradient, opacity: gradientOpacity }} />
      <div className="absolute inset-0" style={{ ...resolvedPattern, opacity: patternOpacity }} />

      {showAccents && (
        <>
          <div
            className="absolute -left-24 top-0 h-64 w-64 rounded-full blur-3xl"
            style={{ background: resolvedAccentOne }}
          />
          <div
            className="absolute -right-24 bottom-0 h-64 w-64 rounded-full blur-3xl"
            style={{ background: resolvedAccentTwo }}
          />
        </>
      )}
    </div>
  );
}
