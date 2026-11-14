const socials = [
  { name: "LinkedIn", icon: "/assets/social/linkedin.png", href: undefined },
  { name: "Facebook", icon: "/assets/social/facebook.png", href: "https://www.facebook.com/share/1HthDpX2Mq/?mibextid=wwXIfr" },
  { name: "GitHub", icon: "/assets/social/github.png", href: undefined },
  { name: "Upwork", icon: "/assets/social/upwork.png", href: undefined },
];

export default function SocialLinks({ className }: { className: string }) {
  return (
    <div className={className} aria-label="Social links">
      {socials.map((social) => (
        <a
          href={social.href}
          aria-label={social.href ? social.name : `${social.name} link coming soon`}
          aria-disabled={!social.href}
          title={social.href ? social.name : `${social.name} link coming soon`}
          target={social.href ? "_blank" : undefined}
          rel={social.href ? "noreferrer" : undefined}
          key={social.name}
        >
          <img src={social.icon} alt="" />
        </a>
      ))}
    </div>
  );
}
