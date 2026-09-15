import HelmetImage from "./HelmetImage";

export default function TeamMark({ team, size = "normal", side = "home" }) {
  const pixelSize = size === "small" ? 80 : 220;

  return (
    <div className={`team-mark helmet-team-mark ${size}`}>
      <HelmetImage
        teamName={team.name}
        side={side}
        size={pixelSize}
        fallback={team.short}
      />
    </div>
  );
}
