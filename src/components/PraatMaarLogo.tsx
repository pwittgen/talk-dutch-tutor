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
    <div className={`flex flex-col leading-none select-none ${className}`} style={{ fontSize: maarSize }}>
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize: "0.52em",
          color: colors.praat,
          lineHeight: 1,
          letterSpacing: 0,
          display: "block",
        }}
      >
        praat
      </span>
      <div style={{ display: "flex", alignItems: "baseline", lineHeight: 0.95 }}>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: "1em",
            color: colors.maar,
            letterSpacing: "-0.02em",
          }}
        >
          maar
        </span>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 400,
            color: colors.cursor,
            animation: "blink 1.1s step-end infinite",
          }}
        >
          _
        </span>
      </div>
    </div>
  );
};

export default PraatMaarLogo;
