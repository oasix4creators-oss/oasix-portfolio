import type { Metadata } from "next";
import "./globals.css";
import SiteLoader from "./components/SiteLoader";
import CustomScrollbar from "./components/CustomScrollbar";
import DecodeLabels from "./components/DecodeLabels";
import SiteCursor from "./components/SiteCursor";
import CaseImageZoom from "./components/CaseImageZoom";
import CommandPalette from "./components/CommandPalette";
import ProjectBrief from "./components/ProjectBrief";
import Toast from "./components/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://oasix-portfolio.dragongai93.chatgpt.site"),
  title: "OASIX Web Studio",
  description: "OASIX Web Studio builds premium websites, commerce platforms and business systems that help growing companies move forward.",
  openGraph: {
    title: "OASIX Web Studio",
    description: "Digital experiences that drive growth.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "OASIX Web Studio — Digital experiences that drive growth" }],
  },
  twitter: { card: "summary_large_image", title: "OASIX Web Studio", description: "Digital experiences that drive growth.", images: ["/og.png"] },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="site-loading"><SiteLoader /><CustomScrollbar /><DecodeLabels />{children}<CaseImageZoom /><CommandPalette /><ProjectBrief /><Toast /><SiteCursor /></body>
    </html>
  );
}
