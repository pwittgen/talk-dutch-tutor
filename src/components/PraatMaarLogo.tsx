interface PraatMaarLogoProps {
  maarSize?: string;  // CSS font-size for "maar", e.g. "28px" or "1.75rem"
  cursorColor?: string;
  className?: string;
}

const PraatMaarLogo = ({
  maarSize = "28px",
  cursorColor = "#BF4E2B",
  className = "",
}: PraatMaarLogoProps) => {
  return (
    <div className={`flex flex-col leading-none select-none ${className}`} style={{ fontSize: maarSize }}>
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize: "0.58em",
          color: "inherit",
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
            color: "inherit",
            letterSpacing: "-0.02em",
          }}
        >
          maar
        </span>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 400,
            color: cursorColor,
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
