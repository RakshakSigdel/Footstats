import React from "react";

export default function DynamicBackground({
  className = "",
  gradient = "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 55%, rgba(236,253,245,0.9) 100%)",
  gradientOpacity = 1,
  patternType = "grid",
  patternColor = "rgba(15,23,42,0.035)",
  patternSize = 22,
  patternOpacity = 1,
  showAccents = false,
  accentOne = "rgba(16,185,129,0.16)",
  accentTwo = "rgba(14,165,233,0.14)",
}) {
  const patternStyles = {
    grid: {
      backgroundImage: `linear-gradient(to right, ${patternColor} 1px, transparent 1px), linear-gradient(to bottom, ${patternColor} 1px, transparent 1px)`,
      backgroundSize: `${patternSize}px ${patternSize}px`,
    },
    dots: {
      backgroundImage: `radial-gradient(${patternColor} 1px, transparent 1px)`,
      backgroundSize: `${patternSize}px ${patternSize}px`,
    },
    none: {
      backgroundImage: "none",
    },
  };

  const resolvedPattern = patternStyles[patternType] || patternStyles.grid;

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ background: gradient, opacity: gradientOpacity }} />
      <div className="absolute inset-0" style={{ ...resolvedPattern, opacity: patternOpacity }} />

      {showAccents && (
        <>
          <div
            className="absolute -left-24 top-0 h-64 w-64 rounded-full blur-3xl"
            style={{ background: accentOne }}
          />
          <div
            className="absolute -right-24 bottom-0 h-64 w-64 rounded-full blur-3xl"
            style={{ background: accentTwo }}
          />
        </>
      )}
    </div>
  );
}
