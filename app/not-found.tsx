import type { Metadata } from "next";
import NotFoundExperience from "./components/NotFoundExperience";

export const metadata: Metadata = {
  title: "Page Not Found — OASIX Web Studio",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return <NotFoundExperience />;
}
