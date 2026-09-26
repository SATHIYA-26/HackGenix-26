"use client";

import { Globe } from "lucide-react";

/**
 * YouTube Brand Logo SVG
 */
export function YouTubeLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Google Play Store Brand Logo SVG
 */
export function GooglePlayLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="gplay_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A0FF" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        <linearGradient id="gplay_red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF3A44" />
          <stop offset="100%" stopColor="#C31162" />
        </linearGradient>
        <linearGradient id="gplay_green" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#00C853" />
        </linearGradient>
        <linearGradient id="gplay_yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE146" />
          <stop offset="100%" stopColor="#FF6D00" />
        </linearGradient>
      </defs>
      <path d="M3.6 1.8A1.8 1.8 0 0 0 3 3.2v17.6c0 .6.2 1.1.6 1.4l10.3-10.1L3.6 1.8z" fill="url(#gplay_blue)" />
      <path d="M17.4 8.7L13.9 12.1l3.5 3.5 4.1-2.3c1.2-.7 1.2-1.8 0-2.4l-4.1-2.2z" fill="url(#gplay_yellow)" />
      <path d="M3.6 22.2l10.3-10.1 3.5 3.5-11.2 6.4c-.9.5-2 .4-2.6-.2z" fill="url(#gplay_red)" />
      <path d="M3.6 1.8c.6-.6 1.7-.7 2.6-.2l11.2 6.4-3.5 3.5L3.6 1.8z" fill="url(#gplay_green)" />
    </svg>
  );
}

/**
 * Apple App Store Brand Logo SVG
 */
export function AppStoreLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#0D84FD" />
      <path
        d="M12.8 4.8a1 1 0 0 0-1.6 0l-7.2 12.8a1 1 0 0 0 .9 1.4h3.1l1.4-2.5h5.2l1.4 2.5h3.1a1 1 0 0 0 .9-1.4L12.8 4.8zm-.8 3.5l1.8 3.2h-3.6l1.8-3.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Zendesk Brand Logo SVG
 */
export function ZendeskLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 4v8c4.4 0 8-3.6 8-8h-8z" fill="#03363D" />
      <path d="M12 12v8c-4.4 0-8-3.6-8-8h8z" fill="#03363D" />
      <path d="M4 4h8L4 12V4z" fill="#03363D" />
      <path d="M20 20h-8l8-8v8z" fill="#03363D" />
    </svg>
  );
}

/**
 * Custom REST API / Webhook Logo SVG
 */
export function CustomApiLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#7C3AED" />
      <path
        d="M8 8.5L4.5 12 8 15.5M16 8.5L19.5 12 16 15.5M13.5 6.5l-3 11"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Google Maps Location Pin SVG
 */
export function GoogleMapsLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      <circle cx="12" cy="9" r="3.2" fill="#FFFFFF" />
      <path
        d="M12 2c-3.87 0-7 3.13-7 7 0 1.9.7 3.7 1.8 5.1L12 9V2z"
        fill="#4285F4"
        fillOpacity="0.25"
      />
    </svg>
  );
}

/**
 * Reddit Snoo Logo SVG
 */
export function RedditLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#FF4500" />
      <path
        d="M19.5 11.2a1.8 1.8 0 0 0-2.8-1.5 6.7 6.7 0 0 0-4.2-1.3l.9-4 2.8.6a1.3 1.3 0 1 0 .2-.7l-3.3-.7a.4.4 0 0 0-.4.3L11.5 8.4a6.7 6.7 0 0 0-4.2 1.3 1.8 1.8 0 0 0-1.8 3c0 .4 0 .8.1 1.2 0 2.5 3 4.5 6.7 4.5s6.7-2 6.7-4.5c0-.4 0-.8-.1-1.2.4-.4.6-.9.6-1.5zm-10.7.8a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2zm6.4 4.5c-.8.8-2.3.9-3.2.9-.9 0-2.4-.1-3.2-.9a.4.4 0 1 1 .6-.6c.5.5 1.7.7 2.6.7.9 0 2.1-.2 2.6-.7a.4.4 0 0 1 .6.6zm-.4-3.3a1.2 1.2 0 1 1 1.2-1.2 1.2 1.2 0 0 1-1.2 1.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Swiggy Official Orange Brand Logo SVG
 */
export function SwiggyLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FC8019" />
      <path
        d="M12 4.2C9.1 4.2 6.8 6.5 6.8 9.4c0 4.1 4.9 9.9 5.2 10.2.1.1.3.1.4 0 .3-.3 5.2-6.1 5.2-10.2 0-2.9-2.3-5.2-5.2-5.2zm0 7.4a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Zomato Official Red Brand Logo SVG
 */
export function ZomatoLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#E23744" />
      <path
        d="M6 7.5h12l-7 9.5h7V19H6l7-9.5H6V7.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * In-Store POS / Kiosk / Tablet Logo SVG
 */
export function InStorePosLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#0D9488" />
      <rect x="5.5" y="4.5" width="13" height="15" rx="2" stroke="#FFFFFF" strokeWidth="1.6" />
      <path d="M9 16.5h6" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.2" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Universal Source Logo Resolver
 */
export default function SourceLogo({
  source,
  name,
  type,
  icon,
  className = "w-5 h-5",
}) {
  const key = `${source || ""} ${type || ""} ${name || ""} ${icon || ""}`.toLowerCase();

  if (key.includes("youtube")) {
    return <YouTubeLogo className={className} />;
  }

  if (key.includes("play") || key.includes("google_play") || key.includes("play_store") || key.includes("android")) {
    return <GooglePlayLogo className={className} />;
  }

  if (key.includes("app_store") || key.includes("appstore") || key.includes("apple") || key.includes("ios")) {
    return <AppStoreLogo className={className} />;
  }

  if (key.includes("zendesk") || key.includes("support")) {
    return <ZendeskLogo className={className} />;
  }

  if (key.includes("custom_api") || key.includes("api") || key.includes("webhook")) {
    return <CustomApiLogo className={className} />;
  }

  if (key.includes("maps") || key.includes("google_maps") || key.includes("places")) {
    return <GoogleMapsLogo className={className} />;
  }

  if (key.includes("swiggy")) {
    return <SwiggyLogo className={className} />;
  }

  if (key.includes("zomato")) {
    return <ZomatoLogo className={className} />;
  }

  if (key.includes("pos") || key.includes("in_store") || key.includes("kiosk") || key.includes("tablet") || key.includes("store")) {
    return <InStorePosLogo className={className} />;
  }

  if (key.includes("reddit")) {
    return <RedditLogo className={className} />;
  }

  // If icon is an image URL that starts with http or /
  if (typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("/assets") || icon.startsWith("/"))) {
    return <img src={icon} alt={name || "Source logo"} className={`${className} object-contain`} />;
  }

  return <Globe className={`${className} text-[#71717A]`} />;
}
