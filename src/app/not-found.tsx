import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-background-subtle px-4 py-16">
        <div className="flex w-full max-w-md flex-col items-center gap-10 text-center">
          {/* ── Illustration ─────────────────────────────────────────── */}
          <svg viewBox="0 0 400 200" className="w-full max-w-sm" aria-hidden="true">
            <defs>
              <linearGradient id="nf-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0f5ff" />
                <stop offset="100%" stopColor="#e8effd" />
              </linearGradient>
            </defs>

            {/* Sky */}
            <rect width="400" height="200" fill="url(#nf-sky)" rx="16" />

            {/* Distant hills */}
            <ellipse cx="48" cy="132" rx="72" ry="28" fill="#e0e9ff" opacity="0.55" />
            <ellipse cx="352" cy="127" rx="78" ry="30" fill="#dde8ff" opacity="0.5" />

            {/* Ground */}
            <rect x="0" y="153" width="400" height="47" fill="#f1f5f9" />
            {/* Road surface */}
            <rect x="0" y="156" width="400" height="44" fill="#e2e8f0" />
            {/* Road edge line */}
            <rect x="0" y="156" width="400" height="2" fill="#cbd5e1" />
            {/* Centre dashes (stop before barrier) */}
            {[6, 66, 126, 186, 246].map((x) => (
              <rect
                key={x}
                x={x}
                y="176"
                width="40"
                height="4"
                rx="2"
                fill="white"
                opacity="0.75"
              />
            ))}

            {/* ── Barrier ─────────────────────────────────────────── */}
            {/* Posts */}
            <rect x="344" y="139" width="5" height="18" rx="2" fill="#94a3b8" />
            <rect x="383" y="139" width="5" height="18" rx="2" fill="#94a3b8" />
            {/* Beam */}
            <rect x="339" y="153" width="56" height="13" rx="3" fill="#f97316" />
            {/* Stripes */}
            {[339, 355, 371, 387].map((x) => (
              <rect key={x} x={x} y="153" width="9" height="13" fill="#0f172a" opacity="0.18" />
            ))}

            {/* ── NOT FOUND sign ──────────────────────────────────── */}
            {/* Post */}
            <rect x="361" y="72" width="5" height="83" fill="#94a3b8" />
            {/* Board */}
            <rect
              x="334"
              y="42"
              width="64"
              height="38"
              rx="5"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Red band */}
            <rect x="334" y="42" width="64" height="11" rx="5" fill="#ef4444" />
            <rect x="334" y="48" width="64" height="5" fill="#ef4444" />
            {/* Text */}
            <text
              x="366"
              y="64"
              textAnchor="middle"
              fill="#0f172a"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui,sans-serif"
            >
              NOT
            </text>
            <text
              x="366"
              y="76"
              textAnchor="middle"
              fill="#0f172a"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui,sans-serif"
            >
              FOUND
            </text>

            {/* ── Car shadow ──────────────────────────────────────── */}
            <ellipse cx="205" cy="160" rx="96" ry="6" fill="rgba(0,0,0,0.07)" />

            {/* ═══ CAR (facing right — front at high x) ═══════════ */}

            {/* Body */}
            <rect x="107" y="116" width="202" height="46" rx="10" fill="#3b5bdb" />

            {/* Cabin / roofline */}
            <path
              d="M 142,116 L 153,78 Q 156,72 164,72 L 289,72 Q 297,72 300,78 L 308,116 Z"
              fill="#3b5bdb"
            />

            {/* Rear window */}
            <path d="M 155,113 L 163,76 L 216,76 L 216,113 Z" fill="#93c5fd" opacity="0.88" />
            {/* Front window */}
            <path d="M 222,76 L 291,76 L 299,113 L 222,113 Z" fill="#93c5fd" opacity="0.88" />
            {/* B-pillar */}
            <rect x="216" y="76" width="6" height="37" fill="#2a4bbf" />

            {/* Waistline crease */}
            <rect
              x="107"
              y="136"
              width="202"
              height="2.5"
              rx="1.25"
              fill="#2a4bbf"
              opacity="0.45"
            />

            {/* Door line */}
            <line
              x1="223"
              y1="117"
              x2="223"
              y2="159"
              stroke="#2a4bbf"
              strokeWidth="1.5"
              opacity="0.45"
            />
            {/* Door handle */}
            <rect x="196" y="130" width="18" height="4" rx="2" fill="#2a4bbf" opacity="0.55" />

            {/* Front bumper */}
            <rect x="304" y="129" width="14" height="20" rx="5" fill="#2a4bbf" />
            {/* Headlight */}
            <rect x="304" y="120" width="11" height="14" rx="3" fill="#fef9c3" />
            <rect x="304" y="120" width="11" height="7" rx="2" fill="#fde68a" />

            {/* Rear bumper */}
            <rect x="98" y="129" width="14" height="20" rx="5" fill="#2a4bbf" />
            {/* Tail light */}
            <rect x="99" y="120" width="11" height="14" rx="3" fill="#fca5a5" />
            <rect x="99" y="120" width="11" height="7" rx="2" fill="#ef4444" />

            {/* Rear wheel */}
            <circle cx="162" cy="160" r="22" fill="#1e293b" />
            <circle cx="162" cy="160" r="13" fill="#475569" />
            <line x1="162" y1="147" x2="162" y2="173" stroke="#1e293b" strokeWidth="3" />
            <line x1="149" y1="160" x2="175" y2="160" stroke="#1e293b" strokeWidth="3" />
            <line x1="153" y1="151" x2="171" y2="169" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="171" y1="151" x2="153" y2="169" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="162" cy="160" r="5" fill="#94a3b8" />

            {/* Front wheel */}
            <circle cx="284" cy="160" r="22" fill="#1e293b" />
            <circle cx="284" cy="160" r="13" fill="#475569" />
            <line x1="284" y1="147" x2="284" y2="173" stroke="#1e293b" strokeWidth="3" />
            <line x1="271" y1="160" x2="297" y2="160" stroke="#1e293b" strokeWidth="3" />
            <line x1="275" y1="151" x2="293" y2="169" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="293" y1="151" x2="275" y2="169" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="284" cy="160" r="5" fill="#94a3b8" />

            {/* ── Question mark bubble above car ──────────────────── */}
            <rect
              x="228"
              y="30"
              width="38"
              height="30"
              rx="8"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Bubble tail */}
            <polygon points="248,60 242,68 254,60" fill="white" />
            <polygon points="249,61 242,68 255,61" fill="#e2e8f0" />
            <text
              x="247"
              y="51"
              textAnchor="middle"
              fill="#3b5bdb"
              fontSize="18"
              fontWeight="900"
              fontFamily="system-ui,sans-serif"
            >
              ?
            </text>
          </svg>

          {/* ── Copy ─────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary-500 uppercase">
              Error 404
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Looks like a wrong turn.
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-foreground-muted">
              This road leads nowhere. The page you&apos;re looking for doesn&apos;t exist, was
              removed, or the URL might be wrong.
            </p>
          </div>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Homepage
            </Link>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background-subtle active:bg-border"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
