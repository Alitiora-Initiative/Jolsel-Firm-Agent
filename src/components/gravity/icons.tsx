const common = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AgentIcon({ name }: { name: string }) {
  switch (name) {
    case "radar":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12 L18 8" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "waves":
      return (
        <svg {...common}>
          <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
          <path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 15l3-4 3 2 5-7" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M4 16l6-6 4 4 6-8" />
          <path d="M14 6h6v6" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5 L10 14l-.5-3.5z" fill="currentColor" />
        </svg>
      );
    case "timer":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7" />
          <path d="M12 13V9M9 4h6" />
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          <path d="M9 7a3 3 0 0 1 6 0 3 3 0 0 1 2 5 3 3 0 0 1-2 5H9a3 3 0 0 1-2-5 3 3 0 0 1 2-5z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4-4" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3l9 16H3z" />
          <path d="M12 10v4M12 16.5v.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6z" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
    case "scale":
      return (
        <svg {...common}>
          <path d="M12 3v18M5 8h14M7 8l-3 6h6zm10 0l-3 6h6z" />
        </svg>
      );
    case "badge":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M8.5 12.5l2.2 2.2 4.8-5" />
        </svg>
      );
    case "swap":
      return (
        <svg {...common}>
          <path d="M7 7h11l-3-3M17 17H6l3 3" />
        </svg>
      );
    case "db":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 18l4-8 3 4 3-6 6 10" />
        </svg>
      );
  }
}
