interface PraatMaarLogoProps {
  maarSize?: string;
  variant?: "light" | "dark" | "rust";
  className?: string;
}

const variantColors = {
  light: { praat: "#18160F", maar: "#BF4E2B", cursor: "#BF4E2B" },
  dark:  { praat: "#F4EFE6", maar: "#BF4E2B", cursor: "#BF4E2B" },
  rust:  { praat: "#F4EFE6", maar: "#18160F", cursor: "#18160F" },
};

const PraatMaarLogo = ({
  maarSize = "28px",
  variant = "light",
  className = "",
}: PraatMaarLogoProps) => {
  const colors = variantColors[variant];

  return (
    <div className={`flex items-baseline leading-none select-none ${className}`} style={{ fontSize: maarSize, gap: "0.12em" }}>
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize: "1em",
          color: colors.praat,
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        praat
      </span>
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: "0.95em",
          color: colors.maar,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        maar
      </span>
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontWeight: 400,
          color: colors.cursor,
          fontSize: "0.858em",
          animation: "blink 1.1s step-end infinite",
          lineHeight: 1,
        }}
      >
        _
      </span>
    </div>
  );
};

export default PraatMaarLogo;
