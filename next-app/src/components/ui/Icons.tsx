import React from "react";
import type { IconName } from "@/lib/types";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

export function QrewIcon({ name, size, className, "aria-hidden": ariaHidden = true }: IconProps) {
  const s = (defaultSize: number) => size ?? defaultSize;

  switch (name) {
    case "overview":
      return (
        <svg width={s(18)} height={s(18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      );
    case "tenants":
    case "building2":
      return (
        <svg width={s(name === "building2" ? 16 : 18)} height={s(name === "building2" ? 16 : 18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
        </svg>
      );
    case "offices":
      return (
        <svg width={s(18)} height={s(18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          <path d="M9 9h1" />
          <path d="M9 13h1" />
          <path d="M9 17h1" />
          <path d="M14 9h1" />
          <path d="M14 13h1" />
          <path d="M14 17h1" />
        </svg>
      );
    case "users":
      return (
        <svg width={s(18)} height={s(18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "department":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "roles":
      return (
        <svg width={s(18)} height={s(18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "audit":
      return (
        <svg width={s(18)} height={s(18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "search":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "plus":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      );
    case "edit":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      );
    case "trash":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      );
    case "close":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "chevronRight":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "bell":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "menu":
      return (
        <svg width={s(18)} height={s(18)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      );
    case "info":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
    case "alert":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "power":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      );
    case "pause":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      );
    case "play":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "phone":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "check":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "refresh":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      );
    case "settings":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "building":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <line x1="8" y1="6" x2="8.01" y2="6" />
          <line x1="16" y1="6" x2="16.01" y2="6" />
          <line x1="8" y1="10" x2="8.01" y2="10" />
          <line x1="16" y1="10" x2="16.01" y2="10" />
          <line x1="8" y1="14" x2="8.01" y2="14" />
          <line x1="16" y1="14" x2="16.01" y2="14" />
        </svg>
      );
    case "file":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "dollar":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "shield":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "invoice":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V4a2 2 0 0 0-2-2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="16" y2="11" />
          <line x1="8" y1="15" x2="12" y2="15" />
        </svg>
      );
    case "activity":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "layers":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "globe":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "folder":
    case "folderClosed":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
      );
    case "folderOpen":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "mapPin":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "expand":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" x2="14" y1="3" y2="10" />
          <line x1="3" x2="10" y1="21" y2="14" />
        </svg>
      );
    case "collapse":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" x2="21" y1="10" y2="3" />
          <line x1="3" x2="10" y1="21" y2="14" />
        </svg>
      );
    case "moreHorizontal":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      );
    case "moreVertical":
      return (
        <svg width={s(16)} height={s(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      );
    case "archive":
      return (
        <svg width={s(14)} height={s(14)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <rect width="20" height="5" x="2" y="3" rx="1" />
          <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
          <path d="M10 12h4" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    case "moon":
      return (
        <svg width={s(15)} height={s(15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaHidden}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    default:
      return null;
  }
}
