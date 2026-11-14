import type { Metadata } from "next";
import ProjectsExperience from "./ProjectsExperience";

export const metadata: Metadata = {
  title: "Projects — OASIX Web Studio",
  description: "Explore selected websites, business systems and digital products built by OASIX Web Studio.",
  openGraph: { title: "Projects — OASIX Web Studio", description: "Selected websites, systems and digital experiences built around real business needs." },
  twitter: { card: "summary_large_image", title: "Projects — OASIX Web Studio", description: "Selected websites, systems and digital experiences." },
};

export default function ProjectsPage() {
  return <ProjectsExperience />;
}
