import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowIcon } from "../../components/Brand";
import { CaseBack, SiteFrame, TransitionLink } from "../../components/SiteChrome";
import { projects } from "../../data";
import MinxCaseStudy from "./MinxCaseStudy";

const customerFeatures = [
  "Promotional banners, featured categories and best sellers",
  "Shop, bundles and brand navigation",
  "Product search, listings and details",
  "Discounted pricing and shopping cart",
  "Order placement and order checking",
  "Email, Facebook and Google sign-in",
  "Customer reviews with star ratings",
  "Unboxing and influencer review pages",
  "Wholesale and membership information",
  "Warranty, reservation, delivery and payment policies",
];

// From the live storefront (zyppcamerahouse.org).
const storeCategories = ["Vlog Cameras", "Action Cameras", "Mirrorless Cameras", "Compact Cameras", "Lenses", "Gimbals", "Microphones", "Accessories"];
const storeBrands = ["DJI", "Insta360", "Canon", "Sony", "Fujifilm", "GoPro", "HollyLand", "SanDisk", "Lexar", "Ulanzi", "SmallRig", "Godox", "Triopo"];
const trustBadges = ["Secure Payment", "Fast Delivery", "Warranty Guaranteed", "Excellent Support"];

const catalogueFeatures = ["Products", "Categories", "Subcategories", "Brands", "Product media", "Pricing", "Promotional products", "Availability content"];
const promotionFeatures = ["Percentage discounts", "Fixed-amount discounts", "Product promotions", "Category promotions", "Brand promotions", "Bundle discounts", "Membership discounts", "Referral discounts", "Promotional events"];
const adminModules = ["Dashboard", "My Account", "Products", "Categories & Brands", "Unique Selling Points", "Discounts", "Orders", "Payment Proof Uploads", "Delivery Methods", "Users", "Content Management", "Wholesale Survey", "Media", "Membership Tiers"];
const architectureAreas = ["Users", "Social sign-in (Facebook, Google)", "Products", "Categories", "Brands", "Bundles", "Discounts & conditions", "Orders & order items", "Membership tiers", "Referral information", "Delivery methods", "Customer reviews", "Policy pages", "CMS content", "Media", "Payment-proof records"];
const keyCapabilities = ["Responsive E-Commerce Storefront", "Custom Product Catalogue", "Advanced Promotions & Discounts", "Membership & Loyalty System", "Shopping Cart & Orders", "Payment Proof Verification", "Delivery Management", "Social Sign-In", "Customer Reviews", "Custom CMS", "Administrative Dashboard", "Sales & Product Analytics", "Media Management", "Responsive Admin Interface", "Search-Ready Metadata"];

const membershipTiers = [
  ["Standard", "Purchases below 15 lakh MMK"],
  ["Active Vlogger", "15–50 lakh MMK"],
  ["Pro Vlogger", "50–100 lakh MMK"],
  ["Master Vlogger", "Above 100 lakh MMK"],
];

const developmentChallenges = [
  ["Complex discount logic", "Multiple discount types and eligibility rules needed to produce consistent final prices.", "A modular promotion structure separates discount types, conditions and applicable products or customer groups."],
  ["Two responsive experiences", "The customer storefront and administration dashboard serve very different tasks on desktop and mobile.", "Each interface uses its own responsive hierarchy, simplifying navigation and prioritizing essential actions on smaller screens."],
  ["Centralized content management", "Non-technical administrators needed control over products, promotions, media and routine website content.", "Reusable CMS structures and a dedicated PHP/MySQL administration area centralize everyday updates."],
  ["Connected business workflows", "Ordering, payment evidence, memberships, delivery and content could not operate as isolated features.", "Structured backend relationships connect customer activity to clear administrative review and management workflows."],
];

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  const share = project.shareImage
    ? { url: project.shareImage, width: 1200, height: 630, alt: `${project.title} — OASIX case study` }
    : { url: project.image, alt: `${project.title} preview` };
  return {
    title: `${project.title} — OASIX Case Study`,
    description: project.description,
    openGraph: { title: `${project.title} — OASIX Case Study`, description: project.description, images: [share] },
    twitter: { card: "summary_large_image", title: `${project.title} — OASIX Case Study`, description: project.description, images: [share.url] },
  };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  if (projectIndex < 0) notFound();
  const project = projects[projectIndex];
  const next = projects[(projectIndex + 1) % projects.length];
  const hasNext = projects.length > 1; // never link a project to itself

  if (project.slug === "minx-in-motion") {
    return <MinxCaseStudy project={project} next={hasNext ? next : undefined} />;
  }

  if (project.slug === "zypp-camera-house") {
    return (
      <SiteFrame>
        <main className="case-study case-study--zypp" id="home">
          <CaseBack />
          <section className="case-hero shell">
            <div className="case-hero__copy">
              <p className="eyebrow">E-COMMERCE · CUSTOM CMS · BUSINESS MANAGEMENT</p>
              <h1>ZYPP Camera House</h1>
              <p>A full-stack e-commerce platform designed for a camera and accessories retailer, featuring a responsive shopping experience, custom promotions and membership logic, order management, payment verification, content management and an integrated administrative dashboard.</p>
              {project.liveUrl && <a className="button case-live" href={project.liveUrl} target="_blank" rel="noreferrer">Visit live site <ArrowIcon /></a>}
            </div>
            <dl className="case-meta case-meta--expanded">
              <div><dt>ROLE</dt><dd>Full-Stack Development</dd></div>
              <div><dt>CLIENT TYPE</dt><dd>Camera &amp; Accessories Retailer</dd></div>
              <div><dt>PLATFORM</dt><dd>Responsive Web Application</dd></div>
              <div><dt>FRONTEND</dt><dd>HTML · CSS · JavaScript</dd></div>
              <div><dt>BACKEND</dt><dd>PHP</dd></div>
              <div><dt>DATABASE</dt><dd>MySQL</dd></div>
              <div><dt>STATUS</dt><dd>Live · zyppcamerahouse.org</dd></div>
            </dl>
          </section>

          <section className="case-section case-overview shell" data-index="Overview">
            <div className="case-section__label"><p className="eyebrow">PROJECT OVERVIEW</p><span>01</span></div>
            <div className="case-section__body">
              <h2>Commerce built around the way the business operates.</h2>
              <div className="case-columns">
                <p>ZYPP Camera House required more than a basic online product catalogue. The platform needed to support retail customers, promotional campaigns, membership benefits, payment verification, delivery management and day-to-day content administration from one system.</p>
                <p>The result is a custom responsive e-commerce platform where customers can explore products and promotions while administrators manage the business through a purpose-built backend dashboard.</p>
              </div>
            </div>
          </section>

          <section className="case-section case-challenge shell" data-index="Challenge">
            <div className="case-section__label"><p className="eyebrow">THE CHALLENGE</p><span>02</span></div>
            <div className="case-section__body">
              <h2>One platform, many connected requirements.</h2>
              <p className="case-lead">The challenge was not simply building an e-commerce frontend. The system had to support a large camera and accessories catalogue, layered promotions, membership benefits, orders, payment-proof review, delivery configuration, customer-facing content and administrative control across responsive desktop and mobile interfaces.</p>
            </div>
          </section>

          <section className="case-catalogue shell" data-index="Catalogue">
            <div className="case-catalogue__intro">
              <p className="eyebrow">THE CATALOGUE</p>
              <h2>Built for a creator-gear catalogue.</h2>
              <p>The live store organises cameras, lenses, gimbals, microphones, bundles and accessories, with accessory sets matched to specific DJI Osmo, Insta360 and GoPro models.</p>
            </div>
            <div className="case-catalogue__lists">
              <div><span>{String(storeCategories.length).padStart(2, "0")}</span><p className="eyebrow">MAIN CATEGORIES</p><div className="case-tag-list">{storeCategories.map((item) => <span key={item}>{item}</span>)}</div></div>
              <div><span>{String(storeBrands.length).padStart(2, "0")}</span><p className="eyebrow">BRANDS STOCKED</p><div className="case-tag-list">{storeBrands.map((item) => <span key={item}>{item}</span>)}</div></div>
            </div>
          </section>

          <section className="case-showcase shell" data-index="Storefront">
            <div className="case-showcase__heading">
              <div><p className="eyebrow">CUSTOMER EXPERIENCE</p><h2>Responsive Shopping Experience</h2></div>
              <p>The customer interface adapts considerably between desktop and mobile instead of simply shrinking the same layout. Navigation, product discovery and support actions are reorganized to remain clear and useful on smaller screens.</p>
            </div>
            <figure className="case-visual case-visual--customer">
              <img src="/assets/zypp-customer-experience.webp" width="1672" height="941" loading="lazy" decoding="async" alt="ZYPP Camera House customer storefront shown on laptop and mobile" />
              <figcaption>Responsive customer storefront — desktop and mobile experience.</figcaption>
            </figure>
            <div className="case-feature-strip" aria-label="Customer storefront features">
              {customerFeatures.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
            </div>
          </section>

          <section className="case-system shell" data-index="Commerce system">
            <div className="case-section__label"><p className="eyebrow">CORE COMMERCE SYSTEM</p><span>03</span></div>
            <div className="case-system__grid">
              <article className="case-card case-card--wide">
                <span>01</span><h3>Product &amp; Catalogue Management</h3>
                <p>The catalogue is structured so administrators can maintain product information without manually changing frontend code.</p>
                <div className="case-tag-list">{catalogueFeatures.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
              <article className="case-card case-card--wide">
                <span>02</span><h3>Promotions &amp; Discount System</h3>
                <p>Promotion rules can be associated with different products, catalogue areas or customer conditions instead of relying on one basic discount field.</p>
                <div className="case-tag-list">{promotionFeatures.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
              <article className="case-card case-card--membership">
                <span>03</span><h3>Customer Membership &amp; Loyalty</h3>
                <p>Membership levels support benefit and discount eligibility, promotional access, referrals, community access and training or knowledge-sharing benefits.</p>
                <div className="membership-grid">{membershipTiers.map(([name, range], index) => <div key={name}><b>{String(index + 1).padStart(2, "0")}</b><h4>{name}</h4><p>{range}</p></div>)}</div>
              </article>
            </div>
          </section>

          <section className="case-operations shell" data-index="Operations">
            <div className="case-section__label"><p className="eyebrow">OPERATIONAL WORKFLOWS</p><span>04</span></div>
            <div className="case-operations__grid">
              <article><h3>Orders &amp; Checkout</h3><p>Order records cover cart items, quantities, original and discounted prices, subtotal, total discounts, final order total, customer details, payment information and order status—giving administrators a clear transaction view.</p></article>
              <article><h3>Payment Proof Verification</h3><p>Customers can upload payment evidence where required. Administrators review the submitted proof before confirming the transaction, supporting KBZPay and other configured payment contexts without claiming automated banking verification.</p></article>
              <article><h3>Delivery Management</h3><p>Delivery methods, location or township-based configuration, pricing, free-delivery conditions and order delivery information are managed as part of the wider operational workflow.</p></article>
              <article><h3>Customer Accounts</h3><p>Customers register with email or sign in with Facebook or Google, and can change their password or delete their account themselves.</p></article>
              <article><h3>Reviews &amp; Social Proof</h3><p>A review form with star ratings and topics collects customer feedback on the homepage, alongside dedicated pages for unboxing videos and influencer reviews.</p></article>
              <article><h3>Trust &amp; Store Policies</h3><p>Warranty, reservation, delivery and payment policies each have their own page, reinforced on the storefront by trust badges.</p><div className="case-tag-list">{trustBadges.map((item) => <span key={item}>{item}</span>)}</div></article>
            </div>
          </section>

          <section className="case-showcase case-showcase--admin shell" data-index="Admin dashboard">
            <div className="case-showcase__heading">
              <div><p className="eyebrow">ADMINISTRATION</p><h2>Custom Administrative Dashboard</h2></div>
              <p>ZYPP administrators operate the platform through a dedicated responsive backend rather than editing website code. On mobile, important dashboard cards are prioritized and navigation collapses for task-focused access.</p>
            </div>
            <figure className="case-visual case-visual--admin">
              <img src="/assets/zypp-admin-dashboard.webp" width="1535" height="1024" loading="lazy" decoding="async" alt="ZYPP Camera House administrative dashboard shown on laptop and mobile" />
              <figcaption>Responsive administrative dashboard for managing the ZYPP platform.</figcaption>
            </figure>
            <div className="case-admin-modules">{adminModules.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</div>)}</div>
          </section>

          <section className="case-management shell">
            <article>
              <p className="eyebrow">DASHBOARD ANALYTICS</p><h2>Useful signals at a glance.</h2>
              <p>The dashboard summarizes yearly and monthly sales, sales trends, trending brands and best-selling products. Values shown in the portfolio visual are representative dashboard data and are not presented as verified client financial results.</p>
            </article>
            <article>
              <p className="eyebrow">CUSTOM CMS</p><h2>Routine updates without developer dependency.</h2>
              <p>Administrators can maintain homepage banners, promotional content, About and Contact information, media assets and reusable page content—keeping the storefront current without requiring a developer for routine changes.</p>
            </article>
          </section>

          <section className="case-architecture shell" data-index="Architecture">
            <div className="case-section__label"><p className="eyebrow">TECHNICAL ARCHITECTURE</p><span>05</span></div>
            <div className="case-architecture__content">
              <h2>A backend structured around connected business entities.</h2>
              <p>The PHP and MySQL backend goes beyond a simple products table. It connects the areas required to manage catalogue data, customer programs, transactions, content and operational review in one system.</p>
              <div className="case-entity-grid">{architectureAreas.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
          </section>

          <section className="case-capabilities shell" data-index="Key features">
            <p className="eyebrow">KEY FEATURES</p><h2>One connected platform.</h2>
            <div className="case-capabilities__grid">{keyCapabilities.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></div>)}</div>
          </section>

          <section className="case-development shell" data-index="Challenges & solutions">
            <div className="case-section__label"><p className="eyebrow">CHALLENGES &amp; SOLUTIONS</p><span>06</span></div>
            <div className="case-development__list">
              {developmentChallenges.map(([title, challenge, solution], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{title}</h3><p>{challenge}</p></div>
                  <div><p className="eyebrow">SOLUTION</p><p>{solution}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section className="case-outcome shell" data-index="Outcome">
            <p className="eyebrow">OUTCOME</p>
            <h2>A unified digital platform for commerce and business management.</h2>
            <p>The project resulted in a unified digital platform that combines customer-facing commerce with internal business-management tools, giving ZYPP Camera House greater control over products, promotions, orders, content and customer programs from a single system. The store is live at zyppcamerahouse.org.</p>
            {project.liveUrl && <a className="button button--ghost case-live" href={project.liveUrl} target="_blank" rel="noreferrer">Visit zyppcamerahouse.org <ArrowIcon /></a>}
          </section>

          <section className="case-details shell">
            <div><p className="eyebrow">TECHNOLOGY STACK</p><div className="case-stack"><div><span>FRONTEND</span><b>HTML5 · CSS3 · JavaScript</b></div><div><span>BACKEND</span><b>PHP</b></div><div><span>DATABASE</span><b>MySQL</b></div><div><span>SIGN-IN</span><b>Email · Facebook · Google</b></div><div><span>SEARCH &amp; SHARING</span><b>Open Graph · Twitter Cards</b></div></div></div>
            <div><p className="eyebrow">DESIGN APPROACH</p><p>The customer interface uses a warm, neutral camera-retail aesthetic with product-focused imagery, while the admin interface prioritizes clarity and information hierarchy: desktop-first visual richness with a simplified, task-focused mobile presentation.</p></div>
          </section>

          {hasNext && <section className="next-project shell">
            <p className="eyebrow">NEXT PROJECT</p>
            <TransitionLink href={`/project/${next.slug}`}><h2>{next.title}</h2><span><ArrowIcon /></span></TransitionLink>
          </section>}
        </main>
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <main className="case-study" id="home">
        <CaseBack />
        <section className="case-hero shell">
          <div className="case-hero__copy">
            <p className="eyebrow">{project.category} — CASE STUDY</p>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            {project.liveUrl && <a className="button case-live" href={project.liveUrl} target="_blank" rel="noreferrer">Visit live site <ArrowIcon /></a>}
          </div>
          <dl className="case-meta"><div><dt>CLIENT</dt><dd>{project.client}</dd></div><div><dt>SCOPE</dt><dd>Strategy · UI/UX · Development</dd></div><div><dt>STATUS</dt><dd>Completed</dd></div></dl>
        </section>
        <section className="case-media shell" style={{ "--accent": project.accent } as React.CSSProperties}>
          <img src={project.image} alt={`${project.title} hero screenshot`} />
          <span className="case-media__orb" />
        </section>
        <section className="case-narrative shell" data-index="Overview">
          <aside><p className="eyebrow">PROJECT OVERVIEW</p><div className="case-index"><span>01</span><span>Challenge</span><span>02</span><span>Solution</span><span>03</span><span>Outcome</span></div></aside>
          <div className="case-copy">
            <article><span>01</span><h2>The challenge</h2><p>{project.challenge}</p></article>
            <article><span>02</span><h2>Our solution</h2><p>{project.solution}</p></article>
            <article><span>03</span><h2>The outcome</h2><p>{project.result}</p></article>
          </div>
        </section>
        <section className="case-details shell" data-index="Details">
          <div><p className="eyebrow">TECHNOLOGIES</p><div className="chip-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div></div>
          <div><p className="eyebrow">KEY FEATURES</p><ul>{project.features.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>
        {hasNext && <section className="next-project shell">
          <p className="eyebrow">NEXT PROJECT</p>
          <TransitionLink href={`/project/${next.slug}`}><h2>{next.title}</h2><span><ArrowIcon /></span></TransitionLink>
        </section>}
      </main>
    </SiteFrame>
  );
}
