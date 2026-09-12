export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 haven-bg" aria-hidden="true">
      <div className="absolute left-1/2 top-[-8%] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-mist/20 blur-[90px]" />
      <div className="absolute bottom-[8%] left-[-10%] h-[280px] w-[280px] rounded-full bg-fog/10 blur-[80px]" />
      <div className="absolute bottom-[18%] right-[-8%] h-[240px] w-[240px] rounded-full bg-mist/15 blur-[70px]" />
      <div className="absolute inset-0 opacity-[0.28] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" />
    </div>
  );
}

export function HavenMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="font-display text-6xl italic text-fog">Haven</p>
      {subtitle ? <p className="mt-4 max-w-xs text-sm text-mist">{subtitle}</p> : null}
    </div>
  );
}
