interface CarlogsLogoProps {
  textClassName?: string;
}

export function CarlogsLogo({ textClassName = "text-lg font-bold text-foreground sm:text-xl" }: CarlogsLogoProps) {
  return (
    <span className="flex items-center gap-1">
      <svg
        width="34"
        height="30"
        viewBox="-5 -5 46 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="rotate(-28 18 17)">
          {/* Filled circle — top-left */}
          <circle cx="9" cy="8" r="7" fill="#1a1aff" />
          {/* Diagonal slash — lower, going from bottom-left to upper-right */}
          <line
            x1="5"
            y1="27"
            x2="29"
            y2="11"
            stroke="#1a1aff"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className={textClassName}>carlogs.lk</span>
    </span>
  );
}
