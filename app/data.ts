export type Project = {
  slug: string;
  title: string;
  category: string;
  filter: string;
  description: string;
  image: string;
  client: string;
  challenge: string;
  solution: string;
  technologies: string[];
  features: string[];
  result: string;
  accent: string;
  liveUrl?: string; // public address of the finished site, shown as a "Visit live site" link
  shareImage?: string; // 1200×630 JPG used when the case study is shared; falls back to the card image
};

export const projects: Project[] = [
  {
    slug: "zypp-camera-house",
    title: "ZYPP Camera House",
    category: "E-Commerce / Custom Business System",
    filter: "E-Commerce",
    description: "A custom e-commerce and content management platform combining a responsive customer storefront with a complete administrative management system.",
    image: "/assets/project-zypp.webp",
    client: "ZYPP Camera House",
    challenge: "Turn a growing social-first camera retailer into a structured digital storefront without losing the personal service its customers value.",
    solution: "We designed a fast catalogue, layered promotions, membership pricing, order verification and a flexible CMS around the store's real workflow.",
    technologies: ["HTML5", "CSS3", "JavaScript", "PHP", "MySQL"],
    features: ["Custom product catalogue", "Tiered member pricing", "Promotion engine", "Payment-proof workflow", "Admin content management", "Order tracking"],
    result: "A scalable commerce foundation that makes products easier to discover and gives the team direct control over daily store operations.",
    accent: "#02a7c7",
    liveUrl: "https://zyppcamerahouse.org/",
    shareImage: "/assets/share-zypp-camera-house.jpg",
  },
  {
    slug: "minx-in-motion",
    title: "MINX in Motion",
    category: "Portfolio Website / Interactive Film Portfolio",
    filter: "Portfolio Websites",
    description: "FRAME/SHIFT, an interactive film portfolio for Yangon-based video editor MINX (Thawtar San) that presents her real edits through a cinematic, scroll-directed experience.",
    image: "/assets/project-minx.webp",
    client: "MINX — Thawtar San, independent video editor",
    challenge: "Show the rhythm and timing of video work on a website, where a grid of thumbnails would flatten it.",
    solution: "A single scrolling page structured like an edit, with a cinematic intro, timecode and timeline motifs, a filterable cut room and a focused viewer for each edit.",
    technologies: ["Responsive website", "Netlify"],
    features: ["Cinematic intro with skip", "Scroll-directed story", "Filterable cut room", "Edit viewer", "Career timeline", "Motion on/off control", "Contact actions"],
    result: "A live portfolio that presents MINX as an independent editor and turns visitors into enquiries.",
    accent: "#3d7dff",
    liveUrl: "https://minx-in-motion.netlify.app/",
    shareImage: "/assets/share-minx-in-motion.jpg",
  },
];

// [icon, title, one-line description shown on the back of the card]
export const services = [
  ["website", "Website & E-Commerce Development", "Business websites and online stores with catalogues, carts and online payments."],
  ["education", "ERP & Learning Management Systems", "Systems for running daily operations or delivering courses, shaped around how your team works."],
  ["business", "Business Management & Admin Systems", "Sales, orders, staff roles and reports managed from one dashboard."],
  ["diamond", "Jewelry E-Commerce Systems", "Storefronts and inventory tools designed for jewellery retailers."],
  ["calendar", "Booking, Reservation & Membership Systems", "Online booking, member plans and automated notifications."],
  ["document", "Content Management Systems (CMS)", "Update your own pages, products and media without a developer."],
  ["database", "Database & Backend System Development", "Structured data, secure logic and integrations behind your product."],
  ["device", "Custom Web & Mobile Applications", "Tailored applications that start small and scale as you grow."],
] as const;

export const processSteps = [
  ["01", "discover", "Discover", "We understand your goals and requirements."],
  ["02", "design", "Design", "We create clean and modern UI/UX designs."],
  ["03", "develop", "Develop", "We build fast, responsive and scalable solutions."],
  ["04", "launch", "Launch", "We deploy and make it live for the world."],
  ["05", "support", "Support", "We provide ongoing support and updates."],
] as const;
