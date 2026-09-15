import { ClipboardCheck, ShieldCheck, Trophy, Users } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Make Your Picks",
    detail: "Pick every winner before lock.",
  },
  {
    icon: ShieldCheck,
    title: "Earn Points",
    detail: "One point for each correct pick.",
  },
  {
    icon: Trophy,
    title: "Climb The Ranks",
    detail: "Compete all season long.",
  },
  {
    icon: Users,
    title: "Bragging Rights",
    detail: "Finish as season champion.",
  },
];

export default function FeatureRibbon() {
  return (
    <section className="splash-feature-ribbon">
      {FEATURES.map(({ icon: Icon, title, detail }) => (
        <div key={title}>
          <Icon size={30} />
          <span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </span>
        </div>
      ))}
    </section>
  );
}
