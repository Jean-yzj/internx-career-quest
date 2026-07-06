// Mascot.tsx — 藍藍吉祥物，三種表情 variant
export type MascotVariant = 'happy' | 'cheer' | 'think';

interface MascotProps {
  size?: number;
  variant?: MascotVariant;
  className?: string;
}

export default function Mascot({ size = 80, variant = 'happy', className = '' }: MascotProps) {
  // mouth path by variant
  const mouthPath =
    variant === 'cheer'
      ? 'M52 61c3.5 5 12.5 5 16 0'
      : variant === 'think'
      ? 'M56 60c2 1 6 1 8 0'
      : 'M54 59c3 3 9 3 12 0';

  // brow lines for 'think'
  const browLines =
    variant === 'think' ? (
      <>
        <path d="M44 44c2-2 5-2 7 0" stroke="#1A2733" strokeWidth="2" strokeLinecap="round" />
        <path d="M69 44c2-2 5-2 7 0" stroke="#1A2733" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : null;

  // fin positions
  const leftFin =
    variant === 'cheer'
      ? 'M28 56c-10 0-14-6-12-12 6-2 12 2 14 8 0 1.5 0 3-2 4z'
      : variant === 'think'
      ? 'M30 72c-8-4-10-12-6-16 5 0 10 4 10 10 0 2-1 5-4 6z'
      : 'M28 62c-8 2-12 8-10 12 6 2 12-2 14-8z';

  const rightFin =
    variant === 'cheer'
      ? 'M92 56c10 0 14-6 12-12-6-2-12 2-14 8 0 1.5 0 3 2 4z'
      : variant === 'think'
      ? 'M90 62c8 2 12 8 10 12-6 2-12-2-14-8z'
      : 'M92 62c8 2 12 8 10 12-6 2-12-2-14-8z';

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* shadow */}
      <ellipse cx="60" cy="100" rx="30" ry="6" fill="#0F5BBD" opacity=".12" />
      {/* body */}
      <path
        d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z"
        fill="#4DA3FF"
        stroke="#1861A8"
        strokeWidth="3"
      />
      {/* belly */}
      <path
        d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z"
        fill="#EAF4FF"
      />
      {/* left fin */}
      <path d={leftFin} fill="#4DA3FF" stroke="#1861A8" strokeWidth="3" strokeLinejoin="round" />
      {/* right fin */}
      <path d={rightFin} fill="#4DA3FF" stroke="#1861A8" strokeWidth="3" strokeLinejoin="round" />
      {/* eyes */}
      <circle cx="48" cy="50" r="4" fill="#1A2733" />
      <circle cx="72" cy="50" r="4" fill="#1A2733" />
      {/* eye shines */}
      <circle cx="50" cy="48" r="1.5" fill="#fff" />
      <circle cx="74" cy="48" r="1.5" fill="#fff" />
      {/* brows (think only) */}
      {browLines}
      {/* mouth */}
      <path d={mouthPath} stroke="#1A2733" strokeWidth="3" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="40" cy="57" r="4" fill="#FF9FB0" opacity=".7" />
      <circle cx="80" cy="57" r="4" fill="#FF9FB0" opacity=".7" />
      {/* antenna */}
      <path d="M56 15c2-6 8-6 8 0" stroke="#1861A8" strokeWidth="3" strokeLinecap="round" />
      {/* star badge */}
      <path
        d="M60 72l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"
        fill="#FFC93C"
        stroke="#E8A800"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
