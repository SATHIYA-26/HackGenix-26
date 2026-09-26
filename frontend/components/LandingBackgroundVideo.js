"use client";

import { useEffect, useState } from "react";

export default function LandingBackgroundVideo({ isActive }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isActive) {
      document.body.classList.add("landing-video-active");
    } else {
      document.body.classList.remove("landing-video-active");
    }

    return () => {
      document.body.classList.remove("landing-video-active");
    };
  }, [isActive]);

  if (!isActive || !isMounted) {
    return null;
  }

  return (
    <div className="landing-bg-video-wrapper" aria-hidden="true">
      <div className="landing-bg-video-inner">
        <iframe
          className="landing-bg-video-iframe"
          src="https://www.youtube-nocookie.com/embed/EEX0EHTTePE?autoplay=1&mute=1&loop=1&playlist=EEX0EHTTePE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1"
          title="Ambient Landing Background Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          tabIndex="-1"
        />
      </div>

      {/* Cinematic Vignette & Ambient Darkness Overlay for pristine readability and contrast */}
      <div className="landing-bg-video-overlay" />
    </div>
  );
}
