import { Link } from "wouter";

import { AUTH_PERKS, authDefaults } from "@/app/auth/authDomain";

export function FiAuthPitch() {
  return (
    <aside className="fi-auth-shell__pitch" aria-label="Why F.I. Forgot">
      <Link href="/" className="fi-auth-shell__brand-link">
        <p className="fi-auth-shell__brand-title">{authDefaults.brandTitle}</p>
        <p className="fi-auth-shell__brand-subtitle">{authDefaults.brandSubtitle}</p>
      </Link>

      <h1 className="fi-auth-pitch__title">{authDefaults.pitchTitle}</h1>
      <p className="fi-auth-pitch__subtitle">{authDefaults.pitchSubtitle}</p>

      <div className="fi-auth-pitch__image-wrap">
        <img
          src={authDefaults.pitchImage}
          alt={authDefaults.pitchImageAlt}
          className="fi-auth-pitch__image"
          loading="lazy"
        />
      </div>

      <ul className="fi-auth-pitch__perks">
        {AUTH_PERKS.map(({ icon: Icon, text }) => (
          <li key={text} className="fi-auth-pitch__perk">
            <span className="fi-auth-pitch__perk-icon" aria-hidden>
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <span className="fi-auth-pitch__perk-text">{text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
