import { helmetLookup } from "../../utils/helmetLookup";

export default function HelmetImage({
  teamName,
  side = "home",
  size = 180,
  fallback = "NFL",
  className = "",
}) {
  const normalizedName = String(teamName || "").trim().toLowerCase();
  const lookupName = Object.keys(helmetLookup).find((name) => {
    const normalizedLookup = name.toLowerCase();
    return normalizedLookup === normalizedName ||
      normalizedLookup.endsWith(` ${normalizedName}`);
  });
  const helmet = lookupName ? helmetLookup[lookupName]?.[side] : null;

  if (!helmet) {
    return (
      <span
        className={`helmet-image-fallback ${className}`.trim()}
        aria-label={`${teamName || "NFL team"} helmet unavailable`}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      className={`helmet-image ${className}`.trim()}
      src={helmet}
      alt={`${teamName} helmet`}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="eager"
      draggable="false"
    />
  );
}
