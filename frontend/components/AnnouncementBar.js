"use client";

export default function AnnouncementBar({ onScrollToSection }) {
  return (
    <div className="top-announcement-bar">
      <div className="announcement-content">
        <span className="announcement-sparkle">✦</span>
        <span className="announcement-text">
          Meet <strong>Reviewr AI</strong>, the AI agent for customer feedback analysis, built to think like a seasoned analyst.
        </span>
        <a
          href="#whatWeDoSection"
          className="announcement-link"
          onClick={(e) => {
            e.preventDefault();
            if (onScrollToSection) onScrollToSection("whatWeDoSection");
          }}
        >
          Learn more →
        </a>
      </div>
    </div>
  );
}
