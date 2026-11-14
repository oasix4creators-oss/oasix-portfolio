type TechBackgroundProps = {
  variant: "about" | "services" | "projects" | "process" | "testimonials" | "footer";
};

export default function TechBackground({ variant }: TechBackgroundProps) {
  return (
    <div className={`tech-background tech-background--${variant}`} aria-hidden="true">
      <img
        className="tech-background__asset tech-background__asset--primary"
        src="/assets/tech/oasix-tech-background-master.svg"
        alt=""
      />
      {/* Same geometry as the primary layer, so the travelling pulses sit exactly on its circuit lines. */}
      <img
        className="tech-background__asset tech-background__asset--primary tech-background__pulses"
        src="/assets/tech/oasix-tech-pulses.svg"
        alt=""
      />
      <img
        className="tech-background__asset tech-background__asset--secondary"
        src="/assets/tech/oasix-tech-background-master.svg"
        alt=""
      />
    </div>
  );
}
