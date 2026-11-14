import type { Project } from "../../data";
import { ArrowIcon } from "../../components/Brand";
import { SiteFrame, TransitionLink } from "../../components/SiteChrome";
import CaseIndex from "../../components/CaseIndex";

// Everything below describes what is on the live site (minx-in-motion.netlify.app) or what the
// project brief contained. Nothing here claims client results or a technology stack that isn't confirmed.

// The page is structured like an edit: these are its scenes, in order, as titled on the live site.
const scenes = [
  ["Intro", "Preparing the first frame"],
  ["Hero", "MINX in Motion"],
  ["The Frame Break", "Different worlds. One instinct."],
  ["Inside the Edit", "A story is built between the cuts."],
  ["The Moment", "From fragments to feeling"],
  ["Selected Work", "Made to move you."],
  ["The Cut Room", "More frames. More possibilities."],
  ["The Human Behind the Edit", "A little instinct. A lot of intention."],
  ["The Story So Far", "Career timeline"],
  ["A Change of Pace", "Always finding the next perspective."],
  ["The Craft", "Thoughtfully cut. Personally made."],
  ["The Next Frame", "Let's make the next frame."],
] as const;

const experienceFeatures = [
  ["Cinematic intro", "A short opening sequence, “Preparing the first frame”, with a skip option for returning visitors."],
  ["Scroll to direct", "The visitor’s scroll drives the story, framed by a running timecode and an edit-timeline ruler."],
  ["Selected work", "A frame selector steps through featured edits one at a time before opening the full collection."],
  ["The Cut Room", "The full set of edits, filterable by Product, Creative and Education, with a link to the original collection."],
  ["The Edit viewer", "Each edit opens in a focused viewer with editor, format and duration details, plus next-edit and “discuss this edit” actions."],
  ["Motion control", "A Motion on/off control lets visitors calm the page down without losing any content."],
] as const;

const storyTimeline = [
  ["2021–2023", "Personal edits and content creation for YouTube and TikTok"],
  ["2023–2025", "Higher National Diploma, Info Myanmar College"],
  ["2025", "Full-time video editor at ZYPP Camera House"],
  ["2026", "Independent: freelance editing and content creation"],
] as const;

const deliverables = ["Concept and page narrative", "Visual and motion design", "Responsive front-end build", "Work gallery and viewer", "Contact actions", "Deployment on Netlify"];

export default function MinxCaseStudy({ project, next }: { project: Project; next?: Project }) {
  return (
    <SiteFrame>
      <main className="case-study case-study--zypp case-study--minx" id="home">
        <CaseIndex />
        <section className="case-hero shell">
          <div className="case-hero__copy">
            <p className="eyebrow">PORTFOLIO WEBSITE · INTERACTIVE FILM PORTFOLIO</p>
            <h1>MINX in Motion</h1>
            <p>FRAME/SHIFT is an interactive film portfolio for MINX (Thawtar San), an independent video editor and content creator in Yangon. Instead of a grid of thumbnails, the site unfolds like one of her edits: scene by scene, directed by the visitor’s scroll.</p>
            {project.liveUrl && <a className="button case-live" href={project.liveUrl} target="_blank" rel="noreferrer">Visit live site <ArrowIcon /></a>}
          </div>
          <dl className="case-meta case-meta--expanded">
            <div><dt>ROLE</dt><dd>Design &amp; Development</dd></div>
            <div><dt>CLIENT</dt><dd>Independent video editor</dd></div>
            <div><dt>PLATFORM</dt><dd>Responsive website</dd></div>
            <div><dt>HOSTING</dt><dd>Netlify</dd></div>
            <div><dt>CONTENT</dt><dd>Her CV, portraits and real edits</dd></div>
            <div><dt>STATUS</dt><dd>Live · minx-in-motion.netlify.app</dd></div>
          </dl>
        </section>

        <section className="case-section case-overview shell" data-index="Overview">
          <div className="case-section__label"><p className="eyebrow">PROJECT OVERVIEW</p><span>01</span></div>
          <div className="case-section__body">
            <h2>A portfolio that behaves like the work it shows.</h2>
            <div className="case-columns">
              <p>MINX was moving from a full-time editing role to working independently, and needed a portfolio that could introduce her, show real work and turn interest into conversations with new clients.</p>
              <p>The site was built from her CV, portraits and real footage. Its language, structure and motion all borrow from editing itself: timecodes, timelines, cuts and frames.</p>
            </div>
          </div>
        </section>

        <section className="case-section case-challenge shell" data-index="Challenge">
          <div className="case-section__label"><p className="eyebrow">THE CHALLENGE</p><span>02</span></div>
          <div className="case-section__body">
            <h2>Video work loses its rhythm in a thumbnail grid.</h2>
            <p className="case-lead">An editor is judged on timing, pacing and feeling, none of which survive as a row of still images. The site had to present a collection of edits across product, creative and education work, tell the story of how she got here, and still make it effortless to get in touch.</p>
          </div>
        </section>

        <section className="case-showcase shell" data-index="Concept">
          <div className="case-showcase__heading">
            <div><p className="eyebrow">THE CONCEPT</p><h2>FRAME/SHIFT: a page cut like an edit.</h2></div>
            <p>The single page is sequenced as twelve scenes. Each one has a working title and a line of its own, so scrolling through the site feels like watching a short film about the editor.</p>
          </div>
          <figure className="case-visual case-visual--minx">
            <img src="/assets/minx-hero.webp" width="1280" height="583" loading="lazy" decoding="async" alt="The FRAME/SHIFT hero on the live MINX site: the headline beside a portrait of the editor" />
            <figcaption>The FRAME/SHIFT hero on the live site.</figcaption>
          </figure>
          <ol className="case-scenes" aria-label="The scenes of the page, in order">
            {scenes.map(([name, line], index) => (
              <li key={name}><span>{`00:${String(index * 2).padStart(2, "0")}`}</span><h3>{name}</h3><p>{line}</p></li>
            ))}
          </ol>
        </section>

        <section className="case-operations shell" data-index="Experience">
          <div className="case-section__label"><p className="eyebrow">THE EXPERIENCE</p><span>03</span></div>
          <div className="case-operations__grid">
            {experienceFeatures.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="case-management shell" data-index="Story & contact">
          <article>
            <p className="eyebrow">THE STORY SO FAR</p><h2>From personal edits to independent work.</h2>
            <ol className="case-timeline">
              {storyTimeline.map(([when, what]) => <li key={when}><span>{when}</span><p>{what}</p></li>)}
            </ol>
          </article>
          <article>
            <p className="eyebrow">THE NEXT FRAME</p><h2>Every path leads to a conversation.</h2>
            <p>The closing scene gathers every way to reach her: copy-to-clipboard email, a one-tap call button, and Facebook, Messenger, Instagram and TikTok. The edit viewer adds a “discuss this edit” action, so interest in a specific piece of work can turn straight into an enquiry.</p>
          </article>
        </section>

        <section className="case-capabilities shell" data-index="Deliverables">
          <p className="eyebrow">WHAT WE DELIVERED</p><h2>From concept to live site.</h2>
          <div className="case-capabilities__grid">{deliverables.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></div>)}</div>
        </section>

        <section className="case-outcome shell" data-index="Outcome">
          <p className="eyebrow">OUTCOME</p>
          <h2>A portfolio that feels like her work.</h2>
          <p>MINX now has a live portfolio that introduces her as an independent editor, presents her edits in a way that keeps their rhythm, and makes it easy for new clients to start a conversation.</p>
          {project.liveUrl && <a className="button button--ghost case-live" href={project.liveUrl} target="_blank" rel="noreferrer">Visit minx-in-motion.netlify.app <ArrowIcon /></a>}
        </section>

        <section className="case-details shell">
          <div><p className="eyebrow">PROJECT DETAILS</p><div className="case-stack"><div><span>TYPE</span><b>Single-page portfolio</b></div><div><span>WORK CATEGORIES</span><b>Product · Creative · Education</b></div><div><span>HOSTING</span><b>Netlify</b></div></div></div>
          <div><p className="eyebrow">DESIGN APPROACH</p><p>A deep, near-black film palette with editorial headlines that set one phrase in italics, like “Different worlds. <em>One instinct.</em>” Interface details are drawn from editing software (timecode readouts, a timeline ruler, a frame counter), so the portfolio reads as the work of an editor before a single video plays.</p></div>
        </section>

        {next && <section className="next-project shell">
          <p className="eyebrow">NEXT PROJECT</p>
          <TransitionLink href={`/project/${next.slug}`}><h2>{next.title}</h2><span><ArrowIcon /></span></TransitionLink>
        </section>}
      </main>
    </SiteFrame>
  );
}
